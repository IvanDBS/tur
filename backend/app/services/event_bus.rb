# EventBus service for event-driven architecture
# Handles business events and triggers appropriate subscribers
class EventBus
  include Singleton
  
  # Event types
  EVENTS = {
    # User events
    user_registered: 'user_registered',
    user_updated: 'user_updated',
    user_banned: 'user_banned',
    user_unbanned: 'user_unbanned',
    
    # Booking events
    booking_created: 'booking_created',
    booking_confirmed: 'booking_confirmed',
    booking_cancelled: 'booking_cancelled',
    booking_changed: 'booking_changed',
    booking_expired: 'booking_expired',
    booking_payment_failed: 'booking_payment_failed',
    
    # System events
    system_maintenance: 'system_maintenance',
    system_error: 'system_error',
    api_rate_limit_exceeded: 'api_rate_limit_exceeded',
    
    # Admin events
    admin_notification_sent: 'admin_notification_sent',
    admin_bulk_notification_sent: 'admin_bulk_notification_sent'
  }.freeze
  
  def initialize
    @subscribers = {}
    @event_history = []
    @enabled = true
  end
  
  # Publish an event to all subscribers
  def publish(event_type, event_data = {})
    return unless @enabled
    
    event = build_event(event_type, event_data)
    
    # Log event
    log_event(event)
    
    # Store in history (for debugging/monitoring)
    @event_history << event
    cleanup_event_history
    
    # Notify subscribers
    notify_subscribers(event)
    
    Rails.logger.info "EventBus: Published event #{event_type} with data: #{event_data.inspect}"
    
    event
  rescue StandardError => e
    Rails.logger.error "EventBus: Failed to publish event #{event_type}: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    raise
  end
  
  # Subscribe to events
  def subscribe(event_type, subscriber_class, options = {})
    @subscribers[event_type] ||= []
    @subscribers[event_type] << {
      class: subscriber_class,
      options: options
    }
    
    Rails.logger.info "EventBus: Subscribed #{subscriber_class} to #{event_type}"
  end
  
  # Unsubscribe from events
  def unsubscribe(event_type, subscriber_class)
    return unless @subscribers[event_type]
    
    @subscribers[event_type].reject! { |sub| sub[:class] == subscriber_class }
    
    Rails.logger.info "EventBus: Unsubscribed #{subscriber_class} from #{event_type}"
  end
  
  # Get event history (for debugging)
  def event_history(limit = 100)
    @event_history.last(limit)
  end
  
  # Enable/disable event bus
  def enable!
    @enabled = true
  end
  
  def disable!
    @enabled = false
  end
  
  # Convenience methods for common events
  def user_registered(user, metadata = {})
    user_name = if user.first_name.present? && user.last_name.present?
                  "#{user.first_name} #{user.last_name}"
                elsif user.first_name.present?
                  user.first_name
                else
                  user.email.split('@')[0]
                end
    
    publish(EVENTS[:user_registered], {
      user_id: user.id,
      user_email: user.email,
      user_name: user_name,
      metadata: metadata
    })
  end
  
  def booking_created(booking, metadata = {})
    publish(EVENTS[:booking_created], {
      user_id: booking.user_id,
      booking_id: booking.id,
      booking_hash: booking.obs_booking_hash,
      total_amount: booking.total_amount,
      metadata: metadata
    })
  end
  
  def booking_confirmed(booking, metadata = {})
    publish(EVENTS[:booking_confirmed], {
      user_id: booking.user_id,
      booking_id: booking.id,
      booking_hash: booking.obs_booking_hash,
      total_amount: booking.total_amount,
      metadata: metadata
    })
  end
  
  def booking_cancelled(booking, reason = nil, metadata = {})
    publish(EVENTS[:booking_cancelled], {
      user_id: booking.user_id,
      booking_id: booking.id,
      booking_hash: booking.obs_booking_hash,
      cancellation_reason: reason,
      metadata: metadata
    })
  end
  
  def system_error(error_message, metadata = {})
    publish(EVENTS[:system_error], {
      error_message: error_message,
      metadata: metadata
    })
  end
  
  def admin_notification_sent(admin_user, target_users, notification_data)
    publish(EVENTS[:admin_notification_sent], {
      admin_user_id: admin_user.id,
      target_user_ids: target_users.map(&:id),
      notification_count: target_users.count,
      notification_data: notification_data
    })
  end
  
  private
  
  def build_event(event_type, event_data)
    {
      id: SecureRandom.uuid,
      type: event_type,
      data: event_data,
      timestamp: Time.current,
      published_at: Time.current
    }
  end
  
  def log_event(event)
    Rails.logger.info "EventBus: Event #{event[:type]} published at #{event[:timestamp]}"
  end
  
  def notify_subscribers(event)
    subscribers = @subscribers[event[:type]] || []
    
    subscribers.each do |subscriber_info|
      begin
        subscriber_class = subscriber_info[:class]
        options = subscriber_info[:options]
        
        # Create subscriber instance and handle event
        subscriber = subscriber_class.new
        subscriber.handle_event(event, options)
        
        Rails.logger.debug "EventBus: Notified #{subscriber_class} for event #{event[:type]}"
      rescue StandardError => e
        Rails.logger.error "EventBus: Subscriber #{subscriber_info[:class]} failed to handle event #{event[:type]}: #{e.message}"
        Rails.logger.error e.backtrace.join("\n")
        
        # Don't re-raise to prevent one failed subscriber from breaking others
      end
    end
  end
  
  def cleanup_event_history
    # Keep only last 1000 events to prevent memory leaks
    @event_history = @event_history.last(1000) if @event_history.size > 1000
  end
end
