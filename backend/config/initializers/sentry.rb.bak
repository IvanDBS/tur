# Sentry configuration for error monitoring
Sentry.init do |config|
  config.dsn = ENV['SENTRY_DSN']
  config.breadcrumbs_logger = [:active_support_logger, :http_logger]
  
  # Set traces_sample_rate to 1.0 to capture 100% of transactions for performance monitoring
  config.traces_sample_rate = Rails.env.production? ? 0.1 : 1.0
  
  # Set profiles_sample_rate to profile 100% of sampled transactions
  config.profiles_sample_rate = Rails.env.production? ? 0.1 : 1.0
  
  # Filter sensitive data
  config.before_send = lambda do |event, hint|
    # Remove sensitive headers
    if event.request && event.request.headers
      event.request.headers.delete('Authorization')
      event.request.headers.delete('X-API-Key')
    end
    
    # Remove sensitive cookies
    if event.request && event.request.cookies
      event.request.cookies.delete('_session_id')
      event.request.cookies.delete('remember_token')
    end
    
    event
  end
  
  # Set environment
  config.environment = Rails.env
  
  # Set release
  config.release = ENV['HEROKU_SLUG_COMMIT'] || `git rev-parse HEAD`.strip
  
  # Configure Sidekiq integration
  config.integrations << Sentry::SidekiqIntegration.new
end
