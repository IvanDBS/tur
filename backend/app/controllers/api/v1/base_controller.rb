module Api
  module V1
    class BaseController < ApplicationController
      # Base controller for all API endpoints
      # Add common functionality here

      # Skip CSRF protection for API
      skip_before_action :verify_authenticity_token

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

        @current_user = User.find_by(obs_access_token: token)

        if @current_user.nil? || !@current_user.obs_tokens_valid?
          render_error('Invalid or expired token', :unauthorized)
          return
        end

        # Refresh token if it's about to expire (within 5 minutes)
        unless @current_user.obs_token_expires_at.present? && @current_user.obs_token_expires_at < 5.minutes.from_now
          return
        end

        auth_service = ObsAuthService.new(user_id: @current_user.id)
        auth_service.refresh_token
        @current_user.reload
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
