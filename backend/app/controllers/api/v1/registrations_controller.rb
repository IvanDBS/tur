module Api
  module V1
    class RegistrationsController < ActionController::API
      def create
        @user = User.new(sign_up_params)

        if @user.save
          begin
            # Отправляем письмо подтверждения
            UserMailer.confirmation_email(@user).deliver_now
            
            # Генерируем JWT токены
            access_token = @user.generate_jwt
            refresh_token = @user.generate_refresh_jwt
            
            # Устанавливаем refresh token в HttpOnly cookie
            cookies[:refresh_token] = {
              value: refresh_token,
              httponly: true,
              secure: Rails.env.production?,
              same_site: :strict,
              expires: 7.days.from_now
            }
            
            render json: {
              success: true,
              message: 'User registered successfully. Please check your email for confirmation.',
              user: {
                id: @user.id,
                email: @user.email,
                firstName: @user.first_name,
                lastName: @user.last_name,
                phone: @user.phone
              },
              tokens: {
                accessToken: access_token,
                expiresIn: 12.hours.to_i
              }
            }, status: :created
          rescue => e
            Rails.logger.error "Error generating JWT tokens: #{e.message}"
            Rails.logger.error e.backtrace.join("\n")
            
            render json: {
              success: true,
              message: 'User registered successfully. Please check your email for confirmation.',
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
