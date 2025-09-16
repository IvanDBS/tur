# Operator Health Monitoring Job
# Monitors health of all tour operators
class OperatorHealthMonitoringJob < ApplicationJob
  queue_as :default

  # Retry configuration
  sidekiq_options retry: 2, backtrace: 20

  def perform
    Rails.logger.info "Starting operator health monitoring"
    alert_service = AlertService.instance
    operator_manager = OperatorManagerService.instance

    # Get health status of all operators
    health_status = operator_manager.get_operators_health

    # Check each operator
    health_status.each do |operator_type, status|
      check_operator_health(operator_type, status, alert_service)
    end

    # Check overall system health
    check_system_health(health_status, alert_service)

    Rails.logger.info "Completed operator health monitoring"
  end

  private

  def check_operator_health(operator_type, status, alert_service)
    # Check if operator is enabled but not healthy
    if status[:enabled] && !status[:healthy]
      alert_service.error("Operator #{operator_type} is enabled but not healthy", {
        operator: operator_type,
        circuit_breaker_state: status[:circuit_breaker_state],
        priority: status[:priority],
        weight: status[:weight]
      })
    end

    # Check circuit breaker state
    case status[:circuit_breaker_state]
    when :open
      alert_service.warning("Circuit breaker open for operator #{operator_type}", {
        operator: operator_type,
        state: status[:circuit_breaker_state]
      })
    when :half_open
      alert_service.info("Circuit breaker half-open for operator #{operator_type}", {
        operator: operator_type,
        state: status[:circuit_breaker_state]
      })
    end

    # Log health status
    Rails.logger.info "Operator #{operator_type}: enabled=#{status[:enabled]}, healthy=#{status[:healthy]}, circuit_breaker=#{status[:circuit_breaker_state]}"
  end

  def check_system_health(health_status, alert_service)
    enabled_operators = health_status.select { |_, status| status[:enabled] }
    healthy_operators = enabled_operators.select { |_, status| status[:healthy] }
    
    total_enabled = enabled_operators.count
    total_healthy = healthy_operators.count

    # Alert if no operators are healthy
    if total_enabled > 0 && total_healthy == 0
      alert_service.critical("No operators are healthy", {
        total_enabled: total_enabled,
        total_healthy: total_healthy,
        operators: health_status.keys
      })
    end

    # Alert if less than 50% of operators are healthy
    if total_enabled > 1 && total_healthy < (total_enabled * 0.5)
      alert_service.warning("Less than 50% of operators are healthy", {
        total_enabled: total_enabled,
        total_healthy: total_healthy,
        healthy_percentage: (total_healthy.to_f / total_enabled * 100).round(2)
      })
    end

    # Log system health summary
    Rails.logger.info "System health: #{total_healthy}/#{total_enabled} operators healthy (#{(total_healthy.to_f / total_enabled * 100).round(2)}%)"
  end
end
