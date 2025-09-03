# OBS API Service
# Handles all communication with the OBS API
class ObsApiService
  include ActiveModel::Model
  include ActiveModel::Attributes

  attribute :base_url, :string, default: -> { ENV['OBS_API_BASE_URL'] || 'https://test-v2.obs.md' }
  attribute :access_token, :string

  def initialize(attributes = {})
    super
    @connection = build_connection
  end

  # Authentication methods
  def login(email, password)
    response = @connection.post('/api/jwt/login') do |req|
      req.body = { email: email, password: password }.to_json
      req.headers['Content-Type'] = 'application/json'
      req.headers['Accept'] = 'application/json'
    end

    handle_response(response)
  end

  def refresh_token(refresh_token)
    response = @connection.post('/api/jwt/refresh-token') do |req|
      req.body = { refreshToken: refresh_token }.to_json
      req.headers['Content-Type'] = 'application/json'
      req.headers['Accept'] = 'application/json'
    end

    handle_response(response)
  end

  def logout(token)
    response = @connection.get('/api/jwt/logout') do |req|
      req.headers['Accept'] = 'application/json'
      req.headers['Authorization'] = "Bearer #{token}"
    end

    handle_response(response)
  end

  # Search methods - now with authentication
  def departure_cities
    response = @connection.get('/api/v2/search/departure_cities') do |req|
      req.headers['Accept'] = 'application/json'
      req.headers['Authorization'] = "Bearer #{access_token}" if access_token.present?
    end
    handle_response(response)
  end

  def countries(airport_city_from = nil)
    url = '/api/v2/search/countries'
    url += "?airport_city_from=#{airport_city_from}" if airport_city_from.present?

    response = @connection.get(url) do |req|
      req.headers['Accept'] = 'application/json'
      req.headers['Authorization'] = "Bearer #{access_token}" if access_token.present?
    end
    handle_response(response)
  end

  def package_templates(country_id, airport_city_from = nil)
    url = "/api/v2/search/countries/#{country_id}/package_templates"
    url += "?airport_city_from=#{airport_city_from}" if airport_city_from.present?

    response = @connection.get(url) do |req|
      req.headers['Accept'] = 'application/json'
      req.headers['Authorization'] = "Bearer #{access_token}" if access_token.present?
    end
    handle_response(response)
  end

  def search(search_params)
    response = @connection.post('/api/v2/search') do |req|
      req.body = search_params.to_json
      req.headers['Content-Type'] = 'application/json'
      req.headers['Accept'] = 'application/json'
      req.headers['Authorization'] = "Bearer #{access_token}" if access_token.present?
    end

    handle_response(response)
  end

  # Additional search endpoints from OBS API documentation
  def calendar_hints(params = {})
    url = '/api/v2/search/calendar_hints'
    url += "?#{params.to_query}" if params.any?

    response = @connection.get(url) do |req|
      req.headers['Accept'] = 'application/json'
      req.headers['Authorization'] = "Bearer #{access_token}" if access_token.present?
    end
    handle_response(response)
  end

  def available_nights(params = {})
    url = '/api/v2/search/available_nights'
    url += "?#{params.to_query}" if params.any?

    response = @connection.get(url) do |req|
      req.headers['Accept'] = 'application/json'
      req.headers['Authorization'] = "Bearer #{access_token}" if access_token.present?
    end
    handle_response(response)
  end

  def hotel_categories(package_template_id)
    response = @connection.get("/api/v2/search/package_templates/#{package_template_id}/hotel_categories") do |req|
      req.headers['Accept'] = 'application/json'
      req.headers['Authorization'] = "Bearer #{access_token}" if access_token.present?
    end
    handle_response(response)
  end

  def locations(package_template_id)
    response = @connection.get("/api/v2/search/package_templates/#{package_template_id}/locations") do |req|
      req.headers['Accept'] = 'application/json'
      req.headers['Authorization'] = "Bearer #{access_token}" if access_token.present?
    end
    handle_response(response)
  end

  def hotels(package_template_id, params = {})
    url = "/api/v2/search/package_templates/#{package_template_id}/hotels"
    url += "?#{params.to_query}" if params.any?

    response = @connection.get(url) do |req|
      req.headers['Accept'] = 'application/json'
      req.headers['Authorization'] = "Bearer #{access_token}" if access_token.present?
    end
    handle_response(response)
  end

  def meals(package_template_id)
    response = @connection.get("/api/v2/search/package_templates/#{package_template_id}/meals") do |req|
      req.headers['Accept'] = 'application/json'
      req.headers['Authorization'] = "Bearer #{access_token}" if access_token.present?
    end
    handle_response(response)
  end

  # Booking methods
  def get_booking(hash)
    response = @connection.get("/api/v2/orders/book/#{hash}") do |req|
      req.headers['Accept'] = 'application/json'
      req.headers['Authorization'] = "Bearer #{access_token}" if access_token.present?
    end
    handle_response(response)
  end

  def calculate_booking(hash, booking_params)
    response = @connection.post("/api/v2/orders/calculate/#{hash}") do |req|
      req.body = booking_params.to_json
      req.headers['Content-Type'] = 'application/json'
      req.headers['Accept'] = 'application/json'
      req.headers['Authorization'] = "Bearer #{access_token}" if access_token.present?
    end

    handle_response(response)
  end

  def create_booking(hash, booking_params)
    response = @connection.post("/api/v2/orders/book/#{hash}") do |req|
      req.body = booking_params.to_json
      req.headers['Content-Type'] = 'application/json'
      req.headers['Accept'] = 'application/json'
      req.headers['Authorization'] = "Bearer #{access_token}" if access_token.present?
    end

    handle_response(response)
  end

  private

  def build_connection
    Faraday.new(url: base_url) do |conn|
      # Request middleware
      conn.request :json
      conn.request :retry, max: 3, interval: 0.5, backoff_factor: 2

      # Response middleware
      conn.response :json, content_type: /\bjson$/
      conn.response :logger, Rails.logger if Rails.env.development?

      # Adapter
      conn.adapter Faraday.default_adapter
    end
  end

  def handle_response(response)
    case response.status
    when 200..299
      response.body
    when 401
      raise ObsApiService::UnauthorizedError, "Authentication failed: #{response.body}"
    when 422
      raise ObsApiService::ValidationError, "Validation failed: #{response.body}"
    when 429
      raise ObsApiService::RateLimitError, "Rate limit exceeded: #{response.body}"
    when 500..599
      raise ObsApiService::ServerError, "Server error: #{response.body}"
    else
      raise ObsApiService::Error, "Unexpected response: #{response.status} - #{response.body}"
    end
  end

  # Custom error classes
  class Error < StandardError; end
  class UnauthorizedError < Error; end
  class ValidationError < Error; end
  class RateLimitError < Error; end
  class ServerError < Error; end
end
