require 'jwt'

module Api
  module V1
    class BaseController < ApplicationController
      # Base controller for all API endpoints
      # Add common functionality here

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
    end
  end
end
