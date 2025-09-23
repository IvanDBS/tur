# BulkNotificationJob handles mass notification delivery
class BulkNotificationJob < ApplicationJob
  queue_as :notifications
  
  # Retry configuration
  retry_on StandardError, wait: :exponentially_longer, attempts: 3
  
  def perform(notification_data, user_ids, delivery_channels = ['in_app'], admin_user_id = nil)
    Rails.logger.info "BulkNotificationJob: Starting bulk notification for #{user_ids.count} users"
    
    results = []
    success_count = 0
    failure_count = 0
    
    user_ids.each_slice(100) do |batch_user_ids|
      batch_results = process_batch(notification_data, batch_user_ids, delivery_channels)
      results.concat(batch_results)
      
      success_count += batch_results.count { |r| r[:success] }
      failure_count += batch_results.count { |r| !r[:success] }
    end
    
    # Log completion
    Rails.logger.info "BulkNotificationJob: Completed bulk notification - #{success_count} successful, #{failure_count} failed"
    
    # Send completion notification to admin if specified
    if admin_user_id.present?
      notify_admin_completion(admin_user_id, success_count, failure_count, notification_data[:title])
    end
    
    # Trigger event for analytics/monitoring
    EventBus.instance.admin_bulk_notification_sent(
      User.find(admin_user_id) if admin_user_id,
      User.where(id: user_ids),
      notification_data
    )
    
    results
  rescue StandardError => e
    Rails.logger.error "BulkNotificationJob: Failed to process bulk notification: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    raise
  end
  
  private
  
  def process_batch(notification_data, user_ids, delivery_channels)
    results = []
    
    user_ids.each do |user_id|
      begin
        notification = Notification.create!(
          user_id: user_id,
          title: notification_data[:title],
          message: notification_data[:message],
          notification_type: notification_data[:notification_type] || 'info',
          delivery_channels: delivery_channels,
          event_type: 'admin_message',
          metadata: notification_data[:metadata] || {}
        )
        
        # Trigger delivery job
        NotificationDeliveryJob.perform_async(notification.id)
        
        results << {
          user_id: user_id,
          success: true,
          notification_id: notification.id
        }
      rescue StandardError => e
        Rails.logger.error "BulkNotificationJob: Failed to create notification for user #{user_id}: #{e.message}"
        results << {
          user_id: user_id,
          success: false,
          error: e.message
        }
      end
    end
    
    results
  end
  
  def notify_admin_completion(admin_user_id, success_count, failure_count, title)
    admin = User.find(admin_user_id)
    
    message = if failure_count == 0
                "Массовая рассылка завершена успешно! Отправлено #{success_count} уведомлений."
              else
                "Массовая рассылка завершена. Успешно: #{success_count}, ошибок: #{failure_count}."
              end
    
    Notification.create!(
      user_id: admin_user_id,
      title: "Результат массовой рассылки: #{title}",
      message: message,
      notification_type: 'info',
      delivery_channels: ['in_app'],
      event_type: 'admin_bulk_notification_completed',
      metadata: {
        success_count: success_count,
        failure_count: failure_count,
        original_title: title
      }
    )
  rescue StandardError => e
    Rails.logger.error "BulkNotificationJob: Failed to notify admin: #{e.message}"
  end
end
