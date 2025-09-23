# NotificationCleanupJob removes old notifications to prevent database bloat
class NotificationCleanupJob < ApplicationJob
  queue_as :maintenance
  
  def perform(days = 30)
    Rails.logger.info "NotificationCleanupJob: Starting cleanup of notifications older than #{days} days"
    
    cutoff_date = days.days.ago
    old_notifications = Notification.where('created_at < ?', cutoff_date)
    
    total_count = old_notifications.count
    deleted_count = 0
    
    # Delete in batches to avoid memory issues
    old_notifications.find_in_batches(batch_size: 1000) do |batch|
      batch_ids = batch.map(&:id)
      deleted_count += Notification.where(id: batch_ids).delete_all
      
      Rails.logger.debug "NotificationCleanupJob: Deleted batch of #{batch_ids.count} notifications"
    end
    
    Rails.logger.info "NotificationCleanupJob: Cleanup completed - deleted #{deleted_count} out of #{total_count} old notifications"
    
    # Log statistics
    log_cleanup_stats(deleted_count, total_count, days)
    
    deleted_count
  rescue StandardError => e
    Rails.logger.error "NotificationCleanupJob: Failed to cleanup notifications: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    raise
  end
  
  private
  
  def log_cleanup_stats(deleted_count, total_count, days)
    stats = {
      deleted_count: deleted_count,
      total_old_notifications: total_count,
      retention_days: days,
      cleanup_date: Time.current,
      remaining_notifications: Notification.count
    }
    
    Rails.logger.info "NotificationCleanupJob: Cleanup statistics: #{stats.to_json}"
    
    # Send alert if cleanup removed a significant number of notifications
    if deleted_count > 10000
      AlertService.instance.info(
        "Notification cleanup completed",
        {
          deleted_count: deleted_count,
          retention_days: days,
          message: "Large number of notifications cleaned up"
        }
      )
    end
  end
end
