# Package model for tour packages
class Package < ApplicationRecord
  # Validations
  validates :name, presence: true
  validates :price, presence: true, numericality: { greater_than: 0 }
  validates :obs_id, uniqueness: true, allow_nil: true

  # Associations
  belongs_to :hotel
  has_many :availabilities, dependent: :destroy
  has_many :bookings, dependent: :destroy

  # Scopes
  scope :by_price_range, ->(min, max) { where(price: min..max) }
  scope :available, -> { joins(:availabilities).where(availabilities: { status: 'available' }) }

  # Instance methods
  def available_dates
    availabilities.where(status: 'available').pluck(:date)
  end

  def price_display
    "#{price} EUR"
  end
end
