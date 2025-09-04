# Search controller for OBS tour search
module Api
  module V1
    class SearchController < Api::V1::BaseController
      before_action :authenticate_user!, except: %i[
        departure_cities 
        countries 
        package_templates 
        hotel_categories 
        locations 
        hotels 
        meals 
        calendar_hints 
        available_nights
        search
      ]

      # GET /api/v1/search/departure_cities
      def departure_cities
        begin
          Rails.logger.info "Fetching departure cities from OBS API"
          
          # Use site-level authentication for public endpoints
          obs_service = ObsApiService.new(
            base_url: ENV['OBS_API_BASE_URL'] || 'https://test-v2.obs.md',
            access_token: ObsSiteAuthService.instance.access_token
          )
          
          Rails.logger.info "OBS service created, fetching cities..."
          cities = obs_service.departure_cities
          Rails.logger.info "Received cities from OBS API: #{cities.inspect}"
          
          response_data = { departure_cities: cities }
          Rails.logger.info "Rendering response: #{response_data.inspect}"
          
          render_success(response_data)
        rescue ObsApiService::Error => e
          Rails.logger.error "OBS API error in departure_cities: #{e.message}"
          render_error("Failed to fetch departure cities: #{e.message}", :bad_gateway)
        rescue StandardError => e
          Rails.logger.error "Unexpected error in departure_cities: #{e.class} - #{e.message}"
          Rails.logger.error e.backtrace.join("\n")
          render_error("Internal server error: #{e.message}", :internal_server_error)
        end
      end

      # GET /api/v1/search/countries
      def countries
        airport_city_from = params[:airport_city_from]

        Rails.logger.info "Countries request - airport_city_from: #{airport_city_from} (type: #{airport_city_from.class})"

        return render_error('airport_city_from parameter is required', :bad_request) if airport_city_from.blank?

        # Преобразуем в целое число
        begin
          airport_city_from = Integer(airport_city_from)
          Rails.logger.info "Converted airport_city_from to: #{airport_city_from} (type: #{airport_city_from.class})"
        rescue ArgumentError, TypeError => e
          Rails.logger.error "Failed to convert airport_city_from: #{e.message}"
          return render_error('airport_city_from must be a valid integer', :bad_request)
        end

        begin
          # Use site-level authentication for public endpoints
          obs_service = ObsApiService.new(
            base_url: ENV['OBS_API_BASE_URL'] || 'https://test-v2.obs.md',
            access_token: ObsSiteAuthService.instance.access_token
          )
          countries = obs_service.countries(airport_city_from)
          Rails.logger.info "Successfully fetched #{countries.length} countries"
          render_success({ countries: countries })
        rescue ObsApiService::Error => e
          Rails.logger.error "OBS API error: #{e.message}"
          render_error("Failed to fetch countries: #{e.message}", :bad_gateway)
        end
      end

      # GET /api/v1/search/countries/:id/package_templates
      def package_templates
        country_id = params[:id]
        airport_city_from = params[:airport_city_from]

        return render_error('Country ID is required', :bad_request) if country_id.blank?

        # Преобразуем в целые числа
        begin
          country_id = Integer(country_id)
          airport_city_from = Integer(airport_city_from) if airport_city_from.present?
        rescue ArgumentError, TypeError
          return render_error('Country ID and airport_city_from must be valid integers', :bad_request)
        end

        begin
          # Use site-level authentication for public endpoints
          obs_service = ObsApiService.new(
            base_url: ENV['OBS_API_BASE_URL'] || 'https://test-v2.obs.md',
            access_token: ObsSiteAuthService.instance.access_token
          )
          templates = obs_service.package_templates(country_id, airport_city_from)
          render_success({ package_templates: templates })
        rescue ObsApiService::Error => e
          render_error("Failed to fetch package templates: #{e.message}", :bad_gateway)
        end
      end

      # POST /api/v1/search
      def search
        search_params = params[:search] || {}
        
        # Pagination parameters
        page = params[:page]&.to_i || 1
        per_page = params[:per_page]&.to_i || 10
        
        Rails.logger.info "Raw per_page param: #{params[:per_page].inspect}"
        Rails.logger.info "Raw search_params: #{search_params.inspect}"
        Rails.logger.info "Converted per_page: #{per_page.inspect}"
        Rails.logger.info "per_page > 500 check: #{per_page > 500}"
        
        # ИСПРАВЛЕНИЕ: Используем per_page из search_params, а не из params
        if search_params[:per_page]
          per_page = search_params[:per_page].to_i
          Rails.logger.info "Using per_page from search_params: #{per_page}"
        end

        Rails.logger.info "Search request received with params: #{search_params.inspect}"
        Rails.logger.info "Pagination params - page: #{page}, per_page: #{per_page}"
        Rails.logger.info "per_page > 500 check: #{per_page > 500}"

        return render_error('Search parameters are required', :bad_request) if search_params.blank?

        begin
          # Perform search with OBS API
          adapter = ObsAdapter.new(user_id: nil) # No user required for public search
          Rails.logger.info "Calling ObsAdapter.search_packages with: #{search_params.inspect}"
          obs_response = adapter.search_packages(search_params)

          # Generate temporary search ID for anonymous users
          search_id = SecureRandom.uuid

          # Handle empty response from OBS API
          if obs_response.is_a?(Array) && obs_response.empty?
            render_success({
                             search_id: search_id,
                             results: [],
                             total_results: 0,
                             page: page,
                             per_page: per_page,
                             total_pages: 0,
                             message: "No tours found for the specified criteria"
                           })
          elsif obs_response.is_a?(Hash) && obs_response.any?
            # Convert hash to array for pagination
            results_array = obs_response.map { |key, value| { id: key, **value } }
            total_results = results_array.count
            
            # Apply pagination using Pagy only if per_page is reasonable
            if per_page > 500
              # For large per_page, return all results without pagination
              Rails.logger.info "Returning all results without pagination - total_results: #{total_results}"
              Rails.logger.info "results_array length: #{results_array.length}"
              
              # Convert array back to hash for frontend compatibility
              results_hash = results_array.each_with_index.map { |result, index| [index.to_s, result] }.to_h
              Rails.logger.info "results_hash keys count: #{results_hash.keys.count}"
              
              render_success({
                               search_id: search_id,
                               results: results_hash,
                               total_results: total_results,
                               page: 1,
                               per_page: total_results,
                               total_pages: 1,
                               prev_page: nil,
                               next_page: nil,
                               message: "Found #{total_results} tours"
                             })
            else
              # Apply pagination using Pagy
              pagy, paginated_results = pagy_array(results_array, page: page, items: per_page)
              
              # Convert paginated array to hash for frontend compatibility
              paginated_hash = paginated_results.each_with_index.map { |result, index| [index.to_s, result] }.to_h
              
              render_success({
                               search_id: search_id,
                               results: paginated_hash,
                               total_results: total_results,
                               page: pagy.page,
                               per_page: per_page,
                               total_pages: pagy.pages,
                               prev_page: pagy.prev,
                               next_page: pagy.next,
                               message: "Found #{total_results} tours"
                             })
            end
          else
            render_success({
                             search_id: search_id,
                             results: obs_response,
                             total_results: 0,
                             page: page,
                             per_page: per_page,
                             total_pages: 0,
                             message: "No tours found for the specified criteria"
                           })
          end
        rescue ObsAdapter::Error => e
          Rails.logger.error "ObsAdapter error: #{e.message}"
          render_error("Search failed: #{e.message}", :bad_gateway)
        rescue StandardError => e
          Rails.logger.error "Search error: #{e.message}"
          Rails.logger.error "Error backtrace: #{e.backtrace.join("\n")}"
          render_error("Search failed: #{e.message}", :internal_server_error)
        end
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

      # GET /api/v1/search/:id
      def show
        search_id = params[:id]

        search_query = current_user.search_queries.find_by(obs_search_id: search_id)

        return render_error('Search not found', :not_found) if search_query.nil?

        return render_error('Search has expired', :gone) if search_query.expired?

        render_success({
                         search_id: search_query.obs_search_id,
                         search_params: search_query.search_params_hash,
                         results: search_query.search_results,
                         total_results: search_query.results_count,
                         created_at: search_query.created_at,
                         expires_at: search_query.expires_at
                       })
      end

      # GET /api/v1/search/calendar_hints
      def calendar_hints
        begin
          obs_service = ObsApiService.new(
            base_url: ENV['OBS_API_BASE_URL'] || 'https://test-v2.obs.md',
            access_token: ObsSiteAuthService.instance.access_token
          )
          hints = obs_service.calendar_hints(params.permit(:date_from, :date_to, :city_from, :city_to).to_h)
          render_success({ calendar_hints: hints })
        rescue ObsApiService::Error => e
          render_error("Failed to fetch calendar hints: #{e.message}", :bad_gateway)
        end
      end

      # GET /api/v1/search/available_nights
      def available_nights
        begin
          obs_service = ObsApiService.new(
            base_url: ENV['OBS_API_BASE_URL'] || 'https://test-v2.obs.md',
            access_token: ObsSiteAuthService.instance.access_token
          )
          nights = obs_service.available_nights(params.permit(:date_from, :date_to, :city_from, :city_to).to_h)
          render_success({ available_nights: nights })
        rescue ObsApiService::Error => e
          render_error("Failed to fetch available nights: #{e.message}", :bad_gateway)
        end
      end

      # GET /api/v1/search/package_templates/:id/hotel_categories
      def hotel_categories
        package_template_id = params[:id]

        begin
          obs_service = ObsApiService.new(
            base_url: ENV['OBS_API_BASE_URL'] || 'https://test-v2.obs.md',
            access_token: ObsSiteAuthService.instance.access_token
          )
          categories = obs_service.hotel_categories(package_template_id)
          render_success({ hotel_categories: categories })
        rescue ObsApiService::Error => e
          render_error("Failed to fetch hotel categories: #{e.message}", :bad_gateway)
        end
      end

      # GET /api/v1/search/package_templates/:id/locations
      def locations
        package_template_id = params[:id]

        begin
          obs_service = ObsApiService.new(
            base_url: ENV['OBS_API_BASE_URL'] || 'https://test-v2.obs.md',
            access_token: ObsSiteAuthService.instance.access_token
          )
          locations = obs_service.locations(package_template_id)
          render_success({ locations: locations })
        rescue ObsApiService::Error => e
          render_error("Failed to fetch locations: #{e.message}", :bad_gateway)
        end
      end

      # GET /api/v1/search/package_templates/:id/hotels
      def hotels
        package_template_id = params[:id]

        begin
          obs_service = ObsApiService.new(
            base_url: ENV['OBS_API_BASE_URL'] || 'https://test-v2.obs.md',
            access_token: ObsSiteAuthService.instance.access_token
          )
          hotels = obs_service.hotels(package_template_id,
                                            params.permit(:cities, :regions, :categories, :is_exclusive).to_h)
          render_success({ hotels: hotels })
        rescue ObsApiService::Error => e
          render_error("Failed to fetch hotels: #{e.message}", :bad_gateway)
        end
      end

      # GET /api/v1/search/package_templates/:id/meals
      def meals
        package_template_id = params[:id]

        begin
          obs_service = ObsApiService.new(
            base_url: ENV['OBS_API_BASE_URL'] || 'https://test-v2.obs.md',
            access_token: ObsSiteAuthService.instance.access_token
          )
          meals = obs_service.meals(package_template_id)
          render_success({ meals: meals })
        rescue ObsApiService::Error => e
          render_error("Failed to fetch meals: #{e.message}", :bad_gateway)
        end
      end
    end
  end
end
