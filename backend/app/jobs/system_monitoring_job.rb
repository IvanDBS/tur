# System Monitoring Job for production health checks
class SystemMonitoringJob < ApplicationJob
  queue_as :default

  # Retry configuration
  sidekiq_options retry: 2, backtrace: 20

  def perform
    Rails.logger.info "Starting system monitoring check"
    alert_service = AlertService.instance

    # Check database connectivity
    check_database_health(alert_service)

    # Check Redis connectivity
    check_redis_health(alert_service)

    # Check Sidekiq queues
    check_sidekiq_queues(alert_service)

    # Check error rates
    check_error_rates(alert_service)

    # Check memory usage
    check_memory_usage(alert_service)

    Rails.logger.info "Completed system monitoring check"
  end

  private

  def check_database_health(alert_service)
    begin
      # Test database connection
      ActiveRecord::Base.connection.execute('SELECT 1')
      Rails.logger.info "✅ Database connection healthy"
    rescue StandardError => e
      Rails.logger.error "❌ Database connection failed: #{e.message}"
      alert_service.database_connection_failed({
        error: e.message,
        error_class: e.class.name,
        timestamp: Time.current.iso8601
      })
    end
  end

  def check_redis_health(alert_service)
    begin
      # Test Redis connection
      Redis.current.ping
      Rails.logger.info "✅ Redis connection healthy"
    rescue StandardError => e
      Rails.logger.error "❌ Redis connection failed: #{e.message}"
      alert_service.redis_connection_failed({
        error: e.message,
        error_class: e.class.name,
        timestamp: Time.current.iso8601
      })
    end
  end

  def check_sidekiq_queues(alert_service)
    begin
      # Check queue sizes
      stats = Sidekiq::Stats.new
      
      # Alert if any queue has too many jobs
      stats.queues.each do |queue_name, size|
        if size > 1000
          alert_service.sidekiq_queue_backlog(queue_name, size)
        end
      end

      # Alert if failed jobs are high
      if stats.failed > 100
        alert_service.warning("High number of failed Sidekiq jobs", {
          failed_jobs: stats.failed,
          processed_jobs: stats.processed
        })
      end

      Rails.logger.info "✅ Sidekiq queues healthy - Failed: #{stats.failed}, Processed: #{stats.processed}"
    rescue StandardError => e
      Rails.logger.error "❌ Sidekiq monitoring failed: #{e.message}"
      alert_service.error("Sidekiq monitoring failed", {
        error: e.message,
        timestamp: Time.current.iso8601
      })
    end
  end

  def check_error_rates(alert_service)
    begin
      # Check for high error rates in the last 5 minutes
      error_count = ApiLog.where(
        created_at: 5.minutes.ago..Time.current,
        status: [400, 401, 403, 404, 422, 500, 502, 503, 504]
      ).count

      if error_count > 50
        alert_service.high_error_rate(error_count, '5 minutes')
      end

      Rails.logger.info "✅ Error rate check completed - #{error_count} errors in last 5 minutes"
    rescue StandardError => e
      Rails.logger.error "❌ Error rate check failed: #{e.message}"
    end
  end

  def check_memory_usage(alert_service)
    begin
      # Get memory usage (works on Linux)
      if File.exist?('/proc/self/status')
        status = File.read('/proc/self/status')
        if (match = status.match(/VmRSS:\s+(\d+)\s+kB/))
          memory_kb = match[1].to_i
          memory_mb = memory_kb / 1024
          
          # Alert if memory usage is high (> 1GB)
          if memory_mb > 1024
            alert_service.warning("High memory usage detected", {
              memory_mb: memory_mb,
              memory_kb: memory_kb
            })
          end
          
          Rails.logger.info "✅ Memory usage: #{memory_mb}MB"
        end
      end
    rescue StandardError => e
      Rails.logger.error "❌ Memory check failed: #{e.message}"
    end
  end
end
