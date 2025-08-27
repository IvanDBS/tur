# Search controller for OBS tour search
class Api::V1::SearchController < Api::V1::BaseController
  before_action :authenticate_user!, except: [:departure_cities, :countries, :package_templates]
  
  # GET /api/v1/search/departure_cities
  def departure_cities
    begin
      adapter = ObsAdapter.new(user_id: current_user&.id)
      cities = adapter.departure_cities
      render_success({ departure_cities: cities })
    rescue ObsAdapter::Error => e
      render_error("Failed to fetch departure cities: #{e.message}", :bad_gateway)
    end
  end
  
  # GET /api/v1/search/countries
  def countries
    airport_city_from = params[:airport_city_from]
    
    begin
      adapter = ObsAdapter.new(user_id: current_user&.id)
      countries = adapter.arrival_cities(airport_city_from)
      render_success({ countries: countries })
    rescue ObsAdapter::Error => e
      render_error("Failed to fetch countries: #{e.message}", :bad_gateway)
    end
  end
  
  # GET /api/v1/search/countries/:id/package_templates
  def package_templates
    country_id = params[:id]
    airport_city_from = params[:airport_city_from]
    
    if country_id.blank?
      return render_error('Country ID is required', :bad_request)
    end
    
    begin
      templates = ObsApiService.new.package_templates(country_id, airport_city_from)
      render_success({ package_templates: templates })
    rescue ObsApiService::Error => e
      render_error("Failed to fetch package templates: #{e.message}", :bad_gateway)
    end
  end
  
  # POST /api/v1/search
  def search
    search_params = params[:search] || {}
    
    if search_params.blank?
      return render_error('Search parameters are required', :bad_request)
    end
    
    begin
      # Perform search with OBS API
      adapter = ObsAdapter.new(user_id: current_user.id)
      obs_response = adapter.search_packages(search_params)
      
      # Store search query for user
      search_query = current_user.search_queries.create!(
        search_params: search_params.to_json,
        search_results: obs_response,
        expires_at: 1.hour.from_now
      )
      
      render_success({
        search_id: search_query.obs_search_id,
        results: obs_response,
        total_results: obs_response&.dig('total') || 0
      })
      
    rescue ObsAdapter::Error => e
      render_error("Search failed: #{e.message}", :bad_gateway)
    rescue ActiveRecord::RecordInvalid => e
      render_error("Failed to save search: #{e.message}", :unprocessable_entity)
    end
  end
  
  # GET /api/v1/search/:id
  def show
    search_id = params[:id]
    
    search_query = current_user.search_queries.find_by(obs_search_id: search_id)
    
    if search_query.nil?
      return render_error('Search not found', :not_found)
    end
    
    if search_query.expired?
      return render_error('Search has expired', :gone)
    end
    
    render_success({
      search_id: search_query.obs_search_id,
      search_params: search_query.search_params_hash,
      results: search_query.search_results,
      total_results: search_query.results_count,
      created_at: search_query.created_at,
      expires_at: search_query.expires_at
    })
  end
  
  # GET /api/v1/search
  def index
    search_queries = current_user.search_queries.recent.limit(20)
    
    render_success({
      searches: search_queries.map do |query|
        {
          search_id: query.obs_search_id,
          search_params: query.search_params_hash,
          results_count: query.results_count,
          created_at: query.created_at,
          expires_at: query.expires_at,
          expired: query.expired?
        }
      end
    })
  end

  # GET /api/v1/search/calendar_hints
  def calendar_hints
    begin
      hints = ObsApiService.new.calendar_hints(params.permit(:date_from, :date_to, :city_from, :city_to))
      render_success({ calendar_hints: hints })
    rescue ObsApiService::Error => e
      render_error("Failed to fetch calendar hints: #{e.message}", :bad_gateway)
    end
  end

  # GET /api/v1/search/available_nights
  def available_nights
    begin
      nights = ObsApiService.new.available_nights(params.permit(:date_from, :date_to, :city_from, :city_to))
      render_success({ available_nights: nights })
    rescue ObsApiService::Error => e
      render_error("Failed to fetch available nights: #{e.message}", :bad_gateway)
    end
  end

  # GET /api/v1/search/package_templates/:id/hotel_categories
  def hotel_categories
    package_template_id = params[:id]
    
    begin
      categories = ObsApiService.new.hotel_categories(package_template_id)
      render_success({ hotel_categories: categories })
    rescue ObsApiService::Error => e
      render_error("Failed to fetch hotel categories: #{e.message}", :bad_gateway)
    end
  end

  # GET /api/v1/search/package_templates/:id/locations
  def locations
    package_template_id = params[:id]
    
    begin
      locations = ObsApiService.new.locations(package_template_id)
      render_success({ locations: locations })
    rescue ObsApiService::Error => e
      render_error("Failed to fetch locations: #{e.message}", :bad_gateway)
    end
  end

  # GET /api/v1/search/package_templates/:id/hotels
  def hotels
    package_template_id = params[:id]
    
    begin
      hotels = ObsApiService.new.hotels(package_template_id, params.permit(:cities, :regions, :categories, :is_exclusive))
      render_success({ hotels: hotels })
    rescue ObsApiService::Error => e
      render_error("Failed to fetch hotels: #{e.message}", :bad_gateway)
    end
  end

  # GET /api/v1/search/package_templates/:id/meals
  def meals
    package_template_id = params[:id]
    
    begin
      meals = ObsApiService.new.meals(package_template_id)
      render_success({ meals: meals })
    rescue ObsApiService::Error => e
      render_error("Failed to fetch meals: #{e.message}", :bad_gateway)
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
      auth_service = ObsAuthService.new(user_id: @current_user.id)
      auth_service.refresh_token
      @current_user.reload
    end
  end
  
  def current_user
    @current_user
  end
end
