# Booking model for OBS tour bookings
class Booking < ApplicationRecord
  # Associations
  belongs_to :user
  belongs_to :search_query, optional: true

  # Validations
  validates :obs_booking_hash, presence: true, uniqueness: true
  validates :status, presence: true, inclusion: { in: %w[pending confirmed cancelled failed] }

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
      JSON.parse(tour_details)
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
      JSON.parse(customer_data)
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

  def expired?
    expires_at.present? && expires_at < Time.current
  end

  def can_be_cancelled?
    confirmed? && created_at > 24.hours.ago
  end

  private

  def set_default_status
    self.status ||= 'pending'
  end
end
