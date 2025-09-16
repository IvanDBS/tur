# Job for importing orders from OBS server
class SyncObsOrdersJob < ApplicationJob
  queue_as :default

  # Retry configuration
  sidekiq_options retry: 2, backtrace: 20

  def perform
    Rails.logger.info "Starting OBS orders synchronization"

    begin
      # Get site-level OBS adapter
      obs_adapter = ObsAdapter.new
      
      # Get orders from OBS API
      Rails.logger.info "Fetching orders from OBS API..."
      orders_response = obs_adapter.get_orders_list
      
      if orders_response.blank?
        Rails.logger.info "No orders received from OBS API"
        return
      end

      # Parse JSON response if it's a string
      if orders_response.is_a?(String)
        orders_response = JSON.parse(orders_response)
      end
      
      orders = orders_response['data'] || []
      Rails.logger.info "Received #{orders.count} orders from OBS"

      imported_count = 0
      updated_count = 0

      orders.each do |order_data|
        begin
          result = sync_order_from_obs(order_data)
          if result == :imported
            imported_count += 1
          elsif result == :updated
            updated_count += 1
          end
        rescue StandardError => e
          Rails.logger.error "Failed to sync order #{order_data['order_number']}: #{e.message}"
          # Continue with other orders
        end
      end

      Rails.logger.info "OBS orders sync completed: #{imported_count} imported, #{updated_count} updated"

    rescue ObsAdapter::Error => e
      Rails.logger.error "OBS API error during orders sync: #{e.message}"
    rescue StandardError => e
      Rails.logger.error "Unexpected error during orders sync: #{e.message}"
    end
  end

  private

  def sync_order_from_obs(order_data)
    order_number = order_data['order_number']
    obs_order_id = order_data['id']
    
    Rails.logger.debug "Processing order: #{order_number} (ID: #{obs_order_id})"

    # Check if order already exists
    existing_booking = Booking.find_by(obs_order_id: order_number)
    
    if existing_booking
      # Update existing booking
      update_booking_from_obs_order(existing_booking, order_data)
      return :updated
    else
      # Import new order
      import_new_order_from_obs(order_data)
      return :imported
    end
  end

  def update_booking_from_obs_order(booking, order_data)
    Rails.logger.debug "Updating existing booking #{booking.id} with OBS data"
    
    # Extract status safely
    order_status = order_data['order_status']
    status_name = if order_status.is_a?(Hash)
                    order_status['name'] || order_status.dig('label', 'name')
                  else
                    order_status
                  end
    
    # Update booking with OBS data
    booking.update!(
      operator_status: status_name,
      last_synced_at: Time.current
    )
    
    Rails.logger.debug "Updated booking #{booking.id} status to: #{booking.operator_status}"
  end

  def import_new_order_from_obs(order_data)
    order_number = order_data['order_number']
    Rails.logger.info "Importing new order: #{order_number}"
    
    # Create a system user for imported orders if it doesn't exist
    system_user = User.find_or_create_by(email: 'system@migo.md') do |user|
      user.first_name = 'System'
      user.last_name = 'Import'
      user.password = SecureRandom.hex(16)
      user.admin = true
    end

    # Extract basic order information
    booking_data = {
      user: system_user,
      obs_order_id: order_number,
      obs_booking_hash: order_number, # Use order_number as booking hash for imported orders
      status: map_obs_status_to_booking_status(order_data.dig('order_status', 'name')),
      total_amount: order_data.dig('price', 'value') || 0,
      tour_details: build_tour_details_from_obs(order_data),
      customer_data: build_customer_data_from_obs(order_data),
      operator_type: 'obs',
      operator_status: order_data.dig('order_status', 'name'),
      last_synced_at: Time.current
    }

    # Create booking
    booking = Booking.create!(booking_data)
    Rails.logger.info "Imported new booking: #{booking.id} for order #{order_number}"
    
    booking
  end

  def map_obs_status_to_booking_status(obs_status)
    return 'pending' if obs_status.nil?
    
    case obs_status.to_s.downcase
    when 'в ожидании', 'wait', 'pending', 'în așteptare'
      'pending'
    when 'подтверждено', 'confirmed'
      'confirmed'
    when 'отменено', 'cancelled', 'canceled', 'se anulează'
      'cancelled'
    when 'отменяется', 'canceling'
      'cancelled'
    when 'изменено', 'changed'
      'confirmed'
    when 'не подтверждено', 'not_confirmed'
      'failed'
    when 'штраф', 'penalty'
      'failed'
    else
      'pending'
    end
  end

  def build_tour_details_from_obs(order_data)
    hotels = order_data['hotels'] || []
    first_hotel = hotels.is_a?(Array) ? hotels.first : hotels
    
    # Extract hotel data safely
    hotel_name = if first_hotel.is_a?(Hash)
                   first_hotel['name']
                 elsif hotels.is_a?(Array) && hotels.first.is_a?(String)
                   hotels.first
                 else
                   'Unknown Hotel'
                 end
    
    hotel_category = first_hotel.is_a?(Hash) ? first_hotel['category'] : nil
    hotel_city = first_hotel.is_a?(Hash) ? first_hotel['city'] : nil
    
    {
      hotel_name: hotel_name,
      hotel_category: hotel_category,
      city: hotel_city,
      check_in: order_data['check_in'],
      check_out: order_data['check_out'],
      country: order_data['country'],
      tourists: order_data['tourists'] || [],
      departure: order_data['departure'],
      arrival: order_data['arrival'],
      price: order_data['price']
    }
  end

  def build_customer_data_from_obs(order_data)
    {
      tourists: order_data['tourists'] || [],
      notes: '',
      imported_from_obs: true,
      import_date: Time.current.iso8601
    }
  end
end
