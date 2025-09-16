# Job for checking OBS API health and re-authenticating if needed
class ObsHealthCheckJob < ApplicationJob
  queue_as :default

  # Retry configuration
  sidekiq_options retry: 2, backtrace: 20

  def perform
    Rails.logger.info "Starting OBS API health check"
    alert_service = AlertService.instance

    site_auth = ObsSiteAuthService.instance

    unless site_auth.healthy?
      Rails.logger.warn "OBS API authentication unhealthy, attempting re-authentication"
      
      if site_auth.reauthenticate
        Rails.logger.info "✅ OBS API re-authentication successful"
        alert_service.info("OBS API re-authentication successful after health check failure")
      else
        Rails.logger.error "❌ OBS API re-authentication failed"
        alert_service.obs_auth_failed({
          error: "Re-authentication failed during health check",
          timestamp: Time.current.iso8601
        })
      end
    else
      Rails.logger.info "✅ OBS API authentication healthy"
    end

    # Test API connectivity
    test_api_connectivity

    Rails.logger.info "Completed OBS API health check"
  end

  private

  def test_api_connectivity
    alert_service = AlertService.instance
    
    begin
      obs_service = ObsApiService.new(
        base_url: ENV['OBS_API_BASE_URL'] || 'https://test-v2.obs.md',
        access_token: ObsSiteAuthService.instance.access_token
      )
      
      # Try to fetch departure cities as a connectivity test
      cities = obs_service.departure_cities
      
      if cities.is_a?(Array) && cities.any?
        Rails.logger.info "✅ OBS API connectivity test successful - found #{cities.size} departure cities"
      else
        Rails.logger.warn "⚠️ OBS API connectivity test returned unexpected data format"
        alert_service.warning("OBS API returned unexpected data format", {
          response_type: cities.class.name,
          response_size: cities.respond_to?(:size) ? cities.size : 'unknown'
        })
      end
    rescue StandardError => e
      Rails.logger.error "❌ OBS API connectivity test failed: #{e.message}"
      alert_service.obs_api_down({
        error: e.message,
        error_class: e.class.name,
        timestamp: Time.current.iso8601
      })
    end
  end
end
