# frozen_string_literal: true

# Replica Health Monitoring Job
# Monitors read replica health and performance
class ReplicaHealthMonitoringJob < ApplicationJob
  queue_as :default

  # Run every 5 minutes
  sidekiq_options retry: 2, backtrace: 20

  def perform
    Rails.logger.info "Starting replica health monitoring"
    
    # Check replica availability
    unless DatabaseReplicationService.replica_available?
      Rails.logger.warn "Replica is not available"
      AlertService.instance.warning("Database replica is not available", {
        timestamp: Time.current.iso8601
      })
      return
    end
    
    # Check replica lag
    lag = DatabaseReplicationService.replica_lag
    
    if lag.nil?
      Rails.logger.error "Failed to get replica lag"
      AlertService.instance.error("Failed to get replica lag", {
        timestamp: Time.current.iso8601
      })
    elsif lag > 60 # More than 1 minute lag
      Rails.logger.warn "High replica lag detected: #{lag} seconds"
      AlertService.instance.warning("High replica lag detected", {
        lag_seconds: lag,
        timestamp: Time.current.iso8601
      })
    elsif lag > 10 # More than 10 seconds lag
      Rails.logger.info "Replica lag: #{lag} seconds"
    else
      Rails.logger.debug "Replica lag: #{lag} seconds (healthy)"
    end
    
    # Get connection statistics
    stats = DatabaseReplicationService.connection_stats
    Rails.logger.info "Database connection stats: #{stats}"
    
    # Check connection pool health
    check_connection_pool_health(stats)
    
    Rails.logger.info "Completed replica health monitoring"
  end

  private

  def check_connection_pool_health(stats)
    # Check primary pool
    primary_pool = stats[:primary]
    if primary_pool[:checked_out] > primary_pool[:pool_size] * 0.8
      AlertService.instance.warning("Primary database pool utilization high", {
        pool_size: primary_pool[:pool_size],
        checked_out: primary_pool[:checked_out],
        utilization_percent: (primary_pool[:checked_out].to_f / primary_pool[:pool_size] * 100).round(2)
      })
    end
    
    # Check replica pool
    replica_pool = stats[:replica]
    if replica_pool && replica_pool[:checked_out] > replica_pool[:pool_size] * 0.8
      AlertService.instance.warning("Replica database pool utilization high", {
        pool_size: replica_pool[:pool_size],
        checked_out: replica_pool[:checked_out],
        utilization_percent: (replica_pool[:checked_out].to_f / replica_pool[:pool_size] * 100).round(2)
      })
    end
  end
end
