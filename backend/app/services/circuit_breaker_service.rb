# Circuit Breaker Service
# Implements circuit breaker pattern for operator resilience
class CircuitBreakerService
  include Singleton

  def initialize
    @circuits = {}
  end

  def for_operator(operator_type)
    @circuits[operator_type] ||= create_circuit(operator_type)
  end

  private

  def create_circuit(operator_type)
    config = OperatorConfigService.config_for(operator_type)
    circuit_config = config.dig('circuit_breaker') || default_circuit_config

    CircuitBreaker.new(
      failure_threshold: circuit_config['failure_threshold'],
      recovery_timeout: circuit_config['recovery_timeout'],
      half_open_max_calls: circuit_config['half_open_max_calls']
    ) do |breaker|
      breaker.on_failure do |error|
        Rails.logger.warn "Circuit breaker failure for #{operator_type}: #{error.message}"
        AlertService.instance.warning("Circuit breaker failure for #{operator_type}", {
          operator: operator_type,
          error: error.message,
          timestamp: Time.current.iso8601
        })
      end

      breaker.on_success do
        Rails.logger.info "Circuit breaker success for #{operator_type}"
      end

      breaker.on_state_change do |old_state, new_state|
        Rails.logger.info "Circuit breaker state change for #{operator_type}: #{old_state} -> #{new_state}"
        AlertService.instance.info("Circuit breaker state change for #{operator_type}: #{old_state} -> #{new_state}")
      end
    end
  end

  def default_circuit_config
    {
      'failure_threshold' => 5,
      'recovery_timeout' => 60,
      'half_open_max_calls' => 3
    }
  end
end

# Simple Circuit Breaker implementation
class CircuitBreaker
  STATES = %i[closed open half_open].freeze

  attr_reader :state, :failure_count, :last_failure_time

  def initialize(failure_threshold: 5, recovery_timeout: 60, half_open_max_calls: 3, &block)
    @failure_threshold = failure_threshold
    @recovery_timeout = recovery_timeout
    @half_open_max_calls = half_open_max_calls
    @state = :closed
    @failure_count = 0
    @last_failure_time = nil
    @half_open_calls = 0
    @callbacks = {}
    instance_eval(&block) if block_given?
  end

  def call
    case @state
    when :closed
      execute_with_failure_tracking
    when :open
      if should_attempt_reset?
        @state = :half_open
        @half_open_calls = 0
        notify_state_change(:open, :half_open)
        execute_with_failure_tracking
      else
        raise CircuitOpenError, "Circuit breaker is open"
      end
    when :half_open
      if @half_open_calls < @half_open_max_calls
        @half_open_calls += 1
        execute_with_failure_tracking
      else
        raise CircuitOpenError, "Circuit breaker half-open call limit exceeded"
      end
    end
  end

  def on_failure(&block)
    @callbacks[:failure] = block
  end

  def on_success(&block)
    @callbacks[:success] = block
  end

  def on_state_change(&block)
    @callbacks[:state_change] = block
  end

  private

  def execute_with_failure_tracking
    result = yield
    handle_success
    result
  rescue StandardError => e
    handle_failure(e)
    raise
  end

  def handle_success
    @failure_count = 0
    @half_open_calls = 0
    if @state == :half_open
      @state = :closed
      notify_state_change(:half_open, :closed)
    end
    notify_success
  end

  def handle_failure(error)
    @failure_count += 1
    @last_failure_time = Time.current

    if @failure_count >= @failure_threshold
      @state = :open
      notify_state_change(:closed, :open)
    end

    notify_failure(error)
  end

  def should_attempt_reset?
    @last_failure_time && (Time.current - @last_failure_time) >= @recovery_timeout
  end

  def notify_failure(error)
    @callbacks[:failure]&.call(error)
  end

  def notify_success
    @callbacks[:success]&.call
  end

  def notify_state_change(old_state, new_state)
    @callbacks[:state_change]&.call(old_state, new_state)
  end

  class CircuitOpenError < StandardError; end
end
