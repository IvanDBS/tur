# Be sure to restart your server when you modify this file.

# Avoid CORS issues when API is called from the frontend app.
# Handle Cross-Origin Resource Sharing (CORS) in order to accept cross-origin AJAX requests.

# Read more: https://github.com/cyu/rack-cors

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  # Development origins
  if Rails.env.development?
    allow do
      origins 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000'

      resource '*',
        headers: :any,
        methods: [:get, :post, :put, :patch, :delete, :options, :head],
        credentials: true
    end
  end

  # Production origins
  if Rails.env.production?
    allow do
      # Add your production domains here
      origins ENV['FRONTEND_URL'] || 'https://yourdomain.com',
              ENV['FRONTEND_WWW_URL'] || 'https://www.yourdomain.com',
              /.*\.yourdomain\.com/  # Allow subdomains

      resource '*',
        headers: :any,
        methods: [:get, :post, :put, :patch, :delete, :options, :head],
        credentials: true,
        max_age: 86400  # Cache preflight for 24 hours
    end
  end

  # Test environment
  if Rails.env.test?
    allow do
      origins '*'
      resource '*',
        headers: :any,
        methods: [:get, :post, :put, :patch, :delete, :options, :head]
    end
  end
end