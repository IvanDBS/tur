# frozen_string_literal: true

# Alert Mailer for sending system alerts
class AlertMailer < ApplicationMailer
  default from: ENV['ALERT_EMAIL_FROM'] || 'alerts@yourdomain.com'

  def alert_notification(alert_data)
    @alert_data = alert_data
    @severity = alert_data[:severity] || 'info'
    @message = alert_data[:message] || 'System Alert'
    @details = alert_data[:details] || {}
    @timestamp = Time.current.strftime('%Y-%m-%d %H:%M:%S UTC')

    # Set recipients based on severity
    recipients = case @severity
                 when 'critical'
                   ENV['CRITICAL_ALERT_EMAILS']&.split(',') || [ENV['ADMIN_EMAIL']]
                 when 'warning'
                   ENV['WARNING_ALERT_EMAILS']&.split(',') || [ENV['ADMIN_EMAIL']]
                 else
                   ENV['INFO_ALERT_EMAILS']&.split(',') || [ENV['ADMIN_EMAIL']]
                 end

    # Filter out nil/empty recipients
    recipients = recipients.compact.reject(&:blank?)

    if recipients.any?
      mail(
        to: recipients,
        subject: "[#{@severity.upcase}] #{@message} - #{Rails.application.class.module_parent_name}",
        template_name: 'alert_notification'
      )
    else
      Rails.logger.warn "No email recipients configured for alert: #{@message}"
    end
  end
end
