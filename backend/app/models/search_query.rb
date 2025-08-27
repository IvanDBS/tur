# SearchQuery model for storing OBS search requests
class SearchQuery < ApplicationRecord
  # Associations
  belongs_to :user, optional: true
  has_many :bookings, dependent: :destroy
  
  # Validations
  validates :search_params, presence: true
  validates :obs_search_id, presence: true, uniqueness: true
  
  # Callbacks
  before_validation :generate_obs_search_id, on: :create
  
  # Scopes
  scope :recent, -> { order(created_at: :desc) }
  scope :by_user, ->(user) { where(user: user) }
  
  # Instance methods
  def search_params_hash
    @search_params_hash ||= JSON.parse(search_params) rescue {}
  end
  
  def search_params_hash=(hash)
    self.search_params = hash.to_json
    @search_params_hash = hash
  end
  
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
