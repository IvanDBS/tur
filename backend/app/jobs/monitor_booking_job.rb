# Job for monitoring and managing pending bookings
class MonitorBookingJob < ApplicationJob
  queue_as :default

  # Retry configuration
  sidekiq_options retry: 2, backtrace: 20

  # Hold time for bookings (in minutes)
  BOOKING_HOLD_TIME = 15.minutes
  BOOKING_EXPIRY_TIME = 24.hours

  def perform(booking_id = nil)
    Rails.logger.info "Starting booking monitoring for booking: #{booking_id || 'all pending'}"

    bookings = booking_id ? [Booking.find(booking_id)] : Booking.pending

    bookings.each do |booking|
      process_booking(booking)
    rescue StandardError => e
      Rails.logger.error "Failed to process booking #{booking.id}: #{e.message}"
      # Continue with other bookings
    end

    Rails.logger.info 'Completed booking monitoring'
  end

  private

  def process_booking(booking)
    case booking.status
    when 'pending'
      handle_pending_booking(booking)
    when 'confirmed'
      handle_confirmed_booking(booking)
    else
      Rails.logger.debug { "Skipping booking #{booking.id} with status: #{booking.status}" }
    end
  end

  def handle_pending_booking(booking)
    if booking_expired?(booking)
      cancel_expired_booking(booking)
    elsif booking_hold_expiring?(booking)
      extend_booking_hold(booking)
    else
      check_booking_status(booking)
    end
  end

  def handle_confirmed_booking(booking)
    # Check if confirmed booking needs any updates
    check_booking_status(booking)
  end

  def booking_expired?(booking)
    return false unless booking.expires_at

    booking.expires_at < Time.current
  end

  def booking_hold_expiring?(booking)
    return false unless booking.expires_at

    booking.expires_at < 5.minutes.from_now
  end

  def cancel_expired_booking(booking)
    Rails.logger.info "Cancelling expired booking #{booking.id}"

    adapter = ObsAdapter.new

    begin
      # Try to cancel on OBS side
      adapter.cancel_booking(booking.obs_booking_hash)
    rescue ObsApiService::ApiError => e
      Rails.logger.warn "Failed to cancel booking #{booking.id} on OBS: #{e.message}"
    end

    # Update local status
    booking.update!(
      status: 'cancelled',
      cancelled_at: Time.current
    )

    # Notify user (could trigger email job)
    # NotifyBookingCancelledJob.perform_later(booking.id)
  end

  def extend_booking_hold(booking)
    Rails.logger.info "Extending hold for booking #{booking.id}"

    adapter = ObsAdapter.new

    begin
      # Check if booking can be extended
      booking_data = adapter.booking_status(booking.obs_booking_hash)

      if booking_can_be_extended?(booking_data)
        new_expiry = Time.current + BOOKING_HOLD_TIME
        booking.update!(expires_at: new_expiry)

        Rails.logger.info "Extended booking #{booking.id} until #{new_expiry}"
      else
        Rails.logger.warn "Cannot extend booking #{booking.id}, will expire soon"
      end
    rescue ObsApiService::ApiError => e
      Rails.logger.error "Failed to extend booking #{booking.id}: #{e.message}"
    end
  end

  def check_booking_status(booking)
    adapter = ObsAdapter.new

    begin
      booking_data = adapter.booking_status(booking.obs_booking_hash)

      # Update booking based on OBS status
      update_booking_from_obs_data(booking, booking_data)
    rescue ObsApiService::ApiError => e
      Rails.logger.error "Failed to check status for booking #{booking.id}: #{e.message}"
    end
  end

  def booking_can_be_extended?(booking_data)
    # Logic to determine if booking can be extended
    # Based on OBS API response structure
    return false unless booking_data.is_a?(Hash)

    status = booking_data['status'] || booking_data[:status]
    ['pending', 'hold'].include?(status)
  end

  def update_booking_from_obs_data(booking, obs_data)
    return unless obs_data.is_a?(Hash)

    obs_status = obs_data['status'] || obs_data[:status]

    case obs_status
    when 'confirmed'
      booking.update!(
        status: 'confirmed',
        confirmed_at: Time.current
      )
      Rails.logger.info "Booking #{booking.id} confirmed via OBS"
    when 'cancelled'
      booking.update!(
        status: 'cancelled',
        cancelled_at: Time.current
      )
      Rails.logger.info "Booking #{booking.id} cancelled via OBS"
    else
      # Status unchanged - booking is still pending
      Rails.logger.debug { "Booking #{booking.id} status unchanged: #{obs_status}" }
    end
  end
end
