# frozen_string_literal: true

# Rack::Attack configuration for rate limiting
# Documentation: https://github.com/rack/rack-attack

class Rack::Attack
  # Configure cache store for rate limiting
  # Use Redis in production, memory store in development
  Rack::Attack.cache.store = if Rails.env.production?
    ActiveSupport::Cache::RedisCacheStore.new(
      url: ENV['REDIS_URL'] || 'redis://localhost:6379/1',
      namespace: 'rack_attack',
      expires_in: 1.hour
    )
  else
    ActiveSupport::Cache::MemoryStore.new
  end

  # Allow requests from localhost in development
  Rack::Attack.safelist('allow-localhost') do |req|
    '127.0.0.1' == req.ip || '::1' == req.ip if Rails.env.development?
  end

  # Allow requests from health check endpoints
  Rack::Attack.safelist('allow-health-checks') do |req|
    req.path.start_with?('/up') || req.path.start_with?('/api/v1/health')
  end

  # Rate limiting for API endpoints
  # General API rate limiting: 100 requests per minute per IP
  throttle('api/ip', limit: 100, period: 1.minute) do |req|
    if req.path.start_with?('/api/')
      req.ip
    end
  end

  # Enhanced brute force protection for authentication endpoints
  # 5 login attempts per minute per IP (stricter)
  throttle('auth/ip', limit: 5, period: 1.minute) do |req|
    if req.path.include?('/auth/sign_in') || req.path.include?('/auth/sign_up')
      req.ip
    end
  end

  # Progressive rate limiting for failed login attempts
  # 3 failed attempts per 5 minutes per IP
  throttle('auth/failed-attempts', limit: 3, period: 5.minutes) do |req|
    if req.path.include?('/auth/sign_in') && req.env['rack.attack.failed_attempts']
      req.ip
    end
  end

  # Account lockout protection - 10 failed attempts per hour per email
  throttle('auth/account-lockout', limit: 10, period: 1.hour) do |req|
    if req.path.include?('/auth/sign_in') && req.params['user'] && req.params['user']['email']
      req.params['user']['email']
    end
  end

  # IP-based progressive blocking using IpBlockingService
  blocklist('block-brute-force-ips') do |req|
    # Check if IP is manually blocked
    if IpBlockingService.blocked?(req.ip)
      Rails.logger.warn "Blocking IP #{req.ip} - manually blocked"
      true
    else
      # Check if IP has exceeded brute force threshold
      key = "brute_force_attempts:#{req.ip}"
      attempts = Rack::Attack.cache.read(key) || 0
      
      if attempts > 20
        # Auto-block the IP
        IpBlockingService.auto_block_ip(req.ip, attempts)
        Rails.logger.warn "Auto-blocking IP #{req.ip} for brute force attempts: #{attempts}"
        true
      else
        false
      end
    end
  end

  # Whitelist trusted IPs
  safelist('whitelist-trusted-ips') do |req|
    IpBlockingService.whitelisted?(req.ip)
  end

  # Rate limiting for search endpoints (more generous)
  # 200 search requests per minute per IP
  throttle('search/ip', limit: 200, period: 1.minute) do |req|
    if req.path.include?('/search')
      req.ip
    end
  end

  # Rate limiting for booking endpoints (stricter)
  # 20 booking requests per minute per IP
  throttle('booking/ip', limit: 20, period: 1.minute) do |req|
    if req.path.include?('/bookings')
      req.ip
    end
  end

  # DDOS protection - burst requests
  # Allow burst of 50 requests, then limit to 10 per second
  throttle('ddos/burst', limit: 50, period: 10.seconds) do |req|
    req.ip
  end

  # DDOS protection - sustained requests
  # Limit to 1000 requests per hour per IP
  throttle('ddos/sustained', limit: 1000, period: 1.hour) do |req|
    req.ip
  end

  # Request size limiting
  # Block requests larger than 1MB
  blocklist('block-large-requests') do |req|
    content_length = req.content_length.to_i
    if content_length > 1.megabyte
      Rails.logger.warn "Blocking large request from #{req.ip}: #{content_length} bytes"
      true
    else
      false
    end
  end

  # Suspicious user agent blocking
  blocklist('block-suspicious-agents') do |req|
    user_agent = req.user_agent.to_s.downcase
    suspicious_agents = [
      'sqlmap', 'nikto', 'nmap', 'masscan', 'zap', 'burp',
      'curl', 'wget', 'python-requests', 'bot', 'crawler',
      'scanner', 'exploit', 'injection'
    ]
    
    if suspicious_agents.any? { |agent| user_agent.include?(agent) }
      Rails.logger.warn "Blocking suspicious user agent from #{req.ip}: #{user_agent}"
      true
    else
      false
    end
  end

  # Geographic blocking (if needed)
  # blocklist('block-countries') do |req|
  #   # Implement geographic blocking based on IP
  #   # This would require a GeoIP service
  #   false
  # end

  # Rate limiting per user (authenticated requests)
  # 1000 requests per hour per user
  throttle('api/user', limit: 1000, period: 1.hour) do |req|
    if req.path.start_with?('/api/') && req.env['HTTP_AUTHORIZATION']
      # Extract user ID from JWT token
      begin
        token = req.env['HTTP_AUTHORIZATION'].gsub(/^Bearer /, '')
        decoded_token = JWT.decode(
          token,
          Rails.application.credentials.secret_key_base,
          true,
          { algorithm: 'HS256' }
        )
        decoded_token[0]['user_id']
      rescue JWT::DecodeError, JWT::ExpiredSignature
        nil
      end
    end
  end

  # Block requests from known bad IPs (if you have a list)
  # blocklist('block-bad-ips') do |req|
  #   # Add logic to check against blacklist
  #   false
  # end

  # Custom response for rate limited requests
  self.throttled_response = lambda do |env|
    match_data = env['rack.attack.match_data']
    now = match_data[:epoch_time]
    
    headers = {
      'Content-Type' => 'application/json',
      'X-RateLimit-Limit' => match_data[:limit].to_s,
      'X-RateLimit-Remaining' => '0',
      'X-RateLimit-Reset' => (now + (match_data[:period] - now % match_data[:period])).to_s,
      'Retry-After' => match_data[:period].to_s
    }

    body = {
      success: false,
      message: 'Rate limit exceeded. Please try again later.',
      error: 'rate_limit_exceeded',
      retry_after: match_data[:period]
    }.to_json

    [429, headers, [body]]
  end

  # Log rate limit violations
  ActiveSupport::Notifications.subscribe('rack.attack') do |name, start, finish, request_id, payload|
    req = payload[:request]
    
    Rails.logger.warn "Rate limit exceeded: #{req.ip} - #{req.path} - #{payload[:match_discriminator]}"
    
    # Send alert for repeated violations
    if payload[:match_type] == :throttle
      AlertService.instance.warning("Rate limit exceeded", {
        ip: req.ip,
        path: req.path,
        user_agent: req.user_agent,
        match_discriminator: payload[:match_discriminator],
        match_type: payload[:match_type]
      })
    end
  end
end

# Configure Rails to use Rack::Attack
Rails.application.configure do
  config.middleware.use Rack::Attack
end
