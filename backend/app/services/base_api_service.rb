# Base API Service
# Содержит общую логику для всех API сервисов
class BaseApiService
  include ActiveModel::Model
  include ActiveModel::Attributes

  attribute :base_url, :string
  attribute :access_token, :string

  def initialize(attributes = {})
    super
    @connection = build_connection
  end

  protected

  # Создание HTTP соединения
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

  # Обработка HTTP ответов
  def handle_response(response)
    case response.status
    when 200..299
      response.body
    when 400
      raise ApiError::BadRequestError, "Bad request: #{response.body}"
    when 401
      raise ApiError::UnauthorizedError, "Authentication failed: #{response.body}"
    when 403
      raise ApiError::ForbiddenError, "Access forbidden: #{response.body}"
    when 404
      raise ApiError::NotFoundError, "Resource not found: #{response.body}"
    when 422
      raise ApiError::ValidationError, "Validation failed: #{response.body}"
    when 429
      handle_rate_limit(response)
    when 500..599
      raise ApiError::ServerError, "Server error: #{response.status} - #{response.body}"
    else
      raise ApiError::Error, "Unexpected response: #{response.status} - #{response.body}"
    end
  end

  # Обработка rate limiting
  def handle_rate_limit(response)
    retry_after = response.headers['Retry-After']&.to_i || 60
    raise ApiError::RateLimitError, "Rate limit exceeded. Retry after #{retry_after} seconds: #{response.body}"
  end

  # Настройки повторных попыток
  def retry_options
    {
      max: 3,
      interval: 0.5,
      backoff_factor: 2,
      retry_if: ->(env, exception) {
        # Retry on network errors, 5xx responses, and rate limits
        exception.is_a?(Faraday::TimeoutError) ||
          exception.is_a?(Faraday::ConnectionFailed) ||
          exception.is_a?(Faraday::SSLError) ||
          (env[:status] && env[:status] >= 500) ||
          (env[:status] && env[:status] == 429)
      },
      retry_block: ->(env, options, retries, exception) {
        if env[:status] == 429
          # Handle rate limiting with exponential backoff
          retry_after = env[:response_headers]['Retry-After']&.to_i || 60
          sleep(retry_after)
        else
          # Standard exponential backoff
          sleep(options[:interval] * (options[:backoff_factor] ** retries))
        end
      }
    }
  end

  # Логирование запроса
  def log_request(method, path, params, headers, start_time)
    sanitized_params = sanitize_params(params)
    sanitized_headers = sanitize_headers(headers)

    Rails.logger.info "[#{self.class.name}] #{method.upcase} #{path} - Params: #{sanitized_params} - Headers: #{sanitized_headers} - Started at: #{start_time}"
  end

  # Логирование ответа
  def log_response(response, start_time)
    duration = ((Time.current - start_time) * 1000).round(2)
    Rails.logger.info "[#{self.class.name}] Response: #{response.status} - Duration: #{duration}ms"
  end

  # Логирование ошибки
  def log_error(error, method, path, start_time)
    duration = ((Time.current - start_time) * 1000).round(2)
    Rails.logger.error "[#{self.class.name}] Error in #{method.upcase} #{path} - #{error.class}: #{error.message} - Duration: #{duration}ms"
  end

  # Очистка параметров от чувствительных данных
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
        sanitized[key] = sanitize_params(value) if value.is_a?(Hash)
      end
    end
  end

  # Очистка заголовков от чувствительных данных
  def sanitize_headers(headers)
    return {} unless headers.is_a?(Hash)

    headers.dup.tap do |sanitized|
      # Remove authorization header
      sanitized.delete('Authorization')
      sanitized.delete(:authorization)
    end
  end

  # Выполнение HTTP запроса
  def make_request(method, path, params = {})
    start_time = Time.current

    # Add authorization header if access_token is present
    headers = {}
    headers['Authorization'] = "Bearer #{access_token}" if access_token.present?
    
    # Add additional headers for OBS API compatibility
    headers['Accept'] = 'application/json'
    headers['Content-Type'] = 'application/json' if method == :post
    headers['x-localization'] = 'ru'
    headers['Cache-Control'] = 'no-cache'
    headers['Pragma'] = 'no-cache'

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
    raise ApiError::NetworkError, "Network error: #{e.message}"
  rescue StandardError => e
    log_error(e, method, path, start_time)
    raise ApiError::Error, "Request failed: #{e.message}"
  end
end

# Общие классы ошибок для всех API сервисов
module ApiError
  class Error < StandardError; end
  class NetworkError < Error; end
  class BadRequestError < Error; end
  class UnauthorizedError < Error; end
  class ForbiddenError < Error; end
  class NotFoundError < Error; end
  class ValidationError < Error; end
  class RateLimitError < Error; end
  class ServerError < Error; end
  class TimeoutError < Error; end
  class CircuitOpenError < Error; end
end
