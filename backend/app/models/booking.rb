# Booking model for OBS tour bookings
class Booking < ApplicationRecord
  include JsonFieldSupport
  
  # Enable optimistic locking
  self.locking_column = :lock_version
  
  # Associations
  belongs_to :user
  belongs_to :search_query, optional: true
  
  # JSON fields with caching
  json_field :tour_details, cache_expires_in: 1.hour
  json_field :customer_data, cache_expires_in: 1.hour

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
      # Use find_or_create_by for atomic operation
      ActiveRecord::Base.transaction do
        # First check if any pending booking exists for this hash (across all users)
        pending_booking = where(obs_booking_hash: booking_hash, status: 'pending').lock.first
        
        if pending_booking
          Rails.logger.warn "Pending booking already exists for hash #{booking_hash}"
          return { success: false, booking: nil, error: 'Tour is already being booked by another user' }
        end
        
        # Use find_or_create_by to handle race conditions atomically
        booking = find_or_create_by(user: user, obs_booking_hash: booking_hash) do |b|
          b.assign_attributes(attributes)
        end
        
        if booking.persisted? && booking.previously_new_record?
          Rails.logger.info "Booking created successfully: #{booking.id}"
          { success: true, booking: booking, error: nil }
        elsif booking.persisted?
          Rails.logger.warn "Booking already exists for user #{user.id} and hash #{booking_hash}"
          { success: false, booking: booking, error: 'Booking already exists' }
        else
          Rails.logger.error "Failed to create booking: #{booking.errors.full_messages.join(', ')}"
          { success: false, booking: booking, error: booking.errors.full_messages.join(', ') }
        end
      end
    rescue ActiveRecord::RecordNotUnique => e
      Rails.logger.error "Race condition detected: #{e.message}"
      # Try to find the existing booking
      existing_booking = find_by(user: user, obs_booking_hash: booking_hash)
      { success: false, booking: existing_booking, error: 'Booking conflict detected. Please try again.' }
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
