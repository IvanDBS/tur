# Authentication controller for Devise JWT
module Api
  module V1
    class AuthController < Api::V1::BaseController
      include ActionController::Cookies
      before_action :authenticate_user!, only: %i[me update_profile change_password]

      # POST /api/v1/auth/sign_up
      def sign_up
        @user = User.new(sign_up_params)

        if @user.save
          # Генерируем JWT токены
          access_token = @user.generate_jwt
          refresh_token = @user.generate_refresh_jwt
          
          # Устанавливаем refresh token в HttpOnly cookie
          set_refresh_token_cookie(refresh_token)
          
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
              expiresIn: 15.minutes.to_i
            }
          }, status: :created
        else
          render json: {
            success: false,
            errors: @user.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      # POST /api/v1/auth/sign_in
      def sign_in
        @user = User.find_by(email: sign_in_params[:email])

        # Проверяем, не заблокирован ли пользователь ДО проверки пароля
        if @user&.banned?
          Rails.logger.info "Blocked user #{@user.id} (#{@user.email}) attempted to sign in"
          render json: {
            success: false,
            errors: ['Your account has been suspended. Please contact support.']
          }, status: :forbidden
          return
        end

        if @user&.valid_password?(sign_in_params[:password])
          begin
            # Генерируем JWT токены
            access_token = @user.generate_jwt
            refresh_token = @user.generate_refresh_jwt
            
            # Устанавливаем refresh token в HttpOnly cookie
            set_refresh_token_cookie(refresh_token)
            
            Rails.logger.info "Generated tokens for user #{@user.id}: access_token=#{access_token[0..20]}..."
            
            render json: {
              success: true,
              message: 'Signed in successfully',
              user: {
                id: @user.id,
                email: @user.email,
                firstName: @user.first_name,
                lastName: @user.last_name,
                phone: @user.phone,
                admin: @user.admin,
                banned: @user.banned
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
              success: false,
              errors: ['Authentication failed. Please try again.']
            }, status: :internal_server_error
          end
        else
          render json: {
            success: false,
            errors: ['Invalid email or password']
          }, status: :unauthorized
        end
      end

      # POST /api/v1/auth/refresh
      def refresh
        refresh_token = cookies[:refresh_token]
        
        if refresh_token.blank?
          return render json: { 
            success: false,
            error: 'No refresh token' 
          }, status: :unauthorized
        end
        
        begin
          payload = JWT.decode(refresh_token, Rails.application.credentials.secret_key_base)
          user = User.find(payload[0]['user_id'])
          
          # Проверяем, не заблокирован ли пользователь
          if user.banned?
            clear_refresh_token_cookie
            return render json: { 
              success: false,
              error: 'Account suspended' 
            }, status: :forbidden
          end
          
          # Генерируем новые токены
          new_access_token = user.generate_jwt
          new_refresh_token = user.generate_refresh_jwt
          
          # Обновляем refresh token в cookie
          set_refresh_token_cookie(new_refresh_token)
          
          render json: {
            success: true,
            tokens: {
              accessToken: new_access_token,
              expiresIn: 15.minutes.to_i
            }
          }
        rescue JWT::DecodeError, JWT::ExpiredSignature
          clear_refresh_token_cookie
          render json: { 
            success: false,
            error: 'Invalid refresh token' 
          }, status: :unauthorized
        rescue ActiveRecord::RecordNotFound
          clear_refresh_token_cookie
          render json: { 
            success: false,
            error: 'User not found' 
          }, status: :unauthorized
        end
      end

      # DELETE /api/v1/auth/sign_out
      def sign_out
        # Add current token to blacklist if user is authenticated
        if current_user
          token = request.headers['Authorization']&.gsub(/^Bearer /, '')
          if token.present?
            begin
              jti = extract_jti_from_token(token)
              if jti.present?
                JwtDenylist.create!(jti: jti, exp: Time.current)
                Rails.logger.info "JWT token added to blacklist: #{jti}"
              end
            rescue => e
              Rails.logger.error "Failed to blacklist JWT token: #{e.message}"
            end
          end
        end
        
        # Очищаем refresh token cookie
        clear_refresh_token_cookie
        
        Rails.logger.info "User logged out successfully"
        
        render json: {
          success: true,
          message: 'Signed out successfully'
        }
      end

      # GET /api/v1/auth/me
      def me
        render json: {
          success: true,
          user: {
            id: current_user.id,
            email: current_user.email,
            firstName: current_user.first_name,
            lastName: current_user.last_name,
            phone: current_user.phone,
            admin: current_user.admin,
            banned: current_user.banned,
            createdAt: current_user.created_at,
            updatedAt: current_user.updated_at
          }
        }
      end

      # PUT /api/v1/auth/profile
      def update_profile
        if current_user.update(profile_params)
          render json: {
            success: true,
            user: {
              id: current_user.id,
              email: current_user.email,
              firstName: current_user.first_name,
              lastName: current_user.last_name,
              phone: current_user.phone,
              createdAt: current_user.created_at,
              updatedAt: current_user.updated_at
            }
          }
        else
          render json: {
            success: false,
            errors: current_user.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      # PUT /api/v1/auth/change_password
      def change_password
        if current_user.valid_password?(password_params[:current_password])
          if current_user.update(password: password_params[:new_password])
            render json: { success: true, message: 'Password updated successfully' }
          else
            render json: {
              success: false,
              errors: current_user.errors.full_messages
            }, status: :unprocessable_entity
          end
        else
          render json: {
            success: false,
            errors: ['Current password is incorrect']
          }, status: :unauthorized
        end
      end

      private

      def set_refresh_token_cookie(token)
        cookies[:refresh_token] = {
          value: token,
          httponly: true,
          secure: Rails.env.production?,
          same_site: :strict,
          expires: 7.days.from_now
        }
      end

      def clear_refresh_token_cookie
        cookies.delete(:refresh_token, {
          domain: Rails.env.production? ? '.yourdomain.com' : nil,
          path: '/',
          httponly: true,
          secure: Rails.env.production?,
          same_site: :strict
        })
      end

      def sign_up_params
        params.permit(:email, :password, :password_confirmation, :first_name, :last_name, :phone)
      end

      def sign_in_params
        params.permit(:email, :password)
      end

      def profile_params
        params.permit(:first_name, :last_name, :phone)
      end

      def password_params
        params.permit(:current_password, :new_password)
      end

      def extract_jti_from_token(token)
        begin
          decoded = JWT.decode(token, Rails.application.credentials.secret_key_base, true, { algorithm: 'HS256' })
          decoded[0]['jti']
        rescue JWT::DecodeError
          nil
        end
      end

      def extract_exp_from_token(token)
        begin
          decoded = JWT.decode(token, Rails.application.credentials.secret_key_base, true, { algorithm: 'HS256' })
          decoded[0]['exp']
        rescue JWT::DecodeError
          nil
        end
      end
    end
  end
end
