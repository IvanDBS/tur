# Booking model for OBS tour bookings
class Booking < ApplicationRecord
  # Associations
  belongs_to :user
  belongs_to :package
  
  # Validations
  validates :obs_booking_id, presence: true, uniqueness: true
  validates :status, presence: true, inclusion: { in: %w[pending confirmed cancelled failed] }
  
  # Callbacks
  before_validation :generate_obs_booking_id, on: :create
  before_validation :set_default_status, on: :create
  
  # Scopes
  scope :by_user, ->(user) { where(user: user) }
  scope :by_status, ->(status) { where(status: status) }
  scope :recent, -> { order(created_at: :desc) }
  scope :expired, -> { where('expires_at < ?', Time.current) }
  
  # Instance methods
  def raw_data_hash
    @raw_data_hash ||= JSON.parse(raw_json) rescue {}
  end
  
  def raw_data_hash=(hash)
    self.raw_json = hash.to_json
    @raw_data_hash = hash
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
  
  def generate_obs_booking_id
    self.obs_booking_id ||= SecureRandom.uuid
  end
  
  def set_default_status
    self.status ||= 'pending'
  end
end
