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
      # Authenticate with OBS API
      obs_response = ObsApiService.new.login(email, password)
      
      # Find or create user
      user = User.find_or_initialize_by(email: email)
      user.assign_attributes(
        obs_access_token: obs_response['access_token'],
        obs_refresh_token: obs_response['refresh_token'],
        obs_token_expires_at: Time.current + obs_response['expires_in'].seconds
      )
      
      if user.save
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
      else
        render_error('Failed to save user', :unprocessable_entity)
      end
      
    rescue ObsApiService::UnauthorizedError
      render_error('Invalid email or password', :unauthorized)
    rescue ObsApiService::Error => e
      render_error("Authentication failed: #{e.message}", :bad_gateway)
    end
  end
  
  # POST /api/v1/auth/refresh_token
  def refresh_token
    begin
      if current_user.refresh_obs_tokens!
        render_success({
          tokens: {
            access_token: current_user.obs_access_token,
            refresh_token: current_user.obs_refresh_token,
            expires_in: (current_user.obs_token_expires_at - Time.current).to_i
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
      if current_user.logout_from_obs!
        render_success({ message: 'Successfully logged out' })
      else
        render_error('Failed to logout', :bad_gateway)
      end
      
    rescue ObsApiService::Error => e
      render_error("Logout failed: #{e.message}", :bad_gateway)
    end
  end
  
  private
  
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
    if @current_user.obs_token_expires_at < 5.minutes.from_now
      @current_user.refresh_obs_tokens!
    end
  end
  
  def current_user
    @current_user
  end
end
