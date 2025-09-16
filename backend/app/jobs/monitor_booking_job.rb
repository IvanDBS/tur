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
    when 'pending', 'processing'
      handle_pending_booking(booking)
    when 'confirmed', 'changed'
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

    begin
      # Try to cancel on OBS side
      obs_service = ObsApiService.new(
        base_url: ENV['OBS_API_BASE_URL'] || 'https://test-v2.obs.md',
        access_token: ObsSiteAuthService.instance.access_token
      )
      obs_service.cancel_booking(booking.obs_booking_hash)
    rescue ObsApiService::Error => e
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

    begin
      # Check if booking can be extended
      obs_service = ObsApiService.new(
        base_url: ENV['OBS_API_BASE_URL'] || 'https://test-v2.obs.md',
        access_token: ObsSiteAuthService.instance.access_token
      )
      booking_data = obs_service.booking_status(booking.obs_booking_hash)

      if booking_can_be_extended?(booking_data)
        new_expiry = Time.current + BOOKING_HOLD_TIME
        booking.update!(expires_at: new_expiry)

        Rails.logger.info "Extended booking #{booking.id} until #{new_expiry}"
      else
        Rails.logger.warn "Cannot extend booking #{booking.id}, will expire soon"
      end
    rescue ObsApiService::Error => e
      Rails.logger.error "Failed to extend booking #{booking.id}: #{e.message}"
    end
  end

  def check_booking_status(booking)
    begin
      obs_service = ObsApiService.new(
        base_url: ENV['OBS_API_BASE_URL'] || 'https://test-v2.obs.md',
        access_token: ObsSiteAuthService.instance.access_token
      )
      booking_data = obs_service.booking_status(booking.obs_booking_hash)

      # Update booking based on OBS status
      update_booking_from_obs_data(booking, booking_data)
    rescue ObsApiService::Error => e
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

    # Extract OBS status from the response structure
    obs_status = extract_obs_status(obs_data)
    new_internal_status = booking.map_obs_status(obs_status)

    # Prepare updates hash
    updates = {
      operator_status: obs_status,
      last_synced_at: Time.current
    }

    # Update internal status if changed
    if booking.status != new_internal_status
      updates[:status] = new_internal_status
      
      # Set status-specific timestamps
      case new_internal_status
      when 'confirmed'
        updates[:confirmed_at] = Time.current
      when 'cancelled'
        updates[:cancelled_at] = Time.current
      end
    end

    # Extract and update payment data
    if obs_data['payment']
      updates[:payment_data] = obs_data['payment']
    end

    # Extract and update comments data
    if obs_data['comments']
      updates[:comments_data] = obs_data['comments']
    end

    # Extract and update is_checked flag
    if obs_data['info']&.dig('is_checked')
      updates[:is_checked] = obs_data['info']['is_checked']
    end

    # Extract order_id if available
    if obs_data['info']&.dig('order')
      updates[:obs_order_id] = obs_data['info']['order']
    end

    # Update booking if there are changes
    if updates.any?
      booking.update!(updates)
      Rails.logger.info "Updated booking #{booking.id}: status=#{new_internal_status}, obs_status=#{obs_status}"
    else
      Rails.logger.debug { "Booking #{booking.id} status unchanged: #{obs_status}" }
    end
  end

  def extract_obs_status(obs_data)
    # Try different possible locations for status in OBS response
    obs_data['order_status']&.dig('name') ||
    obs_data['info']&.dig('order_status')&.dig('name') ||
    obs_data['status'] ||
    obs_data[:status] ||
    'unknown'
  end
end
