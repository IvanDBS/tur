# NotificationDeliveryJob handles asynchronous delivery of notifications
class NotificationDeliveryJob < ApplicationJob
  queue_as :notifications
  
  # Retry configuration
  retry_on StandardError, wait: :exponentially_longer, attempts: 3
  
  # Discard job if notification doesn't exist
  discard_on ActiveRecord::RecordNotFound do |job, error|
    Rails.logger.warn "NotificationDeliveryJob: Notification not found, discarding job: #{error.message}"
  end
  
  def perform(notification_id)
    # Дополнительная проверка существования уведомления с повторной попыткой
    unless Notification.exists?(notification_id)
      Rails.logger.warn "NotificationDeliveryJob: Notification #{notification_id} does not exist, skipping delivery"
      return
    end
    
    # Дополнительная проверка с небольшой задержкой для транзакций
    sleep(0.1) unless Notification.exists?(notification_id)
    
    notification = Notification.find(notification_id)
    
    Rails.logger.info "NotificationDeliveryJob: Processing notification #{notification_id} for user #{notification.user_id}"
    
    # Deliver through each channel
    notification.delivery_channels.each do |channel|
      deliver_through_channel(notification, channel)
    end
    
    # Mark as delivered
    notification.mark_as_delivered!
    
    Rails.logger.info "NotificationDeliveryJob: Successfully delivered notification #{notification_id}"
  rescue StandardError => e
    Rails.logger.error "NotificationDeliveryJob: Failed to deliver notification #{notification_id}: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    raise
  end
  
  private
  
  def deliver_through_channel(notification, channel)
    case channel
    when 'in_app'
      deliver_in_app(notification)
    when 'email'
      deliver_email(notification)
    when 'sms'
      deliver_sms(notification)
    when 'push'
      deliver_push(notification)
    when 'webhook'
      deliver_webhook(notification)
    else
      Rails.logger.warn "NotificationDeliveryJob: Unknown delivery channel: #{channel}"
    end
  end
  
  def deliver_in_app(notification)
    # In-app notifications are already stored in database
    # We can trigger real-time updates via WebSocket here
    Rails.logger.debug "NotificationDeliveryJob: In-app notification delivered for user #{notification.user_id}"
    
    # Trigger WebSocket notification if user is online
    trigger_websocket_notification(notification)
  end
  
  def deliver_email(notification)
    return unless notification.user.email.present?
    
    begin
      UserMailer.notification_email(notification).deliver_now
      Rails.logger.info "NotificationDeliveryJob: Email notification sent to #{notification.user.email}"
    rescue StandardError => e
      Rails.logger.error "NotificationDeliveryJob: Failed to send email to #{notification.user.email}: #{e.message}"
      raise
    end
  end
  
  def deliver_sms(notification)
    return unless notification.user.phone.present?
    
    # SMS delivery would be implemented here
    # For now, just log
    Rails.logger.info "NotificationDeliveryJob: SMS notification would be sent to #{notification.user.phone}"
    
    # Example SMS service integration:
    # SmsService.new.send_notification(notification.user.phone, notification.title, notification.message)
  end
  
  def deliver_push(notification)
    # Push notification delivery would be implemented here
    # For now, just log
    Rails.logger.info "NotificationDeliveryJob: Push notification would be sent to user #{notification.user_id}"
    
    # Example push service integration:
    # PushService.new.send_notification(notification.user, notification.title, notification.message)
  end
  
  def deliver_webhook(notification)
    # Webhook delivery would be implemented here
    # For now, just log
    Rails.logger.info "NotificationDeliveryJob: Webhook notification would be sent for user #{notification.user_id}"
    
    # Example webhook delivery:
    # WebhookService.new.send_notification(notification)
  end
  
  def trigger_websocket_notification(notification)
    Rails.logger.debug "NotificationDeliveryJob: WebSocket notification triggered for user #{notification.user_id}"
    
    # Broadcast notification via ActionCable
    ActionCable.server.broadcast(
      "notifications_#{notification.user_id}",
      {
        type: 'notification',
        data: {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: notification.notification_type,
          delivery_channels: notification.delivery_channels,
          read: notification.read?,
          read_at: notification.read_at,
          created_at: notification.created_at.iso8601,
          metadata: notification.metadata
        }
      }
    )
  end
end
