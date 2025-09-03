# OBS Site Authentication Initializer
# Automatically authenticates the site with OBS API on startup

Rails.application.config.after_initialize do
  begin
    # Initialize site authentication
    site_auth = ObsSiteAuthService.instance
    
    if site_auth.authenticate_site
      Rails.logger.info "✅ Site successfully authenticated with OBS API"
    else
      Rails.logger.error "❌ Failed to authenticate site with OBS API"
      Rails.logger.error "   Please check OBS_SITE_EMAIL and OBS_SITE_PASSWORD environment variables"
    end
  rescue StandardError => e
    Rails.logger.error "❌ Error during OBS site authentication: #{e.message}"
    Rails.logger.error "   #{e.backtrace.first}"
  end
end
