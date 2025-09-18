# Devise JWT Configuration
# This ensures that Devise JWT uses the same secret key as our custom JWT implementation

Rails.application.config.to_prepare do
  # Configure Devise JWT to use the same secret key as our custom JWT implementation
  Devise::JWT.configure do |config|
    config.secret = Rails.application.credentials.secret_key_base
  end
end
