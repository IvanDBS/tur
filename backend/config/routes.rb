Rails.application.routes.draw do
  # API routes
  namespace :api do
    namespace :v1 do
      # Health check
      get 'health', to: 'health#index'
      
      # Authentication routes
      devise_for :users, controllers: {
        sessions: 'api/v1/sessions',
        registrations: 'api/v1/registrations'
      }, path: 'auth', path_names: {
        sign_in: 'sign_in',
        sign_up: 'sign_up',
        sign_out: 'sign_out'
      }
      
      # Custom auth routes
      get 'auth/me', to: 'auth#me'
      put 'auth/profile', to: 'auth#update_profile'
      put 'auth/change_password', to: 'auth#change_password'
      
      # Search routes
      get 'search/departure_cities', to: 'search#departure_cities'
      get 'search/countries', to: 'search#countries'
      get 'search/countries/:id/package_templates', to: 'search#package_templates'
      get 'search/calendar_hints', to: 'search#calendar_hints'
      get 'search/available_nights', to: 'search#available_nights'
      get 'search/package_templates/:id/hotel_categories', to: 'search#hotel_categories'
      get 'search/package_templates/:id/locations', to: 'search#locations'
      get 'search/package_templates/:id/hotels', to: 'search#hotels'
      get 'search/package_templates/:id/meals', to: 'search#meals'
      post 'search', to: 'search#search'
      post 'search/clear_cache', to: 'search#clear_cache'
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