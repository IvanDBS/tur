# Alert Service for production monitoring and notifications
class AlertService
  include Singleton

  # Alert levels
  LEVELS = {
    info: 'INFO',
    warning: 'WARNING', 
    error: 'ERROR',
    critical: 'CRITICAL'
  }.freeze

  def initialize
    @slack_webhook = ENV['SLACK_WEBHOOK_URL']
    @email_alerts = ENV['ALERT_EMAIL']
    @enabled = Rails.env.production? || ENV['ALERTS_ENABLED'] == 'true'
  end

  # Send alert with multiple channels
  def send_alert(level, message, details = {})
    return unless @enabled

    alert_data = {
      level: level,
      message: message,
      details: details,
      timestamp: Time.current.iso8601,
      environment: Rails.env,
      service: 'Tour Booking API'
    }

    # Send to multiple channels
    send_to_slack(alert_data) if @slack_webhook.present?
    send_to_email(alert_data) if @email_alerts.present?
    send_to_logs(alert_data)

    Rails.logger.info "Alert sent: #{level.upcase} - #{message}"
  end

  # Convenience methods for different alert levels
  def info(message, details = {})
    send_alert(:info, message, details)
  end

  def warning(message, details = {})
    send_alert(:warning, message, details)
  end

  def error(message, details = {})
    send_alert(:error, message, details)
  end

  def critical(message, details = {})
    send_alert(:critical, message, details)
  end

  # Specific alert methods for common scenarios
  def obs_api_down(details = {})
    critical("OBS API is down or unreachable", details)
  end

  def obs_auth_failed(details = {})
    error("OBS API authentication failed", details)
  end

  def booking_sync_failed(booking_id, details = {})
    error("Booking sync failed for booking #{booking_id}", details)
  end

  def high_error_rate(error_count, time_window = '5 minutes')
    warning("High error rate detected: #{error_count} errors in #{time_window}", {
      error_count: error_count,
      time_window: time_window
    })
  end

  def database_connection_failed(details = {})
    critical("Database connection failed", details)
  end

  def redis_connection_failed(details = {})
    critical("Redis connection failed", details)
  end

  def sidekiq_queue_backlog(queue_name, job_count)
    warning("Sidekiq queue backlog: #{job_count} jobs in #{queue_name}", {
      queue: queue_name,
      job_count: job_count
    })
  end

  private

  def send_to_slack(alert_data)
    return unless @slack_webhook.present?

    payload = {
      text: format_slack_message(alert_data),
      username: 'Tour Booking Monitor',
      icon_emoji: get_slack_emoji(alert_data[:level]),
      attachments: [{
        color: get_slack_color(alert_data[:level]),
        fields: format_slack_fields(alert_data)
      }]
    }

    send_http_request(@slack_webhook, payload)
  rescue StandardError => e
    Rails.logger.error "Failed to send Slack alert: #{e.message}"
  end

  def send_to_email(alert_data)
    return unless @email_alerts.present?

    # In production, you would use ActionMailer
    # For now, just log the email content
    email_content = format_email_message(alert_data)
    Rails.logger.info "EMAIL ALERT: #{email_content}"
    
    # TODO: Implement actual email sending with ActionMailer
    # AlertMailer.alert_notification(alert_data).deliver_now
  rescue StandardError => e
    Rails.logger.error "Failed to send email alert: #{e.message}"
  end

  def send_to_logs(alert_data)
    log_level = case alert_data[:level]
                when :info then :info
                when :warning then :warn
                when :error then :error
                when :critical then :error
                end

    Rails.logger.public_send(log_level, "ALERT [#{alert_data[:level].upcase}]: #{alert_data[:message]}")
    
    if alert_data[:details].any?
      Rails.logger.public_send(log_level, "Alert details: #{alert_data[:details].to_json}")
    end
  end

  def send_http_request(url, payload)
    uri = URI(url)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = uri.scheme == 'https'
    
    request = Net::HTTP::Post.new(uri)
    request['Content-Type'] = 'application/json'
    request.body = payload.to_json
    
    response = http.request(request)
    
    unless response.is_a?(Net::HTTPSuccess)
      Rails.logger.error "HTTP request failed: #{response.code} #{response.message}"
    end
  end

  def format_slack_message(alert_data)
    emoji = get_slack_emoji(alert_data[:level])
    "#{emoji} *#{alert_data[:level].upcase}* - #{alert_data[:message]}"
  end

  def format_slack_fields(alert_data)
    fields = [
      { title: 'Environment', value: alert_data[:environment], short: true },
      { title: 'Service', value: alert_data[:service], short: true },
      { title: 'Timestamp', value: alert_data[:timestamp], short: true }
    ]

    if alert_data[:details].any?
      details_text = alert_data[:details].map { |k, v| "#{k}: #{v}" }.join("\n")
      fields << { title: 'Details', value: details_text, short: false }
    end

    fields
  end

  def format_email_message(alert_data)
    <<~EMAIL
      ALERT: #{alert_data[:level].upcase}
      
      Message: #{alert_data[:message]}
      Environment: #{alert_data[:environment]}
      Service: #{alert_data[:service]}
      Timestamp: #{alert_data[:timestamp]}
      
      Details:
      #{alert_data[:details].map { |k, v| "#{k}: #{v}" }.join("\n")}
    EMAIL
  end

  def get_slack_emoji(level)
    case level
    when :info then ':information_source:'
    when :warning then ':warning:'
    when :error then ':x:'
    when :critical then ':rotating_light:'
    else ':question:'
    end
  end

  def get_slack_color(level)
    case level
    when :info then 'good'
    when :warning then 'warning'
    when :error, :critical then 'danger'
    else 'good'
    end
  end
end
