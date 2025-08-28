# Job for synchronizing reference data (cities, hotels, regions) from OBS API
class SyncHotelsJob < ApplicationJob
  queue_as :default
  
  # Retry configuration
  sidekiq_options retry: 3, backtrace: 20
  
  def perform(sync_type = 'all')
    Rails.logger.info "Starting reference data sync: #{sync_type}"
    
    case sync_type
    when 'cities'
      sync_cities
    when 'hotels'
      sync_hotels
    when 'countries'
      sync_countries
    when 'all'
      sync_all
    else
      Rails.logger.error "Unknown sync type: #{sync_type}"
    end
    
    Rails.logger.info "Completed reference data sync: #{sync_type}"
  end
  
  private
  
  def sync_all
    sync_cities
    sync_countries
    sync_hotels
  end
  
  def sync_cities
    Rails.logger.info "Syncing departure cities..."
    
    adapter = ObsAdapter.new
    
    begin
      departure_cities = adapter.departure_cities
      
      departure_cities.each do |city_data|
        sync_city(city_data, 'departure')
      end
      
      Rails.logger.info "Synced #{departure_cities.size} departure cities"
    rescue ObsApiService::ApiError => e
      Rails.logger.error "Failed to sync departure cities: #{e.message}"
      raise
    end
  end
  
  def sync_countries
    Rails.logger.info "Syncing countries and arrival cities..."
    
    adapter = ObsAdapter.new
    departure_city = City.departure.first
    
    return unless departure_city&.obs_id
    
    begin
      countries = adapter.arrival_cities(departure_city.obs_id)
      
      countries.each do |country_data|
        sync_country_and_cities(country_data, departure_city.obs_id)
      end
      
      Rails.logger.info "Synced countries and arrival cities"
    rescue ObsApiService::ApiError => e
      Rails.logger.error "Failed to sync countries: #{e.message}"
      raise
    end
  end
  
  def sync_hotels
    Rails.logger.info "Syncing hotels and packages..."
    
    adapter = ObsAdapter.new
    departure_city = City.departure.first
    
    return unless departure_city&.obs_id
    
    # Get countries first
    countries = adapter.arrival_cities(departure_city.obs_id)
    
    countries.each do |country_data|
      sync_hotels_for_country(country_data, departure_city.obs_id)
    end
    
    Rails.logger.info "Completed hotels sync"
  rescue ObsApiService::ApiError => e
    Rails.logger.error "Failed to sync hotels: #{e.message}"
    raise
  end
  
  def sync_city(city_data, type)
    return unless city_data.is_a?(Hash)
    
    obs_id = city_data['id'] || city_data[:id]
    name = city_data['label'] || city_data[:label] || city_data['name'] || city_data[:name]
    
    return unless obs_id && name
    
    city = City.find_or_initialize_by(obs_id: obs_id)
    city.assign_attributes(
      name: name.upcase,
      type: type
    )
    
    if city.save
      Rails.logger.debug "Synced city: #{name} (#{type})"
    else
      Rails.logger.warn "Failed to sync city #{name}: #{city.errors.full_messages.join(', ')}"
    end
  end
  
  def sync_country_and_cities(country_data, departure_city_id)
    return unless country_data.is_a?(Hash)
    
    country_id = country_data['id'] || country_data[:id]
    return unless country_id
    
    adapter = ObsAdapter.new
    
    # Get package templates for this country
    package_templates = adapter.hotels(country_id, departure_city_id)
    
    package_templates.each do |template|
      sync_package_template(template, country_data)
    end
  end
  
  def sync_hotels_for_country(country_data, departure_city_id)
    country_id = country_data['id'] || country_data[:id]
    return unless country_id
    
    adapter = ObsAdapter.new
    
    begin
      # Get package templates
      package_templates = adapter.hotels(country_id, departure_city_id)
      
      package_templates.each do |template|
        sync_hotels_from_template(template, departure_city_id)
      end
    rescue ObsApiService::ApiError => e
      Rails.logger.warn "Failed to sync hotels for country #{country_id}: #{e.message}"
    end
  end
  
  def sync_package_template(template_data, country_data)
    return unless template_data.is_a?(Hash)
    
    template_id = template_data['id'] || template_data[:id]
    return unless template_id
    
    # This creates a basic package entry
    # In a real implementation, you'd want more detailed package data
    name = template_data['label'] || template_data[:label] || "Package #{template_id}"
    
    # For now, create a placeholder hotel if none exists
    hotel = find_or_create_placeholder_hotel(country_data)
    
    package = Package.find_or_initialize_by(obs_id: template_id)
    package.assign_attributes(
      hotel: hotel,
      name: name,
      description: "Auto-synced package from OBS",
      price: 0, # Will be updated when actual search is performed
      raw_json: template_data
    )
    
    if package.save
      Rails.logger.debug "Synced package: #{name}"
    else
      Rails.logger.warn "Failed to sync package #{name}: #{package.errors.full_messages.join(', ')}"
    end
  end
  
  def sync_hotels_from_template(template_data, departure_city_id)
    template_id = template_data['id'] || template_data[:id]
    return unless template_id
    
    adapter = ObsAdapter.new
    
    begin
      # Get actual hotels for this template
      hotels_data = adapter.search_packages(
        country: template_data['country_id'] || 223, # Default to Turkey
        package_template: template_id,
        airport_city_from: departure_city_id,
        date_from: Date.current + 1.month,
        date_to: Date.current + 2.months,
        nights_from: 7,
        adults: 2,
        selected_hotels: []
      )
      
      process_hotels_from_search(hotels_data)
    rescue ObsApiService::ApiError => e
      Rails.logger.debug "Could not get detailed hotels for template #{template_id}: #{e.message}"
    end
  end
  
  def process_hotels_from_search(search_results)
    return unless search_results.is_a?(Hash)
    
    search_results.each do |_key, result|
      next unless result.is_a?(Hash)
      
      accommodation = result['accommodation'] || result[:accommodation]
      next unless accommodation.is_a?(Hash)
      
      hotel_data = accommodation['hotel'] || accommodation[:hotel]
      next unless hotel_data.is_a?(Hash)
      
      sync_hotel_from_search_result(hotel_data, result)
    end
  end
  
  def sync_hotel_from_search_result(hotel_data, full_result)
    obs_id = hotel_data['id'] || hotel_data[:id]
    name = hotel_data['name'] || hotel_data[:name]
    category = hotel_data['category'] || hotel_data[:category]
    city = hotel_data['city'] || hotel_data[:city]
    
    return unless obs_id && name
    
    # Parse stars from category (e.g., "5* / HV1" -> 5)
    stars = parse_stars_from_category(category)
    
    hotel = Hotel.find_or_initialize_by(obs_id: obs_id)
    hotel.assign_attributes(
      name: name.upcase,
      stars: stars,
      region: city,
      raw_json: hotel_data
    )
    
    if hotel.save
      Rails.logger.debug "Synced hotel: #{name} (#{stars}*) in #{city}"
      
      # Create or update package for this hotel
      create_package_for_hotel(hotel, full_result)
    else
      Rails.logger.warn "Failed to sync hotel #{name}: #{hotel.errors.full_messages.join(', ')}"
    end
  end
  
  def find_or_create_placeholder_hotel(country_data)
    country_name = country_data['label'] || country_data[:label] || 'Unknown'
    
    Hotel.find_or_create_by(name: "Hotels in #{country_name}") do |hotel|
      hotel.stars = 3
      hotel.region = country_name
      hotel.raw_json = { placeholder: true, country: country_data }
    end
  end
  
  def create_package_for_hotel(hotel, search_result)
    # Extract package info from search result
    price_data = search_result['price'] || search_result[:price] || {}
    amount = price_data['amount'] || price_data[:amount] || 0
    
    package_name = "#{hotel.name} Package"
    
    # Create or update package
    package = hotel.packages.find_or_initialize_by(name: package_name)
    package.assign_attributes(
      description: "Auto-synced package for #{hotel.name}",
      price: amount,
      raw_json: search_result
    )
    
    package.save if package.changed?
  end
  
  def parse_stars_from_category(category)
    return nil unless category.is_a?(String)
    
    # Extract number before * (e.g., "5* / HV1" -> 5)
    match = category.match(/(\d+)\*/)
    match ? match[1].to_i : nil
  end
end
