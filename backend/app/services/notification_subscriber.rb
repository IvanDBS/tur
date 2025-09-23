# NotificationSubscriber handles business events and creates notifications
class NotificationSubscriber
  def initialize
    @event_bus = EventBus.instance
    subscribe_to_events
  end
  
  def handle_event(event, _options = {})
    case event[:type]
    when EventBus::EVENTS[:user_registered]
      handle_user_registered(event[:data])
    when EventBus::EVENTS[:booking_created]
      handle_booking_created(event[:data])
    when EventBus::EVENTS[:booking_confirmed]
      handle_booking_confirmed(event[:data])
    when EventBus::EVENTS[:booking_cancelled]
      handle_booking_cancelled(event[:data])
    when EventBus::EVENTS[:booking_changed]
      handle_booking_changed(event[:data])
    when EventBus::EVENTS[:booking_expired]
      handle_booking_expired(event[:data])
    when EventBus::EVENTS[:system_maintenance]
      handle_system_maintenance(event[:data])
    when EventBus::EVENTS[:system_error]
      handle_system_error(event[:data])
    else
      Rails.logger.warn "NotificationSubscriber: Unknown event type #{event[:type]}"
    end
  end
  
  private
  
  def subscribe_to_events
    # Subscribe to all relevant events
    @event_bus.subscribe(EventBus::EVENTS[:user_registered], self.class)
    @event_bus.subscribe(EventBus::EVENTS[:booking_created], self.class)
    @event_bus.subscribe(EventBus::EVENTS[:booking_confirmed], self.class)
    @event_bus.subscribe(EventBus::EVENTS[:booking_cancelled], self.class)
    @event_bus.subscribe(EventBus::EVENTS[:booking_changed], self.class)
    @event_bus.subscribe(EventBus::EVENTS[:booking_expired], self.class)
    @event_bus.subscribe(EventBus::EVENTS[:system_maintenance], self.class)
    @event_bus.subscribe(EventBus::EVENTS[:system_error], self.class)
  end
  
  def handle_user_registered(data)
    create_notification(
      user_id: data[:user_id],
      title: 'Добро пожаловать!',
      message: "Добро пожаловать в migo.md! Ваш аккаунт успешно создан. Теперь вы можете искать и бронировать туры.",
      notification_type: 'success',
      delivery_channels: ['in_app', 'email'],
      event_type: 'user_registered',
      event_id: data[:user_id],
      metadata: {
        user_email: data[:user_email],
        user_name: data[:user_name]
      }
    )
  end
  
  def handle_booking_created(data)
    create_notification(
      user_id: data[:user_id],
      title: 'Бронирование создано',
      message: "Ваше бронирование успешно создано и ожидает подтверждения. Мы свяжемся с вами в ближайшее время.",
      notification_type: 'info',
      delivery_channels: ['in_app', 'email'],
      event_type: 'booking_created',
      event_id: data[:booking_id],
      metadata: {
        booking_id: data[:booking_id],
        booking_hash: data[:booking_hash],
        total_amount: data[:total_amount]
      }
    )
  end
  
  def handle_booking_confirmed(data)
    create_notification(
      user_id: data[:user_id],
      title: 'Бронирование подтверждено!',
      message: "Отличные новости! Ваше бронирование подтверждено. Детали поездки отправлены на вашу почту.",
      notification_type: 'success',
      delivery_channels: ['in_app', 'email'],
      event_type: 'booking_confirmed',
      event_id: data[:booking_id],
      metadata: {
        booking_id: data[:booking_id],
        booking_hash: data[:booking_hash],
        total_amount: data[:total_amount]
      }
    )
  end
  
  def handle_booking_cancelled(data)
    reason_text = data[:cancellation_reason] ? " Причина: #{data[:cancellation_reason]}" : ""
    
    create_notification(
      user_id: data[:user_id],
      title: 'Бронирование отменено',
      message: "Ваше бронирование было отменено.#{reason_text} Если у вас есть вопросы, обратитесь в службу поддержки.",
      notification_type: 'warning',
      delivery_channels: ['in_app', 'email'],
      event_type: 'booking_cancelled',
      event_id: data[:booking_id],
      metadata: {
        booking_id: data[:booking_id],
        booking_hash: data[:booking_hash],
        cancellation_reason: data[:cancellation_reason]
      }
    )
  end
  
  def handle_booking_changed(data)
    create_notification(
      user_id: data[:user_id],
      title: 'Изменения в бронировании',
      message: "В вашем бронировании произошли изменения. Пожалуйста, проверьте детали в личном кабинете.",
      notification_type: 'info',
      delivery_channels: ['in_app', 'email'],
      event_type: 'booking_changed',
      event_id: data[:booking_id],
      metadata: {
        booking_id: data[:booking_id],
        booking_hash: data[:booking_hash],
        changes: data[:changes]
      }
    )
  end
  
  def handle_booking_expired(data)
    create_notification(
      user_id: data[:user_id],
      title: 'Бронирование истекло',
      message: "Время ожидания подтверждения вашего бронирования истекло. Вы можете создать новое бронирование.",
      notification_type: 'warning',
      delivery_channels: ['in_app', 'email'],
      event_type: 'booking_expired',
      event_id: data[:booking_id],
      metadata: {
        booking_id: data[:booking_id],
        booking_hash: data[:booking_hash]
      }
    )
  end
  
  def handle_system_maintenance(data)
    # Send to all users
    User.find_each do |user|
      create_notification(
        user_id: user.id,
        title: 'Техническое обслуживание',
        message: data[:message] || "Запланировано техническое обслуживание системы. Возможны временные перебои в работе.",
        notification_type: 'info',
        delivery_channels: ['in_app'],
        event_type: 'system_maintenance',
        event_id: data[:maintenance_id],
        metadata: {
          maintenance_start: data[:start_time],
          maintenance_end: data[:end_time],
          affected_services: data[:affected_services]
        }
      )
    end
  end
  
  def handle_system_error(data)
    # Send to admins only
    User.where(admin: true).find_each do |admin|
      create_notification(
        user_id: admin.id,
        title: 'Системная ошибка',
        message: "Обнаружена системная ошибка: #{data[:error_message]}",
        notification_type: 'error',
        delivery_channels: ['in_app', 'email'],
        event_type: 'system_error',
        event_id: data[:error_id],
        metadata: {
          error_message: data[:error_message],
          error_details: data[:error_details],
          timestamp: data[:timestamp]
        }
      )
    end
  end
  
  def create_notification(attributes)
    begin
      Notification.create_from_event(
        attributes[:event_type],
        attributes
      )
      
      Rails.logger.info "NotificationSubscriber: Created notification for user #{attributes[:user_id]}"
    rescue StandardError => e
      Rails.logger.error "NotificationSubscriber: Failed to create notification: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
    end
  end
end
