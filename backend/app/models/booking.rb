# Booking model for OBS tour bookings
class Booking < ApplicationRecord
  # Enable optimistic locking
  self.locking_column = :lock_version
  
  # Associations
  belongs_to :user
  belongs_to :search_query, optional: true

  # Constants
  INTERNAL_STATUSES = %w[
    pending
    processing
    confirmed
    changed
    cancelled
    failed
    expired
  ].freeze

  # OBS API status mapping
  OBS_STATUS_MAPPING = {
    'wait' => 'pending',
    'changed' => 'changed',
    'confirmed' => 'confirmed',
    'canceling' => 'processing',
    'canceled' => 'cancelled',
    'not_confirmed' => 'failed',
    'penalty' => 'failed'
  }.freeze

  # Validations
  validates :obs_booking_hash, presence: true, uniqueness: true
  validates :status, presence: true, inclusion: { in: INTERNAL_STATUSES }

  # Callbacks
  before_validation :set_default_status, on: :create

  # Scopes
  scope :by_user, ->(user) { where(user: user) }
  scope :by_status, ->(status) { where(status: status) }
  scope :recent, -> { order(created_at: :desc) }
  scope :expired, -> { where(expires_at: ...Time.current) }

  # Instance methods
  def tour_details_hash
    @tour_details_hash ||= begin
      if tour_details.is_a?(String)
        JSON.parse(tour_details)
      elsif tour_details.is_a?(Hash)
        tour_details
      else
        {}
      end
    rescue StandardError
      {}
    end
  end

  def tour_details_hash=(hash)
    self.tour_details = hash.to_json
    @tour_details_hash = hash
  end

  def customer_data_hash
    @customer_data_hash ||= begin
      if customer_data.is_a?(String)
        JSON.parse(customer_data)
      elsif customer_data.is_a?(Hash)
        customer_data
      else
        {}
      end
    rescue StandardError
      {}
    end
  end

  def customer_data_hash=(hash)
    self.customer_data = hash.to_json
    @customer_data_hash = hash
  end

  def confirmed?
    status == 'confirmed'
  end

  def pending?
    status == 'pending'
  end

  def cancelled?
    status == 'cancelled'
  end

  def failed?
    status == 'failed'
  end

  def can_be_cancelled?
    confirmed? && created_at > 24.hours.ago
  end

  # Class methods for race condition protection
  class << self
    # Safely create booking with race condition protection
    def create_safely(user:, booking_hash:, **attributes)
      # Use pessimistic locking to prevent race conditions
      ActiveRecord::Base.transaction do
        # Check if booking already exists for this user and hash
        existing_booking = where(user: user, obs_booking_hash: booking_hash).lock.first
        
        if existing_booking
          Rails.logger.warn "Booking already exists for user #{user.id} and hash #{booking_hash}"
          return { success: false, booking: existing_booking, error: 'Booking already exists' }
        end
        
        # Check if any pending booking exists for this hash (across all users)
        pending_booking = where(obs_booking_hash: booking_hash, status: 'pending').lock.first
        
        if pending_booking
          Rails.logger.warn "Pending booking already exists for hash #{booking_hash}"
          return { success: false, booking: nil, error: 'Tour is already being booked by another user' }
        end
        
        # Create new booking
        booking = new(
          user: user,
          obs_booking_hash: booking_hash,
          **attributes
        )
        
        if booking.save
          Rails.logger.info "Booking created successfully: #{booking.id}"
          { success: true, booking: booking, error: nil }
        else
          Rails.logger.error "Failed to create booking: #{booking.errors.full_messages.join(', ')}"
          { success: false, booking: booking, error: booking.errors.full_messages.join(', ') }
        end
      end
    rescue ActiveRecord::RecordNotUnique => e
      Rails.logger.error "Race condition detected: #{e.message}"
      { success: false, booking: nil, error: 'Booking conflict detected. Please try again.' }
    rescue StandardError => e
      Rails.logger.error "Unexpected error in create_safely: #{e.message}"
      { success: false, booking: nil, error: 'Internal error occurred' }
    end
  end

  # OBS status mapping methods
  def self.map_obs_status(obs_status)
    OBS_STATUS_MAPPING[obs_status] || 'unknown'
  end

  def map_obs_status(obs_status)
    self.class.map_obs_status(obs_status)
  end

  def processing?
    status == 'processing'
  end

  def changed?
    status == 'changed'
  end

  def expired?
    status == 'expired' || (expires_at.present? && expires_at < Time.current)
  end

  private

  def set_default_status
    self.status ||= 'pending'
  end
end
