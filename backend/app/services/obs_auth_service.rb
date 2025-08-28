# OBS Authentication Service
# Manages OBS API authentication tokens
class ObsAuthService
  include ActiveModel::Model
  include ActiveModel::Attributes

  attribute :user_id, :integer
  attribute :email, :string
  attribute :password, :string

  def initialize(attributes = {})
    super
    @obs_service = ObsApiService.new
  end

  # Login to OBS API
  def login
    response = @obs_service.login(email, password)
    
    # Store tokens
    store_tokens(response)
    
    response
  end

  # Refresh access token
  def refresh_token
    user = User.find(user_id)
    return false unless user.obs_refresh_token.present?

    response = @obs_service.refresh_token(user.obs_refresh_token)
    
    # Update tokens
    store_tokens(response, user)
    
    response
  rescue ObsApiService::Error
    false
  end

  # Logout from OBS API
  def logout
    user = User.find(user_id)
    return false unless user.obs_access_token.present?

    @obs_service.logout(user.obs_access_token)
    
    # Clear tokens
    clear_tokens(user)
    
    true
  rescue ObsApiService::Error
    false
  end

  # Get valid access token (refresh if needed)
  def valid_access_token
    user = User.find(user_id)
    return user.obs_access_token if user.obs_tokens_valid?

    # Try to refresh
    refresh_token ? user.reload.obs_access_token : nil
  end

  private

  def store_tokens(response, user = nil)
    user ||= User.find(user_id)
    
    # Store in Postgres (encrypted)
    user.update!(
      obs_access_token: response['access_token'],
      obs_refresh_token: response['refresh_token'],
      obs_token_expires_at: Time.current + response['expires_in'].seconds
    )
  end

  def clear_tokens(user)
    # Clear from Postgres
    user.update!(
      obs_access_token: nil,
      obs_refresh_token: nil,
      obs_token_expires_at: nil
    )
  end
end
