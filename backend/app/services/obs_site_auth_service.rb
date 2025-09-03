# OBS Site Authentication Service
# Manages OBS API authentication for the entire site (migo.md)
class ObsSiteAuthService
  include Singleton

  # Site-level OBS credentials
  SITE_EMAIL = ENV['OBS_SITE_EMAIL']
  SITE_PASSWORD = ENV['OBS_SITE_PASSWORD']
  SITE_BASE_URL = ENV['OBS_API_BASE_URL'] || 'https://test-v2.obs.md'

  def initialize
    @access_token = nil
    @refresh_token = nil
    @expires_at = nil
    @mutex = Mutex.new
  end

  # Get valid access token for site-level API calls
  def access_token
    @mutex.synchronize do
      if token_expired?
        authenticate_site
      end
      @access_token
    end
  end

  # Authenticate site with OBS API
  def authenticate_site
    return false if SITE_EMAIL.blank? || SITE_PASSWORD.blank?

    begin
      response = site_api_service.login(SITE_EMAIL, SITE_PASSWORD)
      
      @access_token = response['access_token']
      @refresh_token = response['refresh_token']
      @expires_at = Time.current + response['expires_in'].seconds

      Rails.logger.info "Site authenticated with OBS API successfully"
      true
    rescue StandardError => e
      Rails.logger.error "Failed to authenticate site with OBS API: #{e.message}"
      false
    end
  end

  # Refresh site token
  def refresh_site_token
    return false if @refresh_token.blank?

    begin
      response = site_api_service.refresh_token(@refresh_token)
      
      @access_token = response['access_token']
      @refresh_token = response['refresh_token']
      @expires_at = Time.current + response['expires_in'].seconds

      Rails.logger.info "Site token refreshed successfully"
      true
    rescue StandardError => e
      Rails.logger.error "Failed to refresh site token: #{e.message}"
      # Try to re-authenticate
      authenticate_site
    end
  end

  # Logout site from OBS API
  def logout_site
    return false if @access_token.blank?

    begin
      site_api_service.logout(@access_token)
      
      @access_token = nil
      @refresh_token = nil
      @expires_at = nil

      Rails.logger.info "Site logged out from OBS API"
      true
    rescue StandardError => e
      Rails.logger.error "Failed to logout site from OBS API: #{e.message}"
      false
    end
  end

  # Check if token is expired or about to expire
  def token_expired?
    @expires_at.nil? || @expires_at < 5.minutes.from_now
  end

  # Get site API service instance with current token
  def site_api_service
    @site_api_service ||= ObsApiService.new(
      base_url: SITE_BASE_URL,
      access_token: @access_token
    )
  end

  # Health check for site authentication
  def healthy?
    @access_token.present? && !token_expired?
  end

  # Force re-authentication
  def reauthenticate
    @mutex.synchronize do
      logout_site
      authenticate_site
    end
  end

  private

  def token_expired?
    @expires_at.nil? || @expires_at < 5.minutes.from_now
  end
end
