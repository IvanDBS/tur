# Booking model for OBS tour bookings
class Booking < ApplicationRecord
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
