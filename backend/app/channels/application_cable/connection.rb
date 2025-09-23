# ApplicationCable::Connection for ActionCable authentication
module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
      logger.add_tags "ActionCable", current_user.email
    end

    private

    def find_verified_user
      # Extract token from connection headers or params
      token = request.headers['Authorization']&.gsub(/^Bearer /, '') ||
              request.params['token']
      
      if token.present?
        verified_user = verify_jwt_token(token)
        return verified_user if verified_user
      end

      # Reject connection if no valid user found
      reject_unauthorized_connection
    end

    def verify_jwt_token(token)
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
        user = User.find(user_id)
        
        # Check if user is not banned
        return nil if user.banned?
        
        user
      rescue JWT::DecodeError, JWT::ExpiredSignature, ActiveRecord::RecordNotFound
        nil
      end
    end
  end
end
