# NotificationChannel for real-time notifications via ActionCable
class NotificationChannel < ApplicationCable::Channel
  def subscribed
    # Subscribe to user-specific notifications
    stream_from "notifications_#{current_user.id}"
    
    Rails.logger.info "User #{current_user.id} subscribed to notifications channel"
  end

  def unsubscribed
    Rails.logger.info "User #{current_user.id} unsubscribed from notifications channel"
  end

  # Handle ping/pong for connection health
  def ping
    transmit({ type: 'pong', timestamp: Time.current.to_i })
  end

  private

  def current_user
    # Get user from JWT token in connection
    @current_user ||= find_user_from_token
  end

  def find_user_from_token
    # Extract token from connection headers or params
    token = connection.request.headers['Authorization']&.gsub(/^Bearer /, '') ||
            connection.params['token']
    
    return nil unless token

    begin
      decoded_token = JWT.decode(
        token,
        Rails.application.credentials.secret_key_base,
        true,
        { algorithm: 'HS256' }
      )
      
      # Check if token is in blacklist
      jti = decoded_token[0]['jti']
      return nil if JwtDenylist.exists?(jti: jti)
      
      user_id = decoded_token[0]['user_id']
      User.find(user_id)
    rescue JWT::DecodeError, JWT::ExpiredSignature, ActiveRecord::RecordNotFound
      nil
    end
  end
end
