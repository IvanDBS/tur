# Operator Manager Service
# Manages multiple tour operators with load balancing and failover
class OperatorManagerService
  include Singleton

  def initialize
    @config_service = OperatorConfigService.instance
    @circuit_breaker_service = CircuitBreakerService.instance
    @metrics_service = MetricsService.instance
  end

  # Get adapter for specific operator
  def self.get_adapter(operator_type, attributes = {})
    instance.get_adapter(operator_type, attributes)
  end

  # Get best available operator for operation
  def self.get_best_operator(operation = 'search', attributes = {})
    instance.get_best_operator(operation, attributes)
  end

  # Execute operation with fallback
  def self.execute_with_fallback(operation, attributes = {}, &block)
    instance.execute_with_fallback(operation, attributes, &block)
  end

  def get_adapter(operator_type, attributes = {})
    return nil unless @config_service.enabled?(operator_type)

    adapter_class = "::#{operator_type.camelize}Adapter".constantize
    adapter_class.new(attributes.merge(operator_type: operator_type))
  rescue NameError
    Rails.logger.error "Unknown operator type: #{operator_type}"
    nil
  end

  def get_best_operator(operation = 'search', attributes = {})
    available_operators = get_available_operators_for_operation(operation)
    return nil if available_operators.empty?

    # Sort by priority and weight
    sorted_operators = available_operators.sort_by do |operator_type|
      config = @config_service.config_for(operator_type)
      priority = config.dig('priority') || 1
      weight = config.dig('weight') || 1
      [priority, -weight] # Lower priority number = higher priority
    end

    # Check circuit breaker status
    healthy_operators = sorted_operators.select do |operator_type|
      circuit_breaker = @circuit_breaker_service.for_operator(operator_type)
      circuit_breaker.state != :open
    end

    # Return best healthy operator or fallback to any available
    (healthy_operators.first || sorted_operators.first)
  end

  def execute_with_fallback(operation, attributes = {}, &block)
    primary_operator = @config_service.primary_operator
    best_operator = get_best_operator(operation, attributes)
    
    # Try best operator first, then primary, then any available
    operators_to_try = [best_operator, primary_operator].compact.uniq
    
    # Add other available operators as fallback
    other_operators = get_available_operators_for_operation(operation) - operators_to_try
    operators_to_try.concat(other_operators)

    last_error = nil

    operators_to_try.each do |operator_type|
      begin
        adapter = get_adapter(operator_type, attributes)
        next unless adapter

        Rails.logger.info "Trying operation #{operation} with operator #{operator_type}"
        
        result = yield(adapter)
        
        # Track successful operation
        @metrics_service.track_operator_operation(
          operator_type: operator_type,
          operation: operation,
          duration: 0, # Will be tracked by adapter
          success: true
        )
        
        Rails.logger.info "Operation #{operation} successful with operator #{operator_type}"
        return result

      rescue StandardError => e
        last_error = e
        Rails.logger.warn "Operation #{operation} failed with operator #{operator_type}: #{e.message}"
        
        # Track failed operation
        @metrics_service.track_operator_operation(
          operator_type: operator_type,
          operation: operation,
          duration: 0,
          success: false
        )
        
        # Send alert for critical operations
        if critical_operation?(operation)
          AlertService.instance.error("Critical operation failed with operator #{operator_type}", {
            operation: operation,
            operator: operator_type,
            error: e.message,
            timestamp: Time.current.iso8601
          })
        end
        
        # Continue to next operator
        next
      end
    end

    # All operators failed
    raise OperatorManagerError::AllOperatorsFailed.new(
      "All operators failed for operation #{operation}. Last error: #{last_error&.message}"
    )
  end

  # Get health status of all operators
  def get_operators_health
    health_status = {}
    
    @config_service.available_operators.each do |operator_type|
      next unless @config_service.enabled?(operator_type)
      
      adapter = get_adapter(operator_type)
      circuit_breaker = @circuit_breaker_service.for_operator(operator_type)
      
      health_status[operator_type] = {
        enabled: @config_service.enabled?(operator_type),
        healthy: adapter&.healthy? || false,
        circuit_breaker_state: circuit_breaker.state,
        priority: @config_service.priority(operator_type),
        weight: @config_service.weight(operator_type),
        last_check: Time.current.iso8601
      }
    end
    
    health_status
  end

  # Get metrics for all operators
  def get_operators_metrics(time_range = 1.hour)
    @metrics_service.get_metrics(time_range)[:operators] || {}
  end

  private

  def get_available_operators_for_operation(operation)
    @config_service.available_operators.select do |operator_type|
      config = @config_service.config_for(operator_type)
      @config_service.enabled?(operator_type) && 
        config.dig('features')&.include?(operation)
    end
  end

  def critical_operation?(operation)
    %w[booking create_booking cancel_booking].include?(operation)
  end

  # Error classes
  module OperatorManagerError
    class Error < StandardError; end
    class AllOperatorsFailed < Error; end
    class NoOperatorsAvailable < Error; end
  end
end
