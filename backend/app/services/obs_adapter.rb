# OBS API Adapter
# High-level interface for OBS API operations
class ObsAdapter < BaseApiService
  attribute :user_id, :integer
  attribute :base_url, :string, default: -> { ENV['OBS_API_BASE_URL'] || 'https://test-v2.obs.md' }

  def initialize(attributes = {})
    super
    @auth_service = ObsAuthService.new(user_id: user_id) if user_id.present?
    @site_auth_service = ObsSiteAuthService.instance
  end

  # Search endpoints
  def departure_cities
    make_request(:get, '/api/v2/search/departure_cities')
  end

  def countries(airport_city_from)
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

  # Переопределяем make_request для использования правильной аутентификации
  def make_request(method, path, params = {})
    start_time = Time.current

    # Add authorization header - prioritize site auth, fallback to user auth
    headers = {}
    access_token = get_access_token
    headers['Authorization'] = "Bearer #{access_token}" if access_token

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

  def get_access_token
    # First try site-level authentication
    site_token = @site_auth_service.access_token
    return site_token if site_token.present?

    # Fallback to user-level authentication if available
    if @auth_service&.user_id
      user_token = @auth_service.valid_access_token
      return user_token if user_token.present?
    end

    nil
  end


  # Custom error classes (наследуются от ApiError)
  class Error < ApiError::Error; end
  class NetworkError < ApiError::NetworkError; end
  class UnauthorizedError < ApiError::UnauthorizedError; end
  class ValidationError < ApiError::ValidationError; end
  class RateLimitError < ApiError::RateLimitError; end
  class ServerError < ApiError::ServerError; end
end
