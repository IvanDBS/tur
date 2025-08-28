# Job for refreshing package availability from OBS API
class RefreshAvailabilityJob < ApplicationJob
  queue_as :default
  
  # Retry configuration
  sidekiq_options retry: 3, backtrace: 20
  
  def perform(package_id = nil, date_range = nil)
    Rails.logger.info "Starting availability refresh for package: #{package_id || 'all'}"
    
    packages = package_id ? [Package.find(package_id)] : Package.includes(:hotel).all
    date_range ||= Date.current..(Date.current + 3.months)
    
    packages.each do |package|
      refresh_package_availability(package, date_range)
    rescue StandardError => e
      Rails.logger.error "Failed to refresh availability for package #{package.id}: #{e.message}"
      # Continue with other packages
    end
    
    Rails.logger.info "Completed availability refresh"
  end
  
  private
  
  def refresh_package_availability(package, date_range)
    return unless package.obs_id
    
    adapter = ObsAdapter.new
    
    # Get calendar hints for the package
    calendar_data = adapter.calendar_hints(
      date_from: date_range.begin,
      date_to: date_range.end,
      city_from: get_departure_city_id,
      city_to: get_arrival_city_ids(package)
    )
    
    # Update availabilities based on calendar data
    update_availabilities_from_calendar(package, calendar_data, date_range)
    
    Rails.logger.info "Refreshed availability for package #{package.id} (#{package.name})"
  rescue ObsApiService::ApiError => e
    Rails.logger.error "OBS API error for package #{package.id}: #{e.message}"
    raise
  end
  
  def get_departure_city_id
    # Get default departure city (e.g., Chisinau)
    city = City.departure.first
    city&.obs_id || 33785 # Fallback to Chisinau ID
  end
  
  def get_arrival_city_ids(package)
    # Get arrival cities based on package/hotel location
    # This could be enhanced with more sophisticated logic
    "50004" # Antalya as default
  end
  
  def update_availabilities_from_calendar(package, calendar_data, date_range)
    return unless calendar_data.is_a?(Hash)
    
    # Clear existing availabilities in the date range
    package.availabilities.where(date: date_range).delete_all
    
    # Process each date from calendar hints
    calendar_data.each do |date_string, hints|
      date = Date.parse(date_string) rescue nil
      next unless date && date_range.cover?(date)
      
      hints.each do |hint|
        availability_status = determine_availability_status(hint)
        capacity = hint['remain'] || 0
        
        package.availabilities.create!(
          date: date,
          status: availability_status,
          capacity: capacity,
          raw_json: hint
        )
      end
    end
    
    # Fill gaps with 'unavailable' status
    fill_availability_gaps(package, date_range)
  end
  
  def determine_availability_status(hint)
    remain = hint['remain'] || 0
    
    case remain
    when 0
      'unavailable'
    when 1..5
      'limited'
    else
      'available'
    end
  end
  
  def fill_availability_gaps(package, date_range)
    existing_dates = package.availabilities.where(date: date_range).pluck(:date)
    missing_dates = date_range.to_a - existing_dates
    
    missing_dates.each do |date|
      package.availabilities.create!(
        date: date,
        status: 'unavailable',
        capacity: 0,
        raw_json: { auto_generated: true }
      )
    end
  end
end
