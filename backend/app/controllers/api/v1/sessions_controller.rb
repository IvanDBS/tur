module Api
  module V1
    class SessionsController < ActionController::API
      def create
        user = User.find_by(email: params[:email])

        if user&.valid_password?(params[:password])
          begin
            # Генерируем JWT токены
            access_token = user.generate_jwt
            refresh_token = user.generate_refresh_jwt
            
            render json: {
              success: true,
              message: 'Signed in successfully',
              user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                phone: user.phone
              },
              tokens: {
                accessToken: access_token,
                refreshToken: refresh_token,
                expiresIn: 24.hours.to_i
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
                phone: user.phone
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
