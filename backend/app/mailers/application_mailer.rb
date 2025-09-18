# frozen_string_literal: true

# Application Mailer base class
class ApplicationMailer < ActionMailer::Base
  default from: ENV['MAIL_FROM'] || 'noreply@yourdomain.com'
  layout 'mailer'
end
