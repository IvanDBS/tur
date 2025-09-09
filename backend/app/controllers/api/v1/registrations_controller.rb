module Api
  module V1
    class RegistrationsController < ActionController::API
      def create
        @user = User.new(sign_up_params)

        if @user.save
          begin
            # Генерируем JWT токены
            access_token = @user.generate_jwt
            refresh_token = @user.generate_refresh_jwt
            
            render json: {
              success: true,
              message: 'User registered successfully',
              user: {
                id: @user.id,
                email: @user.email,
                firstName: @user.first_name,
                lastName: @user.last_name,
                phone: @user.phone
              },
              tokens: {
                accessToken: access_token,
                refreshToken: refresh_token,
                expiresIn: 24.hours.to_i
              }
            }, status: :created
          rescue => e
            Rails.logger.error "Error generating JWT tokens: #{e.message}"
            Rails.logger.error e.backtrace.join("\n")
            
            render json: {
              success: true,
              message: 'User registered successfully',
              user: {
                id: @user.id,
                email: @user.email,
                firstName: @user.first_name,
                lastName: @user.last_name,
                phone: @user.phone
              }
            }, status: :created
          end
        else
          render json: {
            success: false,
            errors: @user.errors.full_messages,
            debug: {
              params: sign_up_params,
              user_errors: @user.errors.to_hash
            }
          }, status: :unprocessable_entity
        end
      end

      private

      def sign_up_params
        params.permit(:email, :password, :password_confirmation, :first_name, :last_name, :phone)
      end
    end
  end
end
