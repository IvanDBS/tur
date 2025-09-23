# Notification model for user notifications with event-driven architecture
class Notification < ApplicationRecord
  include JsonFieldSupport
  
  # Associations
  belongs_to :user
  
  # JSON fields with caching
  json_field :metadata, cache_expires_in: 1.hour
  
  # Enums
  enum :notification_type, {
    info: 'info',
    success: 'success', 
    warning: 'warning',
    error: 'error',
    booking_update: 'booking_update',
    system: 'system',
    admin_message: 'admin_message'
  }
  
  # Delivery channels enum
  DELIVERY_CHANNELS = %w[in_app email sms push webhook].freeze
  
  # Validations
  validates :title, presence: true, length: { maximum: 255 }
  validates :message, presence: true, length: { maximum: 2000 }
  validates :notification_type, presence: true
  validates :delivery_channels, presence: true
  validate :valid_delivery_channels
  
  # Scopes
  scope :unread, -> { where(read_at: nil) }
  scope :read, -> { where.not(read_at: nil) }
  scope :recent, -> { order(created_at: :desc) }
  scope :by_type, ->(type) { where(notification_type: type) }
  scope :by_event, ->(event_type, event_id = nil) { 
    scope = where(event_type: event_type)
    scope = scope.where(event_id: event_id) if event_id
    scope
  }
  scope :pending_delivery, -> { where(delivered: false) }
  scope :delivered, -> { where(delivered: true) }
  
  # Callbacks
  before_validation :set_default_delivery_channels, on: :create
  after_create :trigger_delivery_job
  
  # Instance methods
  def read?
    read_at.present?
  end
  
  def unread?
    !read?
  end
  
  def mark_as_read!
    update!(read_at: Time.current) unless read?
  end
  
  def mark_as_delivered!
    update!(delivered: true, delivered_at: Time.current) unless delivered?
  end
  
  def delivered?
    delivered
  end
  
  def supports_channel?(channel)
    delivery_channels.include?(channel.to_s)
  end
  
  def add_delivery_channel(channel)
    return unless DELIVERY_CHANNELS.include?(channel.to_s)
    return if delivery_channels.include?(channel.to_s)
    
    self.delivery_channels = delivery_channels + [channel.to_s]
  end
  
  def remove_delivery_channel(channel)
    self.delivery_channels = delivery_channels - [channel.to_s]
  end
  
  # Class methods
  class << self
    def create_from_event(event_type, event_data)
      # Этот метод будет вызываться из EventBus
      # event_data должен содержать: user_id, title, message, metadata
      create!(
        user_id: event_data[:user_id],
        title: event_data[:title],
        message: event_data[:message],
        notification_type: event_data[:notification_type] || 'info',
        delivery_channels: event_data[:delivery_channels] || ['in_app'],
        event_type: event_type,
        event_id: event_data[:event_id],
        metadata: event_data[:metadata] || {}
      )
    end
    
    def cleanup_old_notifications(days = 30)
      where('created_at < ?', days.days.ago).delete_all
    end
    
    def unread_count_for_user(user_id)
      where(user_id: user_id, read_at: nil).count
    end
  end
  
  private
  
  def set_default_delivery_channels
    self.delivery_channels = ['in_app'] if delivery_channels.blank?
  end
  
  def valid_delivery_channels
    return if delivery_channels.blank?
    
    invalid_channels = delivery_channels - DELIVERY_CHANNELS
    if invalid_channels.any?
      errors.add(:delivery_channels, "contains invalid channels: #{invalid_channels.join(', ')}")
    end
  end
  
  def trigger_delivery_job
    # Запускаем асинхронную доставку уведомления с большой задержкой
    # чтобы избежать race condition с транзакцией базы данных
    NotificationDeliveryJob.set(wait: 10.seconds).perform_later(id)
  end
end
