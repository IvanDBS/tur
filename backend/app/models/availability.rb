# Availability model for package availability
class Availability < ApplicationRecord
  # Validations
  validates :date, presence: true
  validates :status, presence: true, inclusion: { in: %w[available unavailable limited] }
  validates :capacity, numericality: { greater_than: 0 }, allow_nil: true
  validates :package_id, uniqueness: { scope: :date }

  # Associations
  belongs_to :package

  # Scopes
  scope :available, -> { where(status: 'available') }
  scope :by_date_range, ->(start_date, end_date) { where(date: start_date..end_date) }
  scope :future, -> { where(date: Date.current..) }

  # Instance methods
  def available?
    status == 'available'
  end

  def limited?
    status == 'limited'
  end

  def unavailable?
    status == 'unavailable'
  end
end
