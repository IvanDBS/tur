# NotificationMonitoringJob for periodic health checks and alerting
class NotificationMonitoringJob < ApplicationJob
  queue_as :monitoring
  
  # Run every 5 minutes
  def perform
    Rails.logger.info "NotificationMonitoringJob: Starting notification system health check"
    
    begin
      # Check system health and send alerts if needed
      NotificationMonitoringService.instance.check_and_alert
      
      # Log current metrics
      metrics = NotificationMonitoringService.instance.get_metrics(1.hour)
      Rails.logger.info "NotificationMonitoringJob: Current metrics - " \
                       "Total: #{metrics[:total_notifications]}, " \
                       "Delivered: #{metrics[:delivered_notifications]}, " \
                       "Success Rate: #{metrics[:delivery_success_rate]}%"
      
      # Clean up old metrics cache if needed
      cleanup_old_cache
      
    rescue StandardError => e
      Rails.logger.error "NotificationMonitoringJob: Failed to perform health check: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      
      # Send critical alert about monitoring failure
      AlertService.instance.critical(
        "Notification monitoring job failed: #{e.message}",
        {
          job: 'NotificationMonitoringJob',
          error: e.message,
          timestamp: Time.current
        }
      )
      
      raise
    end
  end
  
  private
  
  def cleanup_old_cache
    # Clean up old notification metrics cache
    # This would be implemented based on your caching strategy
    Rails.logger.debug "NotificationMonitoringJob: Cleaning up old cache entries"
  end
end
