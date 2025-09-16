# Metrics Service
# Collects and tracks system metrics for monitoring
class MetricsService
  include Singleton

  def initialize
    @redis = Redis.current
    @metrics_prefix = "metrics:"
  end

  # Track operator operation metrics
  def self.track_operator_operation(operator_type:, operation:, duration:, success:)
    instance.track_operator_operation(operator_type, operation, duration, success)
  end

  # Track API request metrics
  def self.track_api_request(method:, path:, status:, duration:, user_id: nil)
    instance.track_api_request(method, path, status, duration, user_id)
  end

  # Track booking metrics
  def self.track_booking_operation(operation:, operator_type:, success:, duration: nil)
    instance.track_booking_operation(operation, operator_type, success, duration)
  end

  # Get metrics for dashboard
  def self.get_metrics(time_range: 1.hour)
    instance.get_metrics(time_range)
  end

  def track_operator_operation(operator_type, operation, duration, success)
    timestamp = Time.current.to_i
    key = "#{@metrics_prefix}operator:#{operator_type}:#{operation}"
    
    # Store individual metric
    @redis.zadd("#{key}:all", timestamp, {
      duration: duration,
      success: success,
      timestamp: timestamp
    }.to_json)
    
    # Update counters
    @redis.hincrby("#{key}:counters", "total", 1)
    @redis.hincrby("#{key}:counters", success ? "success" : "failure", 1)
    
    # Update duration stats
    @redis.zadd("#{key}:durations", duration, timestamp)
    
    # Set expiration (keep metrics for 7 days)
    @redis.expire("#{key}:all", 7.days.to_i)
    @redis.expire("#{key}:counters", 7.days.to_i)
    @redis.expire("#{key}:durations", 7.days.to_i)
  end

  def track_api_request(method, path, status, duration, user_id = nil)
    timestamp = Time.current.to_i
    key = "#{@metrics_prefix}api:#{method}:#{path}"
    
    # Store individual metric
    @redis.zadd("#{key}:all", timestamp, {
      status: status,
      duration: duration,
      user_id: user_id,
      timestamp: timestamp
    }.to_json)
    
    # Update counters
    @redis.hincrby("#{key}:counters", "total", 1)
    @redis.hincrby("#{key}:counters", "status_#{status}", 1)
    
    # Update duration stats
    @redis.zadd("#{key}:durations", duration, timestamp)
    
    # Set expiration
    @redis.expire("#{key}:all", 7.days.to_i)
    @redis.expire("#{key}:counters", 7.days.to_i)
    @redis.expire("#{key}:durations", 7.days.to_i)
  end

  def track_booking_operation(operation, operator_type, success, duration = nil)
    timestamp = Time.current.to_i
    key = "#{@metrics_prefix}booking:#{operation}:#{operator_type}"
    
    # Store individual metric
    @redis.zadd("#{key}:all", timestamp, {
      success: success,
      duration: duration,
      timestamp: timestamp
    }.to_json)
    
    # Update counters
    @redis.hincrby("#{key}:counters", "total", 1)
    @redis.hincrby("#{key}:counters", success ? "success" : "failure", 1)
    
    # Update duration stats if provided
    if duration
      @redis.zadd("#{key}:durations", duration, timestamp)
      @redis.expire("#{key}:durations", 7.days.to_i)
    end
    
    # Set expiration
    @redis.expire("#{key}:all", 7.days.to_i)
    @redis.expire("#{key}:counters", 7.days.to_i)
  end

  def get_metrics(time_range = 1.hour)
    start_time = (Time.current - time_range).to_i
    end_time = Time.current.to_i
    
    {
      operators: get_operator_metrics(start_time, end_time),
      api: get_api_metrics(start_time, end_time),
      bookings: get_booking_metrics(start_time, end_time),
      system: get_system_metrics
    }
  end

  private

  def get_operator_metrics(start_time, end_time)
    metrics = {}
    
    # Get all operator keys
    operator_keys = @redis.keys("#{@metrics_prefix}operator:*:counters")
    
    operator_keys.each do |key|
      parts = key.split(':')
      operator_type = parts[2]
      operation = parts[3]
      
      metrics[operator_type] ||= {}
      metrics[operator_type][operation] = {
        counters: @redis.hgetall("#{@metrics_prefix}operator:#{operator_type}:#{operation}:counters"),
        durations: get_duration_stats("#{@metrics_prefix}operator:#{operator_type}:#{operation}:durations", start_time, end_time)
      }
    end
    
    metrics
  end

  def get_api_metrics(start_time, end_time)
    metrics = {}
    
    # Get all API keys
    api_keys = @redis.keys("#{@metrics_prefix}api:*:counters")
    
    api_keys.each do |key|
      parts = key.split(':')
      method = parts[2]
      path = parts[3]
      
      metrics["#{method} #{path}"] = {
        counters: @redis.hgetall(key),
        durations: get_duration_stats("#{@metrics_prefix}api:#{method}:#{path}:durations", start_time, end_time)
      }
    end
    
    metrics
  end

  def get_booking_metrics(start_time, end_time)
    metrics = {}
    
    # Get all booking keys
    booking_keys = @redis.keys("#{@metrics_prefix}booking:*:counters")
    
    booking_keys.each do |key|
      parts = key.split(':')
      operation = parts[2]
      operator_type = parts[3]
      
      metrics[operation] ||= {}
      metrics[operation][operator_type] = {
        counters: @redis.hgetall(key),
        durations: get_duration_stats("#{@metrics_prefix}booking:#{operation}:#{operator_type}:durations", start_time, end_time)
      }
    end
    
    metrics
  end

  def get_system_metrics
    {
      redis_memory: @redis.info['used_memory_human'],
      redis_connected_clients: @redis.info['connected_clients'],
      sidekiq_stats: get_sidekiq_stats
    }
  end

  def get_sidekiq_stats
    stats = Sidekiq::Stats.new
    {
      processed: stats.processed,
      failed: stats.failed,
      queues: stats.queues
    }
  rescue StandardError
    {}
  end

  def get_duration_stats(key, start_time, end_time)
    durations = @redis.zrangebyscore(key, start_time, end_time)
    return {} if durations.empty?
    
    durations = durations.map(&:to_f)
    {
      min: durations.min,
      max: durations.max,
      avg: durations.sum / durations.size,
      p95: calculate_percentile(durations, 95),
      p99: calculate_percentile(durations, 99)
    }
  end

  def calculate_percentile(values, percentile)
    sorted = values.sort
    index = (percentile / 100.0) * (sorted.length - 1)
    lower = sorted[index.floor]
    upper = sorted[index.ceil]
    lower + (upper - lower) * (index - index.floor)
  end
end
