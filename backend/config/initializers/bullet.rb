# frozen_string_literal: true

# Bullet configuration for N+1 query detection
# Documentation: https://github.com/flyerhzm/bullet

if Rails.env.development?
  require 'bullet'

  Bullet.enable = true
  Bullet.alert = true
  Bullet.bullet_logger = true
  Bullet.console = true
  Bullet.rails_logger = true
  Bullet.add_footer = true

  # Configure notifications
  Bullet.add_safelist(
    type: :n_plus_one_query,
    class_name: 'User',
    association: :bookings
  )

  # Skip certain associations that are intentionally loaded
  Bullet.add_safelist(
    type: :n_plus_one_query,
    class_name: 'Booking',
    association: :search_query
  )

  # Configure alert behavior
  Bullet.alert = true
  Bullet.raise = false # Don't raise exceptions, just log warnings

  # Custom notification for production-like behavior
  Bullet.notification = lambda do |notification|
    Rails.logger.warn "BULLET: #{notification.title} - #{notification.body}"
    
    # Send alert for N+1 queries in development
    if notification.type == :n_plus_one_query
      AlertService.instance.warning("N+1 Query detected", {
        class_name: notification.class_name,
        association: notification.association,
        path: notification.path,
        line: notification.line
      })
    end
  end
end
