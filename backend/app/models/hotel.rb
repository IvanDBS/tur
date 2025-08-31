# Hotel model
class Hotel < ApplicationRecord
  # Validations
  validates :name, presence: true
  validates :stars, inclusion: { in: 1..5 }, allow_nil: true
  validates :obs_id, uniqueness: true, allow_nil: true

  # Associations
  has_many :packages, dependent: :destroy

  # Scopes
  scope :by_stars, ->(stars) { where(stars: stars) }
  scope :by_region, ->(region) { where(region: region) }

  # Instance methods
  def stars_display
    return 'N/A' unless stars

    "#{stars}*"
  end
end
