# EventBus initializer
# Sets up event-driven architecture for notifications

Rails.application.config.after_initialize do
  # Initialize EventBus
  event_bus = EventBus.instance
  
  # Initialize NotificationSubscriber
  notification_subscriber = NotificationSubscriber.new
  
  Rails.logger.info "EventBus: Initialized with NotificationSubscriber"
  
  # You can add more subscribers here in the future
  # Example:
  # audit_subscriber = AuditSubscriber.new
  # analytics_subscriber = AnalyticsSubscriber.new
  
  # Test event bus functionality in development
  if Rails.env.development?
    Rails.logger.info "EventBus: Development mode - EventBus is ready for testing"
  end
end
