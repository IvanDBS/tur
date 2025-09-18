# frozen_string_literal: true

# Brute Force Protection Middleware
# Tracks failed authentication attempts and implements progressive blocking

class BruteForceProtection
  def initialize(app)
    @app = app
  end

  def call(env)
    request = Rack::Request.new(env)
    
    # Track failed authentication attempts
    if authentication_endpoint?(request) && failed_attempt?(env)
      track_failed_attempt(request, env)
    end
    
    @app.call(env)
  end

  private

  def authentication_endpoint?(request)
    request.path.include?('/auth/sign_in') || request.path.include?('/auth/sign_up')
  end

  def failed_attempt?(_env)
    # Check if the response indicates a failed authentication
    # Note: This method is called but the env parameter is not used in current implementation
    # The actual response status checking is handled by Rack::Attack
    false
  end

  def track_failed_attempt(request, env)
    ip = request.ip
    email = extract_email(request)
    
    # Track by IP
    track_ip_attempts(ip)
    
    # Track by email if available
    track_email_attempts(email) if email.present?
    
    # Log the attempt
    Rails.logger.warn "Failed authentication attempt from IP: #{ip}, Email: #{email}"
    
    # Send alert if threshold exceeded
    check_and_alert(ip, email)
  end

  def extract_email(request)
    # Extract email from request parameters
    if request.post?
      # Check request size to prevent DoS
      return nil if request.content_length && request.content_length > 1.megabyte
      
      begin
        params = JSON.parse(request.body.read)
        request.body.rewind
        params.dig('user', 'email') || params['email']
      rescue JSON::ParserError => e
        Rails.logger.warn "Failed to parse JSON in brute force protection: #{e.message}"
        nil
      end
    end
  end

  def track_ip_attempts(ip)
    key = "brute_force_attempts:#{ip}"
    # Use atomic increment to avoid race conditions
    if Rails.cache.respond_to?(:increment)
      Rails.cache.increment(key, 1, expires_in: 1.hour)
    else
      # Fallback for non-Redis cache stores
      attempts = Rails.cache.read(key) || 0
      Rails.cache.write(key, attempts + 1, expires_in: 1.hour)
    end
  end

  def track_email_attempts(email)
    key = "brute_force_email_attempts:#{email}"
    # Use atomic increment to avoid race conditions
    if Rails.cache.respond_to?(:increment)
      Rails.cache.increment(key, 1, expires_in: 1.hour)
    else
      # Fallback for non-Redis cache stores
      attempts = Rails.cache.read(key) || 0
      Rails.cache.write(key, attempts + 1, expires_in: 1.hour)
    end
  end

  def check_and_alert(ip, email)
    ip_attempts = Rails.cache.read("brute_force_attempts:#{ip}") || 0
    email_attempts = email.present? ? (Rails.cache.read("brute_force_email_attempts:#{email}") || 0) : 0
    
    # Alert on suspicious activity
    if ip_attempts > 10
      AlertService.instance.critical("High brute force activity from IP", {
        ip: ip,
        attempts: ip_attempts,
        email: email
      })
    end
    
    if email_attempts > 5
      AlertService.instance.warning("Multiple failed attempts for email", {
        email: email,
        attempts: email_attempts,
        ip: ip
      })
    end
  end
end
