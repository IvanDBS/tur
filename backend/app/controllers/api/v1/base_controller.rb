require 'jwt'

module Api
  module V1
    class BaseController < ActionController::API
      include ActionController::Cookies
      include Pagy::Backend
      include IdorProtection
      # Base controller for all API endpoints
      # Add common functionality here

      # Add monitoring and metrics tracking
      before_action :track_api_metrics
      after_action :log_api_response

      # Handle exceptions
      rescue_from StandardError, with: :handle_exception
      rescue_from ActiveRecord::RecordNotFound, with: :handle_not_found
      rescue_from ActiveRecord::RecordInvalid, with: :handle_validation_error

      protected

      def authenticate_user!
        token = request.headers['Authorization']&.gsub(/^Bearer /, '')

        if token.blank?
          render_error('Authorization token required', :unauthorized)
          return
        end

        begin
          # Decode JWT token
          decoded_token = JWT.decode(
            token,
            Rails.application.credentials.secret_key_base,
            true,
            { algorithm: 'HS256' }
          )
          
          # Check if token is in blacklist
          jti = decoded_token[0]['jti']
          if JwtDenylist.exists?(jti: jti)
            Rails.logger.warn "Blocked JWT token attempted to access protected resource: #{jti}"
            render_error('Token has been revoked', :unauthorized)
            return
          end
          
          user_id = decoded_token[0]['user_id']
          @current_user = User.find(user_id)
          
          # Проверяем, не заблокирован ли пользователь
          if @current_user.banned?
            Rails.logger.info "Blocked user #{@current_user.id} (#{@current_user.email}) attempted to access protected resource"
            render_error('Your account has been suspended', :forbidden)
            return
          end
          
        rescue JWT::DecodeError, JWT::ExpiredSignature, ActiveRecord::RecordNotFound => e
          Rails.logger.error "Authentication failed: #{e.message}"
          render_error('Invalid or expired token', :unauthorized)
          return
        end
      end

      attr_reader :current_user

      def render_success(data = {}, message = 'Success', status = :ok)
        render json: {
          success: true,
          message: message,
          data: data
        }, status: status
      end

      def render_error(message = 'Error', status = :unprocessable_entity, errors = [])
        render json: {
          success: false,
          message: message,
          errors: errors
        }, status: status
      end

      def handle_exception(exception)
        Rails.logger.error "API Error: #{exception.class} - #{exception.message}"
        Rails.logger.error exception.backtrace.join("\n")

        render_error(
          'Internal server error',
          :internal_server_error,
          Rails.env.development? ? [exception.message] : []
        )
      end

      def handle_not_found(_exception)
        render_error('Resource not found', :not_found)
      end

      def handle_validation_error(exception)
        render_error(
          'Validation failed',
          :unprocessable_entity,
          exception.record.errors.full_messages
        )
      end

      # API metrics tracking
      def track_api_metrics
        @request_start_time = Time.current
        @request_id = SecureRandom.uuid
        
        # Log API request
        Rails.logger.info "API_REQUEST_START: #{request.method} #{request.path} - Request ID: #{@request_id}"
      end

      def log_api_response
        return unless @request_start_time

        duration = ((Time.current - @request_start_time) * 1000).round(2)
        
        # Log API response with metrics
        Rails.logger.info "API_REQUEST_END: #{request.method} #{request.path} - Status: #{response.status} - Duration: #{duration}ms - Request ID: #{@request_id}"
        
        # Log to ApiLog for monitoring
        log_api_request(duration)
        
        # Send alert for slow requests
        if duration > 5000 # 5 seconds
          AlertService.instance.warning("Slow API request detected", {
            method: request.method,
            path: request.path,
            duration_ms: duration,
            request_id: @request_id
          })
        end
      end

      def log_api_request(duration)
        begin
          # Anonymize sensitive data before logging
          anonymized_user_id = current_user ? DataAnonymizationService.anonymize_user_id(current_user.id) : nil
          anonymized_ip = DataAnonymizationService.anonymize_string(request.remote_ip)
          anonymized_user_agent = DataAnonymizationService.anonymize_string(request.user_agent)
          
          ApiLog.create!(
            method: request.method,
            path: request.path,
            endpoint: "#{request.method} #{request.path}",
            status: response.status,
            duration_ms: duration,
            user_id: anonymized_user_id,
            ip_address: anonymized_ip,
            user_agent: anonymized_user_agent,
            request_id: @request_id
          )
        rescue StandardError => e
          Rails.logger.error "Failed to log API request: #{e.message}"
        end
      end
    end
  end
end
