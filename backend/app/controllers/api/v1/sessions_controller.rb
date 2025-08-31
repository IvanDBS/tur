module Api
  module V1
    class SessionsController < ActionController::API
      def create
        user = User.find_by(email: params[:email])

        if user&.valid_password?(params[:password])
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
