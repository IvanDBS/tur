# NotificationMonitoringService for tracking notification metrics and health
class NotificationMonitoringService
  include Singleton
  
  # Key metrics to track
  METRICS = {
    total_notifications: 'notifications.total',
    unread_notifications: 'notifications.unread',
    delivered_notifications: 'notifications.delivered',
    pending_notifications: 'notifications.pending',
    delivery_success_rate: 'notifications.delivery_success_rate',
    channel_performance: 'notifications.channel_performance',
    error_rate: 'notifications.error_rate',
    avg_delivery_time: 'notifications.avg_delivery_time'
  }.freeze
  
  def initialize
    @metrics_cache = {}
    @cache_expiry = 5.minutes
  end
  
  # Get comprehensive notification metrics
  def get_metrics(timeframe = 24.hours)
    cache_key = "notification_metrics_#{timeframe.to_i}"
    
    if cache_expired?(cache_key)
      @metrics_cache[cache_key] = calculate_metrics(timeframe)
      @metrics_cache[cache_key][:cached_at] = Time.current
    end
    
    @metrics_cache[cache_key]
  end
  
  # Get delivery performance by channel
  def get_channel_performance(timeframe = 24.hours)
    start_time = timeframe.ago
    
    channel_stats = {}
    
    Notification::DELIVERY_CHANNELS.each do |channel|
      channel_notifications = Notification.where(
        created_at: start_time..,
        delivery_channels: [channel]
      )
      
      total = channel_notifications.count
      delivered = channel_notifications.where(delivered: true).count
      failed = total - delivered
      
      channel_stats[channel] = {
        total: total,
        delivered: delivered,
        failed: failed,
        success_rate: total > 0 ? (delivered.to_f / total * 100).round(2) : 0,
        avg_delivery_time: calculate_avg_delivery_time(channel_notifications)
      }
    end
    
    channel_stats
  end
  
  # Get error patterns and trends
  def get_error_analysis(timeframe = 24.hours)
    start_time = timeframe.ago
    
    # Get failed deliveries
    failed_notifications = Notification.where(
      created_at: start_time..,
      delivered: false
    )
    
    # Group by error patterns (would need error logging for detailed analysis)
    error_patterns = {
      total_failed: failed_notifications.count,
      by_channel: failed_notifications.group(:delivery_channels).count,
      by_type: failed_notifications.group(:notification_type).count,
      by_hour: failed_notifications.group("DATE_TRUNC('hour', created_at)").count
    }
    
    error_patterns
  end
  
  # Health check for notification system
  def health_check
    health_status = {
      status: 'healthy',
      checks: {},
      timestamp: Time.current
    }
    
    # Check database connectivity
    health_status[:checks][:database] = check_database_health
    
    # Check Redis connectivity (for ActionCable)
    health_status[:checks][:redis] = check_redis_health
    
    # Check delivery job queue
    health_status[:checks][:job_queue] = check_job_queue_health
    
    # Check recent delivery success rate
    health_status[:checks][:delivery_rate] = check_delivery_rate
    
    # Overall status
    if health_status[:checks].values.any? { |check| check[:status] != 'healthy' }
      health_status[:status] = 'degraded'
    end
    
    health_status
  end
  
  # Send alerts for critical issues
  def check_and_alert
    metrics = get_metrics(1.hour)
    
    # Alert if delivery success rate drops below 90%
    if metrics[:delivery_success_rate] < 90
      AlertService.instance.critical(
        "Notification delivery success rate is low: #{metrics[:delivery_success_rate]}%",
        {
          metric: 'delivery_success_rate',
          value: metrics[:delivery_success_rate],
          threshold: 90
        }
      )
    end
    
    # Alert if error rate is high
    if metrics[:error_rate] > 10
      AlertService.instance.warning(
        "High notification error rate: #{metrics[:error_rate]}%",
        {
          metric: 'error_rate',
          value: metrics[:error_rate],
          threshold: 10
        }
      )
    end
    
    # Alert if pending notifications are accumulating
    if metrics[:pending_notifications] > 100
      AlertService.instance.warning(
        "High number of pending notifications: #{metrics[:pending_notifications]}",
        {
          metric: 'pending_notifications',
          value: metrics[:pending_notifications],
          threshold: 100
        }
      )
    end
  end
  
  private
  
  def calculate_metrics(timeframe)
    start_time = timeframe.ago
    
    total = Notification.where(created_at: start_time..).count
    unread = Notification.where(created_at: start_time.., read_at: nil).count
    delivered = Notification.where(created_at: start_time.., delivered: true).count
    pending = Notification.where(created_at: start_time.., delivered: false).count
    
    delivery_success_rate = total > 0 ? (delivered.to_f / total * 100).round(2) : 0
    error_rate = total > 0 ? ((total - delivered).to_f / total * 100).round(2) : 0
    
    {
      total_notifications: total,
      unread_notifications: unread,
      delivered_notifications: delivered,
      pending_notifications: pending,
      delivery_success_rate: delivery_success_rate,
      error_rate: error_rate,
      channel_performance: get_channel_performance(timeframe),
      avg_delivery_time: calculate_overall_avg_delivery_time(start_time),
      timeframe: timeframe.to_i,
      generated_at: Time.current
    }
  end
  
  def calculate_avg_delivery_time(notifications)
    delivered_notifications = notifications.where.not(delivered_at: nil)
    
    return 0 if delivered_notifications.empty?
    
    total_time = delivered_notifications.sum do |notification|
      (notification.delivered_at - notification.created_at).to_f
    end
    
    (total_time / delivered_notifications.count).round(2)
  end
  
  def calculate_overall_avg_delivery_time(start_time)
    delivered_notifications = Notification.where(
      created_at: start_time..,
      delivered: true
    ).where.not(delivered_at: nil)
    
    return 0 if delivered_notifications.empty?
    
    total_time = delivered_notifications.sum do |notification|
      (notification.delivered_at - notification.created_at).to_f
    end
    
    (total_time / delivered_notifications.count).round(2)
  end
  
  def cache_expired?(cache_key)
    return true unless @metrics_cache[cache_key]
    
    cached_at = @metrics_cache[cache_key][:cached_at]
    cached_at.nil? || cached_at < @cache_expiry.ago
  end
  
  def check_database_health
    start_time = Time.current
    Notification.count
    response_time = ((Time.current - start_time) * 1000).round(2)
    
    {
      status: response_time < 1000 ? 'healthy' : 'slow',
      response_time_ms: response_time,
      message: response_time < 1000 ? 'Database responding normally' : 'Database response is slow'
    }
  rescue StandardError => e
    {
      status: 'unhealthy',
      error: e.message,
      message: 'Database connection failed'
    }
  end
  
  def check_redis_health
    start_time = Time.current
    Rails.cache.write('health_check', 'test', expires_in: 1.second)
    Rails.cache.read('health_check')
    response_time = ((Time.current - start_time) * 1000).round(2)
    
    {
      status: response_time < 500 ? 'healthy' : 'slow',
      response_time_ms: response_time,
      message: response_time < 500 ? 'Redis responding normally' : 'Redis response is slow'
    }
  rescue StandardError => e
    {
      status: 'unhealthy',
      error: e.message,
      message: 'Redis connection failed'
    }
  end
  
  def check_job_queue_health
    # Check Sidekiq queue size
    queue_size = Sidekiq::Queue.new('notifications').size
    
    {
      status: queue_size < 1000 ? 'healthy' : 'congested',
      queue_size: queue_size,
      message: queue_size < 1000 ? 'Job queue is normal' : 'Job queue is congested'
    }
  rescue StandardError => e
    {
      status: 'unhealthy',
      error: e.message,
      message: 'Job queue check failed'
    }
  end
  
  def check_delivery_rate
    metrics = get_metrics(1.hour)
    
    {
      status: metrics[:delivery_success_rate] > 90 ? 'healthy' : 'degraded',
      success_rate: metrics[:delivery_success_rate],
      message: metrics[:delivery_success_rate] > 90 ? 'Delivery rate is good' : 'Delivery rate is low'
    }
  end
end
