# OBS Authentication Middleware
# Automatically adds Authorization header to OBS API requests
class ObsAuthMiddleware
  def initialize(app)
    @app = app
  end

  def call(env)
    request = ActionDispatch::Request.new(env)
    
    # Only for OBS API requests
    if obs_api_request?(request)
      add_authorization_header(env, request)
    end
    
    @app.call(env)
  end

  private

  def obs_api_request?(request)
    request.path.start_with?('/api/v1/') && 
    !request.path.include?('/auth/login') &&
    !request.path.include?('/health')
  end

  def add_authorization_header(env, request)
    # Get user from session or token
    user = current_user_from_request(request)
    return unless user

    # Get valid access token
    auth_service = ObsAuthService.new(user_id: user.id)
    access_token = auth_service.valid_access_token
    
    if access_token
      env['HTTP_AUTHORIZATION'] = "Bearer #{access_token}"
    end
  end

  def current_user_from_request(request)
    # Try to get user from Authorization header
    auth_header = request.headers['Authorization']
    return nil unless auth_header&.start_with?('Bearer ')

    token = auth_header.gsub(/^Bearer /, '')
    User.find_by(obs_access_token: token)
  end
end
