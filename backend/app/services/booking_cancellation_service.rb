# frozen_string_literal: true

# Booking Cancellation Service
# Handles booking cancellation with OBS integration
class BookingCancellationService
  include ActiveModel::Model
  include ActiveModel::Attributes

  attribute :booking, :object
  attribute :user, :object

  def initialize(booking:, user:)
    super()
    @booking = booking
    @user = user
    @obs_adapter = ObsAdapter.new(user_id: user.id)
  end

  def call
    validate_cancellation_allowed!
    cancel_with_obs
    update_booking_status
    success_result
  rescue StandardError => e
    error_result(e.message)
  end

  private

  def validate_cancellation_allowed!
    if @booking.confirmed? && !@booking.can_be_cancelled?
      raise StandardError, 'Cannot cancel confirmed booking after 24 hours'
    end
  end

  def cancel_with_obs
    @obs_adapter.cancel_booking(@booking.obs_booking_hash)
  end

  def update_booking_status
    @booking.update!(
      status: 'cancelled',
      cancelled_at: Time.current
    )
  end

  def success_result
    {
      success: true,
      message: 'Booking cancelled successfully'
    }
  end

  def error_result(message)
    {
      success: false,
      error: message
    }
  end
end
