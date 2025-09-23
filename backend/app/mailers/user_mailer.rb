# UserMailer for sending user notifications
class UserMailer < ApplicationMailer
  default from: ENV['MAIL_FROM'] || 'noreply@migo.md'

  def notification_email(notification)
    @notification = notification
    @user = notification.user
    @title = notification.title
    @message = notification.message
    @notification_type = notification.notification_type
    @metadata = notification.metadata || {}
    
    # Set subject based on notification type
    subject_prefix = case notification.notification_type
                    when 'success'
                      '✅ '
                    when 'warning'
                      '⚠️ '
                    when 'error'
                      '❌ '
                    when 'booking_update'
                      '📋 '
                    else
                      'ℹ️ '
                    end
    
    mail(
      to: @user.email,
      subject: "#{subject_prefix}#{@title}",
      template_name: 'notification_email'
    )
  end
  
  def welcome_email(user)
    @user = user
    @name = user.full_name
    
    mail(
      to: @user.email,
      subject: 'Добро пожаловать в migo.md!',
      template_name: 'welcome_email'
    )
  end
  
  def booking_confirmation_email(booking)
    @booking = booking
    @user = booking.user
    @tour_details = booking.tour_details || {}
    @customer_data = booking.customer_data || {}
    
    mail(
      to: @user.email,
      subject: "Подтверждение бронирования #{booking.obs_booking_hash}",
      template_name: 'booking_confirmation_email'
    )
  end
  
  def booking_cancellation_email(booking, reason = nil)
    @booking = booking
    @user = booking.user
    @reason = reason
    @tour_details = booking.tour_details || {}
    
    mail(
      to: @user.email,
      subject: "Отмена бронирования #{booking.obs_booking_hash}",
      template_name: 'booking_cancellation_email'
    )
  end
end