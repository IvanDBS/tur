# SearchQuery model for storing OBS search requests
class SearchQuery < ApplicationRecord
  include JsonFieldSupport
  
  # Associations
  belongs_to :user, optional: true
  has_many :bookings, dependent: :destroy
  
  # JSON fields with caching
  json_field :search_params, cache_expires_in: 30.minutes
  json_field :search_results, cache_expires_in: 30.minutes

  # Validations
  validates :search_params, presence: true
  validates :obs_search_id, presence: true, uniqueness: true

  # Callbacks
  before_validation :generate_obs_search_id, on: :create

  # Scopes
  scope :recent, -> { order(created_at: :desc) }
  scope :by_user, ->(user) { where(user: user) }

  # Instance methods

  def expired?
    created_at < 1.hour.ago
  end

  def results_count
    search_results&.dig('results')&.size || 0
  end

  private

  def generate_obs_search_id
    self.obs_search_id ||= SecureRandom.uuid
  end
end
