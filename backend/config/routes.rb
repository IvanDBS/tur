Rails.application.routes.draw do
  # API routes
  namespace :api do
    namespace :v1 do
      # Health check
      get 'health', to: 'health#index'
      
      # Authentication routes
      post 'auth/login', to: 'auth#login'
      post 'auth/refresh_token', to: 'auth#refresh_token'
      post 'auth/logout', to: 'auth#logout'
      
      # Search routes
      get 'search/departure_cities', to: 'search#departure_cities'
      get 'search/countries', to: 'search#countries'
      get 'search/countries/:id/package_templates', to: 'search#package_templates'
      post 'search', to: 'search#search'
      get 'search', to: 'search#index'
      get 'search/:id', to: 'search#show'
      
      # Booking routes
      resources :bookings, only: [:index, :show, :create, :update, :destroy] do
        member do
          post :calculate
          post :confirm
        end
      end
    end
  end
  
  # Health check for load balancers
  get "up" => "rails/health#show", as: :rails_health_check
  
  # Root redirect to API health
  root to: redirect('/api/v1/health')
  
  # Sidekiq web UI (development only)
  if Rails.env.development?
    require 'sidekiq/web'
    mount Sidekiq::Web => '/sidekiq'
  end
end