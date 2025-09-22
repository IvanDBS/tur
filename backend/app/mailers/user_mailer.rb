# frozen_string_literal: true

# User Mailer for user-related emails
class UserMailer < ApplicationMailer
  default from: ENV['MAIL_FROM'] || 'noreply@yourdomain.com'

  def confirmation_email(user)
    @user = user
    @confirmation_url = generate_confirmation_url(user)
    @site_name = Rails.application.class.module_parent_name

    mail(
      to: @user.email,
      subject: "Подтвердите регистрацию в #{@site_name}",
      template_name: 'confirmation_email'
    )
  end

  private

  def generate_confirmation_url(user)
    # Generate a secure confirmation token
    token = generate_confirmation_token(user)
    
    # In development, use localhost
    if Rails.env.development?
      "http://localhost:3000/api/v1/email/confirm?token=#{token}"
    else
      # In production, use your domain
      "https://yourdomain.com/api/v1/email/confirm?token=#{token}"
    end
  end

  def generate_confirmation_token(user)
    # Create a secure token that expires in 24 hours
    payload = {
      user_id: user.id,
      email: user.email,
      exp: 24.hours.from_now.to_i,
      type: 'email_confirmation'
    }
    
    JWT.encode(payload, Rails.application.credentials.secret_key_base)
  end
end
