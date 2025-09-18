# frozen_string_literal: true

# Booking Calculation Service
# Handles booking price calculations with OBS integration
class BookingCalculationService
  include ActiveModel::Model
  include ActiveModel::Attributes

  attribute :user, :object
  attribute :booking_hash, :string
  attribute :customer_data, :hash

  def initialize(user:, booking_hash:, customer_data: {})
    super()
    @user = user
    @booking_hash = booking_hash
    @customer_data = customer_data
    @obs_adapter = ObsAdapter.new(user_id: user.id)
  end

  def call
    validate_params!
    calculate_with_obs
  rescue StandardError => e
    error_result(e.message)
  end

  private

  def validate_params!
    raise ArgumentError, 'Booking hash is required' if @booking_hash.blank?
    raise ArgumentError, 'User is required' if @user.blank?
  end

  def calculate_with_obs
    calculation_result = @obs_adapter.calculate_booking(@booking_hash, @customer_data)

    if calculation_result.present? && calculation_result.is_a?(Hash)
      success_result(calculation_result)
    else
      success_result({ message: "No price changes", customer_data: @customer_data })
    end
  end

  def success_result(calculation_details)
    {
      success: true,
      calculation_details: calculation_details
    }
  end

  def error_result(message)
    {
      success: false,
      error: message
    }
  end
end
