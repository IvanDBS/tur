# Abstract Operator Adapter
# Base class for all tour operator integrations
class OperatorAdapter < BaseApiService
  include ActiveModel::Model
  include ActiveModel::Attributes

  attribute :operator_type, :string
  attribute :operator_config, :string, default: -> { {}.to_json }

  # JSON serialization helpers
  def operator_config
    JSON.parse(super || '{}')
  rescue JSON::ParserError
    {}
  end

  def operator_config=(value)
    super(value.is_a?(String) ? value : value.to_json)
  end

  # Abstract methods that must be implemented by subclasses
  def search_packages(params)
    raise NotImplementedError, "#{self.class} must implement #search_packages"
  end

  def get_booking_data(hash)
    raise NotImplementedError, "#{self.class} must implement #get_booking_data"
  end

  def calculate_booking(hash, booking_data)
    raise NotImplementedError, "#{self.class} must implement #calculate_booking"
  end

  def create_booking(hash, booking_data)
    raise NotImplementedError, "#{self.class} must implement #create_booking"
  end

  def cancel_booking(hash)
    raise NotImplementedError, "#{self.class} must implement #cancel_booking"
  end

  def booking_status(hash)
    raise NotImplementedError, "#{self.class} must implement #booking_status"
  end

  # Common methods that can be overridden
  def departure_cities
    make_request(:get, '/api/v2/search/departure_cities')
  end

  def countries(airport_city_from)
    make_request(:get, '/api/v2/search/countries', { airport_city_from: airport_city_from })
  end

  def package_templates(country_id, airport_city_from = nil)
    params = airport_city_from.present? ? { airport_city_from: airport_city_from } : {}
    make_request(:get, "/api/v2/search/countries/#{country_id}/package_templates", params)
  end

  def hotels(package_template_id, filters = {})
    make_request(:get, "/api/v2/search/package_templates/#{package_template_id}/hotels", filters)
  end

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

  def meals(package_template_id)
    make_request(:get, "/api/v2/search/package_templates/#{package_template_id}/meals")
  end

  # Operator-specific configuration
  def self.operator_type
    name.demodulize.underscore.gsub('_adapter', '')
  end

  def self.config
    OperatorConfigService.config_for(operator_type)
  end

  # Factory method to create appropriate adapter
  def self.create(operator_type, attributes = {})
    adapter_class = "::#{operator_type.camelize}Adapter".constantize
    adapter_class.new(attributes.merge(operator_type: operator_type))
  rescue NameError
    raise ArgumentError, "Unknown operator type: #{operator_type}"
  end

  # Health check for operator
  def healthy?
    begin
      # Try a simple API call to check health
      departure_cities
      true
    rescue StandardError
      false
    end
  end

  # Get operator-specific error mapping
  def map_error(error)
    case error
    when Net::TimeoutError, Faraday::TimeoutError
      OperatorError::TimeoutError.new("Request timeout for #{operator_type}")
    when Net::HTTPUnauthorized, Faraday::UnauthorizedError
      OperatorError::UnauthorizedError.new("Authentication failed for #{operator_type}")
    when Net::HTTPTooManyRequests, Faraday::TooManyRequestsError
      OperatorError::RateLimitError.new("Rate limit exceeded for #{operator_type}")
    when Net::HTTPServerError, Faraday::ServerError
      OperatorError::ServerError.new("Server error from #{operator_type}")
    else
      OperatorError::UnknownError.new("Unknown error from #{operator_type}: #{error.message}")
    end
  end

  # Retry logic with exponential backoff
  def with_retry(max_retries: 3, base_delay: 1.0)
    retries = 0
    begin
      yield
    rescue StandardError => error
      retries += 1
      if retries <= max_retries
        delay = base_delay * (2 ** (retries - 1))
        Rails.logger.warn "Retrying #{operator_type} request in #{delay}s (attempt #{retries}/#{max_retries}): #{error.message}"
        sleep(delay)
        retry
      else
        raise map_error(error)
      end
    end
  end

  # Circuit breaker pattern
  def with_circuit_breaker
    circuit_breaker = CircuitBreakerService.instance.for_operator(operator_type)
    circuit_breaker.call { yield }
  rescue CircuitBreaker::CircuitOpenError
    raise OperatorError::CircuitOpenError.new("Circuit breaker open for #{operator_type}")
  end

  # Metrics tracking
  def track_metric(operation, duration, success = true)
    MetricsService.track_operator_operation(
      operator_type: operator_type,
      operation: operation,
      duration: duration,
      success: success
    )
  end

  protected

  # Override make_request to add operator-specific logic
  def make_request(method, path, params = {})
    start_time = Time.current
    
    with_circuit_breaker do
      with_retry do
        result = super(method, path, params)
        track_metric("#{method}_#{path}", Time.current - start_time, true)
        result
      end
    end
  rescue StandardError
    track_metric("#{method}_#{path}", Time.current - start_time, false)
    raise
  end

  # Custom error classes for operators
  module OperatorError
    class Error < StandardError; end
    class TimeoutError < Error; end
    class UnauthorizedError < Error; end
    class RateLimitError < Error; end
    class ServerError < Error; end
    class UnknownError < Error; end
    class CircuitOpenError < Error; end
  end
end
