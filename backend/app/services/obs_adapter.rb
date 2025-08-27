# OBS API Adapter
# High-level interface for OBS API operations
class ObsAdapter
  include ActiveModel::Model
  include ActiveModel::Attributes

  attribute :user_id, :integer
  attribute :base_url, :string, default: -> { ENV['OBS_API_BASE_URL'] || 'https://test-v2.obs.md' }

  def initialize(attributes = {})
    super
    @connection = build_connection
    @auth_service = ObsAuthService.new(user_id: user_id) if user_id.present?
  end

  # Search endpoints
  def departure_cities
    make_request(:get, '/api/v2/search/departure_cities')
  end

  def arrival_cities(airport_city_from)
    make_request(:get, '/api/v2/search/countries', { airport_city_from: airport_city_from })
  end

  def hotels(package_template_id, filters = {})
    make_request(:get, "/api/v2/search/package_templates/#{package_template_id}/hotels", filters)
  end

  def search_packages(params)
    make_request(:post, '/api/v2/search', params)
  end

  # Booking endpoints
  def book(hash, booking_data)
    make_request(:post, "/api/v2/orders/book/#{hash}", booking_data)
  end

  def cancel_booking(hash)
    make_request(:delete, "/api/v2/orders/book/#{hash}")
  end

  def booking_status(hash)
    make_request(:get, "/api/v2/orders/book/#{hash}")
  end

  private

  def build_connection
    Faraday.new(url: base_url) do |conn|
      # Request middleware
      conn.request :json
      conn.request :retry, retry_options

      # Response middleware
      conn.response :json, content_type: /\bjson$/
      conn.response :logger, Rails.logger, { headers: false, bodies: true } if Rails.env.development?

      # Adapter
      conn.adapter Faraday.default_adapter
    end
  end

  def make_request(method, path, params = {})
    start_time = Time.current
    
    # Add authorization header
    headers = {}
    if @auth_service&.user_id
      access_token = @auth_service.valid_access_token
      headers['Authorization'] = "Bearer #{access_token}" if access_token
    end

    # Log request (without sensitive data)
    log_request(method, path, params, headers, start_time)

    response = @connection.public_send(method, path) do |req|
      req.headers.merge!(headers)
      req.body = params.to_json if method == :post
      req.params = params if method == :get
    end

    # Log response
    log_response(response, start_time)

    handle_response(response)
  rescue Faraday::TimeoutError, Faraday::ConnectionFailed => e
    log_error(e, method, path, start_time)
    raise ObsAdapter::NetworkError, "Network error: #{e.message}"
  rescue StandardError => e
    log_error(e, method, path, start_time)
    raise ObsAdapter::Error, "Request failed: #{e.message}"
  end

  def handle_response(response)
    case response.status
    when 200..299
      response.body
    when 401
      raise ObsAdapter::UnauthorizedError, "Authentication failed"
    when 422
      raise ObsAdapter::ValidationError, "Validation failed: #{response.body}"
    when 429
      raise ObsAdapter::RateLimitError, "Rate limit exceeded"
    when 500..599
      raise ObsAdapter::ServerError, "Server error: #{response.status}"
    else
      raise ObsAdapter::Error, "Unexpected response: #{response.status}"
    end
  end

  def retry_options
    {
      max: 3,
      interval: 0.5,
      backoff_factor: 2,
      retry_if: ->(env, exception) {
        # Retry on network errors and 5xx responses
        exception.is_a?(Faraday::TimeoutError) ||
        exception.is_a?(Faraday::ConnectionFailed) ||
        (env[:status] && env[:status] >= 500)
      }
    }
  end

  def log_request(method, path, params, headers, start_time)
    sanitized_params = sanitize_params(params)
    sanitized_headers = sanitize_headers(headers)
    
    Rails.logger.info "[OBS Adapter] #{method.upcase} #{path} - Params: #{sanitized_params} - Headers: #{sanitized_headers} - Started at: #{start_time}"
  end

  def log_response(response, start_time)
    duration = ((Time.current - start_time) * 1000).round(2)
    Rails.logger.info "[OBS Adapter] Response: #{response.status} - Duration: #{duration}ms"
  end

  def log_error(error, method, path, start_time)
    duration = ((Time.current - start_time) * 1000).round(2)
    Rails.logger.error "[OBS Adapter] Error in #{method.upcase} #{path} - #{error.class}: #{error.message} - Duration: #{duration}ms"
  end

  def sanitize_params(params)
    return {} unless params.is_a?(Hash)
    
    params.dup.tap do |sanitized|
      # Remove sensitive fields
      %w[password token access_token refresh_token].each do |field|
        sanitized.delete(field)
        sanitized.delete(field.to_sym)
      end
      
      # Sanitize nested hashes
      sanitized.each do |key, value|
        if value.is_a?(Hash)
          sanitized[key] = sanitize_params(value)
        end
      end
    end
  end

  def sanitize_headers(headers)
    return {} unless headers.is_a?(Hash)
    
    headers.dup.tap do |sanitized|
      # Remove authorization header
      sanitized.delete('Authorization')
      sanitized.delete(:authorization)
    end
  end

  # Custom error classes
  class Error < StandardError; end
  class NetworkError < Error; end
  class UnauthorizedError < Error; end
  class ValidationError < Error; end
  class RateLimitError < Error; end
  class ServerError < Error; end
end
