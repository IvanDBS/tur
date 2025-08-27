# Rack::Attack configuration for rate limiting
class Rack::Attack
  # Configure cache store
  Rack::Attack.cache.store = Rails.cache

  # Allow requests from localhost in development
  Rack::Attack.safelist('allow-localhost') do |req|
    '127.0.0.1' == req.ip || '::1' == req.ip if Rails.env.development?
  end

  # Rate limiting for API endpoints
  # General API rate limiting: 100 requests per minute per IP
  throttle('api/ip', limit: 100, period: 1.minute) do |req|
    req.ip if req.path.start_with?('/api/')
  end

  # Authentication endpoints: 5 requests per minute per IP
  throttle('auth/ip', limit: 5, period: 1.minute) do |req|
    req.ip if req.path.include?('/jwt/')
  end

  # Search endpoints: 20 requests per minute per IP
  throttle('search/ip', limit: 20, period: 1.minute) do |req|
    req.ip if req.path.include?('/search')
  end

  # Booking endpoints: 10 requests per minute per IP
  throttle('booking/ip', limit: 10, period: 1.minute) do |req|
    req.ip if req.path.include?('/orders/')
  end

  # Block suspicious requests
  blocklist('block-suspicious') do |req|
    # Block requests with suspicious patterns
    req.path.include?('..') || 
    req.path.include?('admin') ||
    req.path.include?('wp-admin') ||
    req.path.include?('phpmyadmin')
  end

  # Custom response for blocked requests
  self.blocklisted_response = lambda do |env|
    [
      429,
      { 'Content-Type' => 'application/json' },
      [{ error: 'Rate limit exceeded. Please try again later.' }.to_json]
    ]
  end

  # Custom response for throttled requests
  self.throttled_response = lambda do |env|
    match_data = env['rack.attack.match_data']
    now = match_data[:epoch_time]
    
    [
      429,
      {
        'Content-Type' => 'application/json',
        'X-RateLimit-Limit' => match_data[:limit].to_s,
        'X-RateLimit-Remaining' => '0',
        'X-RateLimit-Reset' => (now + (match_data[:period] - now % match_data[:period])).to_s
      },
      [{ error: 'Too many requests. Please slow down.' }.to_json]
    ]
  end
end

# Log blocked requests
ActiveSupport::Notifications.subscribe('rack.attack') do |name, start, finish, request_id, payload|
  req = payload[:request]
  Rails.logger.warn "[Rack::Attack] #{req.ip} #{req.request_method} #{req.fullpath} - #{payload[:match_discriminator]}"
end
