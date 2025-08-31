# Faraday configuration for OBS API
require 'faraday'
require 'faraday/retry'

# Configure Faraday for OBS API calls
Faraday.default_adapter = :net_http

# Default connection options
Faraday.default_adapter_options = {
  timeout: 30,
  open_timeout: 10
}

# Retry configuration
Faraday::Retryable::DEFAULT_OPTIONS = {
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
