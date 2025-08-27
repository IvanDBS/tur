Rails.application.routes.draw do
  # API routes
  namespace :api do
    namespace :v1 do
      # Health check
      get 'health', to: 'health#index'
      
      # OBS API integration routes (to be added)
      # resources :cities, only: [:index]
      # resources :countries, only: [:index]
      # resources :tours, only: [:index, :show]
      # resources :bookings, only: [:create, :show, :index]
    end
  end
  
  # Health check for load balancers
  get "up" => "rails/health#show", as: :rails_health_check
  
  # Root redirect to API health
  root to: redirect('/api/v1/health')
end