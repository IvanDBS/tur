# Authentication controller for OBS API integration
class Api::V1::AuthController < Api::V1::BaseController
  before_action :authenticate_user!, only: [:logout, :refresh_token]
  
  # POST /api/v1/auth/login
  def login
    email = params[:email]
    password = params[:password]
    
    if email.blank? || password.blank?
      return render_error('Email and password are required', :bad_request)
    end
    
    begin
      # Find or create user
      user = User.find_or_initialize_by(email: email)
      user.save! if user.new_record?
      
      # Authenticate with OBS API
      auth_service = ObsAuthService.new(user_id: user.id, email: email, password: password)
      obs_response = auth_service.login
      
      render_success({
        user: {
          id: user.id,
          email: user.email,
          obs_user_id: user.obs_user_id
        },
        tokens: {
          access_token: obs_response['access_token'],
          refresh_token: obs_response['refresh_token'],
          expires_in: obs_response['expires_in']
        }
      })
      
    rescue ObsApiService::UnauthorizedError
      render_error('Invalid email or password', :unauthorized)
    rescue ObsApiService::Error => e
      render_error("Authentication failed: #{e.message}", :bad_gateway)
    end
  end
  
  # POST /api/v1/auth/refresh_token
  def refresh_token
    begin
      auth_service = ObsAuthService.new(user_id: current_user.id)
      obs_response = auth_service.refresh_token
      
      if obs_response
        render_success({
          tokens: {
            access_token: obs_response['access_token'],
            refresh_token: obs_response['refresh_token'],
            expires_in: obs_response['expires_in']
          }
        })
      else
        render_error('Failed to refresh tokens', :unauthorized)
      end
      
    rescue ObsApiService::Error => e
      render_error("Token refresh failed: #{e.message}", :bad_gateway)
    end
  end
  
  # POST /api/v1/auth/logout
  def logout
    begin
      auth_service = ObsAuthService.new(user_id: current_user.id)
      
      if auth_service.logout
        render_success({ message: 'Successfully logged out' })
      else
        render_error('Failed to logout', :bad_gateway)
      end
      
    rescue ObsApiService::Error => e
      render_error("Logout failed: #{e.message}", :bad_gateway)
    end
  end
  
  private
end
