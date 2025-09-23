# NotificationDeliveryService manages notification delivery across multiple channels
class NotificationDeliveryService
  include Singleton
  
  def initialize
    @delivery_handlers = {
      'in_app' => InAppDeliveryHandler.new,
      'email' => EmailDeliveryHandler.new,
      'sms' => SmsDeliveryHandler.new,
      'push' => PushDeliveryHandler.new,
      'webhook' => WebhookDeliveryHandler.new
    }
  end
  
  # Deliver notification through specified channels
  def deliver(notification, channels = nil)
    channels ||= notification.delivery_channels
    
    results = {}
    
    channels.each do |channel|
      begin
        result = deliver_through_channel(notification, channel)
        results[channel] = { success: true, result: result }
      rescue StandardError => e
        Rails.logger.error "NotificationDeliveryService: Failed to deliver through #{channel}: #{e.message}"
        results[channel] = { success: false, error: e.message }
      end
    end
    
    results
  end
  
  # Deliver to multiple users (bulk delivery)
  def deliver_bulk(notification_data, user_ids, channels = ['in_app'])
    results = []
    
    user_ids.each do |user_id|
      begin
        notification = Notification.create!(
          user_id: user_id,
          title: notification_data[:title],
          message: notification_data[:message],
          notification_type: notification_data[:notification_type] || 'info',
          delivery_channels: channels,
          event_type: 'admin_message',
          metadata: notification_data[:metadata] || {}
        )
        
        # Trigger delivery job
        NotificationDeliveryJob.perform_async(notification.id)
        
        results << { user_id: user_id, success: true, notification_id: notification.id }
      rescue StandardError => e
        Rails.logger.error "NotificationDeliveryService: Failed to create notification for user #{user_id}: #{e.message}"
        results << { user_id: user_id, success: false, error: e.message }
      end
    end
    
    results
  end
  
  # Get delivery statistics
  def delivery_stats(timeframe = 24.hours)
    start_time = timeframe.ago
    
    {
      total_notifications: Notification.where(created_at: start_time..).count,
      delivered_notifications: Notification.where(created_at: start_time.., delivered: true).count,
      pending_notifications: Notification.where(created_at: start_time.., delivered: false).count,
      channel_stats: channel_delivery_stats(start_time),
      error_rate: calculate_error_rate(start_time)
    }
  end
  
  private
  
  def deliver_through_channel(notification, channel)
    handler = @delivery_handlers[channel]
    
    unless handler
      raise "Unknown delivery channel: #{channel}"
    end
    
    handler.deliver(notification)
  end
  
  def channel_delivery_stats(start_time)
    stats = {}
    
    Notification::DELIVERY_CHANNELS.each do |channel|
      channel_notifications = Notification.where(
        created_at: start_time..,
        delivery_channels: [channel]
      )
      
      stats[channel] = {
        total: channel_notifications.count,
        delivered: channel_notifications.where(delivered: true).count,
        pending: channel_notifications.where(delivered: false).count
      }
    end
    
    stats
  end
  
  def calculate_error_rate(start_time)
    total = Notification.where(created_at: start_time..).count
    return 0 if total == 0
    
    failed = Notification.where(created_at: start_time.., delivered: false).count
    (failed.to_f / total * 100).round(2)
  end
end

# Base class for delivery handlers
class BaseDeliveryHandler
  def deliver(notification)
    raise NotImplementedError, "Subclasses must implement deliver method"
  end
  
  def supports_channel?(channel)
    raise NotImplementedError, "Subclasses must implement supports_channel? method"
  end
end

# In-app delivery handler
class InAppDeliveryHandler < BaseDeliveryHandler
  def deliver(notification)
    # In-app notifications are already stored in database
    # Trigger real-time updates
    trigger_realtime_update(notification)
    { status: 'delivered', method: 'in_app' }
  end
  
  def supports_channel?(channel)
    channel == 'in_app'
  end
  
  private
  
  def trigger_realtime_update(notification)
    # This would trigger WebSocket/ActionCable update
    Rails.logger.debug "InAppDeliveryHandler: Triggering real-time update for notification #{notification.id}"
  end
end

# Email delivery handler
class EmailDeliveryHandler < BaseDeliveryHandler
  def deliver(notification)
    return { status: 'skipped', reason: 'no_email' } unless notification.user.email.present?
    
    UserMailer.notification_email(notification).deliver_now
    { status: 'delivered', method: 'email', recipient: notification.user.email }
  end
  
  def supports_channel?(channel)
    channel == 'email'
  end
end

# SMS delivery handler
class SmsDeliveryHandler < BaseDeliveryHandler
  def deliver(notification)
    return { status: 'skipped', reason: 'no_phone' } unless notification.user.phone.present?
    
    # SMS delivery implementation would go here
    Rails.logger.info "SmsDeliveryHandler: SMS would be sent to #{notification.user.phone}"
    { status: 'delivered', method: 'sms', recipient: notification.user.phone }
  end
  
  def supports_channel?(channel)
    channel == 'sms'
  end
end

# Push notification delivery handler
class PushDeliveryHandler < BaseDeliveryHandler
  def deliver(notification)
    # Push notification implementation would go here
    Rails.logger.info "PushDeliveryHandler: Push notification would be sent to user #{notification.user_id}"
    { status: 'delivered', method: 'push', recipient: notification.user_id }
  end
  
  def supports_channel?(channel)
    channel == 'push'
  end
end

# Webhook delivery handler
class WebhookDeliveryHandler < BaseDeliveryHandler
  def deliver(notification)
    # Webhook delivery implementation would go here
    Rails.logger.info "WebhookDeliveryHandler: Webhook would be sent for user #{notification.user_id}"
    { status: 'delivered', method: 'webhook', recipient: notification.user_id }
  end
  
  def supports_channel?(channel)
    channel == 'webhook'
  end
end
