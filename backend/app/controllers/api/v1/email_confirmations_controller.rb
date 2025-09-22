# frozen_string_literal: true

module Api
  module V1
    class EmailConfirmationsController < ActionController::API
      def confirm
        token = params[:token]
        
        if token.blank?
          render json: {
            success: false,
            message: 'Confirmation token is required'
          }, status: :bad_request
          return
        end

        begin
          # Decode and verify the JWT token
          payload = JWT.decode(token, Rails.application.credentials.secret_key_base, true, { algorithm: 'HS256' }).first
          
          # Check if token is for email confirmation
          unless payload['type'] == 'email_confirmation'
            render json: {
              success: false,
              message: 'Invalid confirmation token'
            }, status: :bad_request
            return
          end
          
          # Check if token is expired
          if payload['exp'] < Time.current.to_i
            render json: {
              success: false,
              message: 'Confirmation token has expired. Please request a new one.'
            }, status: :bad_request
            return
          end
          
          # Find user by ID and email
          user = User.find_by(id: payload['user_id'], email: payload['email'])
          
          if user.nil?
            render json: {
              success: false,
              message: 'User not found'
            }, status: :not_found
            return
          end
          
          # Mark email as confirmed (you might want to add a confirmed_at field to users table)
          # For now, we'll just log the confirmation
          Rails.logger.info "Email confirmed for user #{user.id} (#{user.email})"
          
          render json: {
            success: true,
            message: 'Email confirmed successfully',
            user: {
              id: user.id,
              email: user.email,
              firstName: user.first_name,
              lastName: user.last_name
            }
          }, status: :ok
          
        rescue JWT::DecodeError => e
          Rails.logger.error "JWT decode error: #{e.message}"
          render json: {
            success: false,
            message: 'Invalid confirmation token'
          }, status: :bad_request
        rescue JWT::ExpiredSignature => e
          Rails.logger.error "JWT expired: #{e.message}"
          render json: {
            success: false,
            message: 'Confirmation token has expired. Please request a new one.'
          }, status: :bad_request
        rescue => e
          Rails.logger.error "Email confirmation error: #{e.message}"
          Rails.logger.error e.backtrace.join("\n")
          
          render json: {
            success: false,
            message: 'An error occurred while confirming your email'
          }, status: :internal_server_error
        end
      end
      
      def resend
        email = params[:email]
        
        if email.blank?
          render json: {
            success: false,
            message: 'Email is required'
          }, status: :bad_request
          return
        end
        
        user = User.find_by(email: email)
        
        if user.nil?
          # Don't reveal if user exists or not for security
          render json: {
            success: true,
            message: 'If the email exists, a confirmation email has been sent'
          }, status: :ok
          return
        end
        
        begin
          # Send confirmation email
          UserMailer.confirmation_email(user).deliver_now
          
          render json: {
            success: true,
            message: 'Confirmation email sent successfully'
          }, status: :ok
          
        rescue => e
          Rails.logger.error "Error sending confirmation email: #{e.message}"
          Rails.logger.error e.backtrace.join("\n")
          
          render json: {
            success: false,
            message: 'Failed to send confirmation email'
          }, status: :internal_server_error
        end
      end
    end
  end
end
