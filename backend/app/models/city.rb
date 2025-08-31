# City model for departure/arrival cities
class City < ApplicationRecord
  # Validations
  validates :name, presence: true
  validates :type, presence: true, inclusion: { in: %w[departure arrival] }
  validates :obs_id, uniqueness: true, allow_nil: true

  # Scopes
  scope :departure, -> { where(type: 'departure') }
  scope :arrival, -> { where(type: 'arrival') }

  # Associations
  has_many :packages, through: :hotels
end
