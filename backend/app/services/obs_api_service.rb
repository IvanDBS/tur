# OBS API Service
# Handles all communication with the OBS API
class ObsApiService < BaseApiService
  attribute :base_url, :string, default: -> { ENV['OBS_API_BASE_URL'] || 'https://test-v2.obs.md' }
  attribute :access_token, :string

  # Authentication methods
  def login(email, password)
    make_request(:post, '/api/jwt/login', { email: email, password: password })
  end

  def refresh_token(refresh_token)
    make_request(:post, '/api/jwt/refresh-token', { refreshToken: refresh_token })
  end

  def logout(token)
    # Временно сохраняем токен для этого запроса
    original_token = access_token
    self.access_token = token
    result = make_request(:get, '/api/jwt/logout')
    self.access_token = original_token
    result
  end

  # Search methods - now with authentication
  def departure_cities
    make_request(:get, '/api/v2/search/departure_cities')
  end

  def countries(airport_city_from = nil)
    params = airport_city_from.present? ? { airport_city_from: airport_city_from } : {}
    make_request(:get, '/api/v2/search/countries', params)
  end

  def package_templates(country_id, airport_city_from = nil)
    params = airport_city_from.present? ? { airport_city_from: airport_city_from } : {}
    make_request(:get, "/api/v2/search/countries/#{country_id}/package_templates", params)
  end

  def search(search_params)
    make_request(:post, '/api/v2/search', search_params)
  end

  # Additional search endpoints from OBS API documentation
  def calendar_hints(params = {})
    make_request(:get, '/api/v2/search/calendar_hints', params)
  end

  def available_nights(params = {})
    make_request(:get, '/api/v2/search/available_nights', params)
  end

  def hotel_categories(package_template_id)
    make_request(:get, "/api/v2/search/package_templates/#{package_template_id}/hotel_categories")
  end

  def locations(package_template_id)
    make_request(:get, "/api/v2/search/package_templates/#{package_template_id}/locations")
  end

  def hotels(package_template_id, params = {})
    make_request(:get, "/api/v2/search/package_templates/#{package_template_id}/hotels", params)
  end

  def meals(package_template_id)
    make_request(:get, "/api/v2/search/package_templates/#{package_template_id}/meals")
  end

  # Booking methods
  def get_booking(hash)
    make_request(:get, "/api/v2/orders/book/#{hash}")
  end

  def calculate_booking(hash, booking_params)
    make_request(:post, "/api/v2/orders/calculate/#{hash}", booking_params)
  end

  def create_booking(hash, booking_params)
    make_request(:post, "/api/v2/orders/book/#{hash}", booking_params)
  end

  # Custom error classes (наследуются от ApiError)
  class Error < ApiError::Error; end
  class UnauthorizedError < ApiError::UnauthorizedError; end
  class ValidationError < ApiError::ValidationError; end
  class RateLimitError < ApiError::RateLimitError; end
  class ServerError < ApiError::ServerError; end
end
