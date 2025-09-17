module Api
  module V1
    class SessionsController < ActionController::API
      include ActionController::Cookies
      def create
        user = User.find_by(email: params[:email])

        # Проверяем, не заблокирован ли пользователь ДО проверки пароля
        if user&.banned?
          Rails.logger.info "Blocked user #{user.id} (#{user.email}) attempted to sign in via sessions"
          render json: {
            success: false,
            errors: ['Your account has been suspended. Please contact support.']
          }, status: :forbidden
          return
        end

        if user&.valid_password?(params[:password])
          begin
            # Генерируем JWT токены
            access_token = user.generate_jwt
            refresh_token = user.generate_refresh_jwt
            
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
              message: 'Signed in successfully',
              user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                phone: user.phone,
                admin: user.admin,
                banned: user.banned
              },
              tokens: {
                accessToken: access_token,
                expiresIn: 15.minutes.to_i
              }
            }
          rescue => e
            Rails.logger.error "Error generating JWT tokens: #{e.message}"
            Rails.logger.error e.backtrace.join("\n")
            
            render json: {
              success: true,
              message: 'Signed in successfully',
              user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                phone: user.phone,
                admin: user.admin,
                banned: user.banned
              }
            }
          end
        else
          render json: {
            success: false,
            errors: ['Invalid email or password']
          }, status: :unauthorized
        end
      end

      def destroy
        render json: {
          success: true,
          message: 'Signed out successfully'
        }
      end
    end
  end
end
