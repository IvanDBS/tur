# Job for periodic synchronization of all active booking statuses
class SyncBookingStatusesJob < ApplicationJob
  queue_as :default

  # Retry configuration
  sidekiq_options retry: 2, backtrace: 20

  def perform
    Rails.logger.info "Starting periodic booking status synchronization"

    # Get all active bookings that need status sync
    active_bookings = Booking.where(status: ['pending', 'processing', 'confirmed', 'changed'])
                             .where('last_synced_at IS NULL OR last_synced_at < ?', 2.hours.ago)
                             .limit(50) # Process in batches to avoid overwhelming the API

    Rails.logger.info "Found #{active_bookings.count} bookings to sync"

    if active_bookings.empty?
      Rails.logger.info "No bookings need synchronization"
      return
    end

    # Process bookings in smaller batches to avoid API rate limits
    active_bookings.find_in_batches(batch_size: 10) do |batch|
      Rails.logger.info "Processing batch of #{batch.size} bookings"
      
      batch.each do |booking|
        sync_booking_status(booking)
      rescue StandardError => e
        Rails.logger.error "Failed to sync booking #{booking.id}: #{e.message}"
        # Continue with other bookings
      end
      
      # Small delay between batches to be respectful to OBS API
      sleep(2) if batch.size == 10
    end

    Rails.logger.info "Completed periodic booking status synchronization"
  end

  private

  def sync_booking_status(booking)
    Rails.logger.debug "Syncing status for booking #{booking.id} (OBS hash: #{booking.obs_booking_hash})"

    begin
      # If booking doesn't have order_number, try to create it on OBS first
      if booking.obs_order_id.blank?
        Rails.logger.info "Booking #{booking.id} missing order_number, attempting to create on OBS"
        create_booking_on_obs(booking)
        return
      end

      # Use ObsAdapter for better error handling
      obs_adapter = ObsAdapter.new
      booking_data = obs_adapter.booking_status(booking.obs_booking_hash)

      # Update booking using the same logic as MonitorBookingJob
      update_booking_from_obs_data(booking, booking_data)
      
    rescue ObsAdapter::Error => e
      Rails.logger.error "OBS API error for booking #{booking.id}: #{e.message}"
      # Don't raise - continue with other bookings
    rescue StandardError => e
      Rails.logger.error "Unexpected error syncing booking #{booking.id}: #{e.message}"
      # Don't raise - continue with other bookings
    end
  end

  def create_booking_on_obs(booking)
    Rails.logger.info "Creating booking #{booking.id} on OBS server"
    
    begin
      # Use ObsAdapter for better error handling
      obs_adapter = ObsAdapter.new
      
      # Prepare booking data in OBS API format
      obs_booking_data = prepare_booking_data_for_obs(booking)
      
      # Create booking on OBS server
      obs_response = obs_adapter.create_booking(booking.obs_booking_hash, obs_booking_data)
      
      # Update booking with OBS response data
      if obs_response.present?
        updates = {
          obs_order_id: obs_response.dig('order_number') || obs_response.dig('order_id') || obs_response.dig('id'),
          operator_status: obs_response.dig('status') || 'confirmed',
          last_synced_at: Time.current
        }
        
        booking.update!(updates)
        Rails.logger.info "Successfully created booking #{booking.id} on OBS: order_id=#{booking.obs_order_id}"
      end
      
    rescue ObsAdapter::Error => e
      Rails.logger.error "Failed to create booking #{booking.id} on OBS: #{e.message}"
      # Don't raise - continue with other bookings
    rescue StandardError => e
      Rails.logger.error "Unexpected error creating booking #{booking.id} on OBS: #{e.message}"
      # Don't raise - continue with other bookings
    end
  end

  def prepare_booking_data_for_obs(booking)
    # Prepare booking data according to OBS API documentation
    {
      selectedServices: ['hotel', 'avia_transport'],
      aquapark_services: [],
      never_land_entrance: [],
      gala_dinner: [],
      tourists: prepare_tourists_data(booking),
      transfers: prepare_transfers_data(booking),
      insurance: prepare_insurance_data(booking),
      comment: extract_comment_from_notes(booking),
      notes: prepare_notes_data(booking),
      total_sum: booking.total_amount
    }
  end

  def prepare_tourists_data(booking)
    # Extract tourists from customer_data or use default structure
    customer_data = booking.customer_data_hash
    tourists = customer_data['tourists'] || []

    tourists.map do |tourist|
      {
        category: tourist['title'] || tourist['category'] || 'MR',
        first_name: transliterate_to_english(tourist['firstName'] || tourist['first_name'] || 'John'),
        last_name: transliterate_to_english(tourist['lastName'] || tourist['last_name'] || 'Doe'),
        birth_date: tourist['birthDate'] || tourist['birth_date'],
        passport_expiry_date: tourist['passportExpiry'] || tourist['passportExpiryDate'] || tourist['passport_expiry_date'],
        passport_number: tourist['passportNumber'] || tourist['passport_number'],
        fiscal_code: tourist['fiscalCode'] || tourist['fiscal_code'],
        citizenship: tourist['nationality'] || tourist['citizenship'] || 'MOLDOVA'
      }
    end
  end

  def prepare_transfers_data(booking)
    # Get transfers from tour_details first (most accurate)
    tour_details = booking.tour_details_hash
    services = tour_details['services'] || {}
    values = tour_details['values'] || {}
    
    # Try to get transfers from values (this is the correct format from OBS)
    if values['transfers'].present?
      return values['transfers']
    end
    
    # Fallback to services transfers
    transfers = services['transfers'] || []
    if transfers.any?
      # Extract ID from first transfer
      first_transfer = transfers.first
      if first_transfer.is_a?(Hash) && first_transfer['id'].present?
        return first_transfer['id']
      end
    end
    
    # Final fallback - get from customer_data
    customer_data = booking.customer_data_hash
    additional_services = customer_data['additional_services'] || {}
    transfer = additional_services['transfer'] || {}
    
    # Default to group transfer if not specified
    transfer_type = transfer['type'] || 'GROUP'
    
    case transfer_type.upcase
    when 'INDIVIDUAL'
      '269:270' # Individual transfer ID as string
    else
      '1165:1166' # Default to group transfer as string
    end
  end

  def prepare_insurance_data(booking)
    # Extract insurance data from customer_data
    customer_data = booking.customer_data_hash
    additional_services = customer_data['additional_services'] || {}
    insurance = additional_services['insurance'] || {}
    
    # Default to standard insurance if not specified
    insurance_type = insurance['type'] || 'STANDARD'
    
    case insurance_type.upcase
    when 'EXTENDED'
      2 # Extended insurance ID as integer
    else
      1 # Default to standard insurance as integer
    end
  end

  def prepare_notes_data(booking)
    # Get notes from tour_details first (most accurate)
    tour_details = booking.tour_details_hash
    tour_notes = tour_details['notes'] || []
    
    # If we have notes from tour_details, use them
    if tour_notes.any?
      return tour_notes
    end
    
    # Convert booking notes from customer_data to OBS format
    notes = []
    customer_data = booking.customer_data_hash
    notes_data = customer_data['notes'] || {}
    
    # Handle both object format (new) and direct fields (legacy)
    if notes_data.is_a?(Hash)
      # New format: notes is an object with checkboxes
      if notes_data['honeymooners']
        notes << 'Honeymooners'
      end
      if notes_data['regularGuest']
        notes << "Hotel's regular guest(s)"
      end
      if notes_data['twinBeds']
        notes << 'Twin beds (according possibility)'
      end
      if notes_data['groundFloor']
        notes << 'Ground floor'
      end
      if notes_data['notGroundFloor']
        notes << 'NOT ground floor'
      end
      if notes_data['babyCot']
        notes << 'Baby cot'
      end
      if notes_data['handicapAccessible']
        notes << 'Handicap accessible room (according possibility)'
      end
      if notes_data['doubleBed']
        notes << 'Double bed/King size (according possibility)'
      end
    else
      # Legacy format: checkboxes are direct fields in customer_data
      if customer_data['honeymooners']
        notes << 'Honeymooners'
      end
      if customer_data['regularGuest']
        notes << "Hotel's regular guest(s)"
      end
      if customer_data['twinBeds']
        notes << 'Twin beds (according possibility)'
      end
      if customer_data['groundFloor']
        notes << 'Ground floor'
      end
      if customer_data['notGroundFloor']
        notes << 'NOT ground floor'
      end
      if customer_data['babyCot']
        notes << 'Baby cot'
      end
      if customer_data['handicapAccessible']
        notes << 'Handicap accessible room (according possibility)'
      end
      if customer_data['doubleBed']
        notes << 'Double bed/King size (according possibility)'
      end
    end
    
    notes
  end

  def extract_comment_from_notes(booking)
    # Get comment from customer_data.notes.comment first
    customer_data = booking.customer_data_hash
    notes = customer_data['notes'] || {}
    
    # If notes is an object with comment field
    if notes.is_a?(Hash) && notes['comment'].present?
      return notes['comment']
    end
    
    # If notes is a string (legacy format)
    if notes.is_a?(String) && notes.present?
      return notes
    end
    
    # Fallback to booking.notes
    booking.notes || ''
  end

  def transliterate_to_english(text)
    return text if text.blank?
    
    # Simple transliteration for common Cyrillic characters
    transliteration_map = {
      'а' => 'a', 'б' => 'b', 'в' => 'v', 'г' => 'g', 'д' => 'd', 'е' => 'e', 'ё' => 'e',
      'ж' => 'zh', 'з' => 'z', 'и' => 'i', 'й' => 'y', 'к' => 'k', 'л' => 'l', 'м' => 'm',
      'н' => 'n', 'о' => 'o', 'п' => 'p', 'р' => 'r', 'с' => 's', 'т' => 't', 'у' => 'u',
      'ф' => 'f', 'х' => 'h', 'ц' => 'ts', 'ч' => 'ch', 'ш' => 'sh', 'щ' => 'sch',
      'ъ' => '', 'ы' => 'y', 'ь' => '', 'э' => 'e', 'ю' => 'yu', 'я' => 'ya',
      'А' => 'A', 'Б' => 'B', 'В' => 'V', 'Г' => 'G', 'Д' => 'D', 'Е' => 'E', 'Ё' => 'E',
      'Ж' => 'Zh', 'З' => 'Z', 'И' => 'I', 'Й' => 'Y', 'К' => 'K', 'Л' => 'L', 'М' => 'M',
      'Н' => 'N', 'О' => 'O', 'П' => 'P', 'Р' => 'R', 'С' => 'S', 'Т' => 'T', 'У' => 'U',
      'Ф' => 'F', 'Х' => 'H', 'Ц' => 'Ts', 'Ч' => 'Ch', 'Ш' => 'Sh', 'Щ' => 'Sch',
      'Ъ' => '', 'Ы' => 'Y', 'Ь' => '', 'Э' => 'E', 'Ю' => 'Yu', 'Я' => 'Ya'
    }
    
    result = text.dup
    transliteration_map.each { |cyrillic, latin| result.gsub!(cyrillic, latin) }
    result
  end

  def update_booking_from_obs_data(booking, obs_data)
    return unless obs_data.is_a?(Hash)

    # Extract OBS status from the response structure
    obs_status = extract_obs_status(obs_data)
    new_internal_status = booking.map_obs_status(obs_status)

    # Prepare updates hash
    updates = {
      operator_status: obs_status,
      last_synced_at: Time.current
    }

    # Update internal status if changed
    if booking.status != new_internal_status
      updates[:status] = new_internal_status
      
      # Set status-specific timestamps
      case new_internal_status
      when 'confirmed'
        updates[:confirmed_at] = Time.current
      when 'cancelled'
        updates[:cancelled_at] = Time.current
      end
    end

    # Extract and update payment data
    if obs_data['payment']
      updates[:payment_data] = obs_data['payment']
    end

    # Extract and update comments data
    if obs_data['comments']
      updates[:comments_data] = obs_data['comments']
    end

    # Extract and update is_checked flag
    if obs_data['info']&.dig('is_checked')
      updates[:is_checked] = obs_data['info']['is_checked']
    end

    # Extract order_id if available
    if obs_data['info']&.dig('order')
      updates[:obs_order_id] = obs_data['info']['order']
    end

    # Update booking if there are changes
    if updates.any?
      booking.update!(updates)
      Rails.logger.info "Synced booking #{booking.id}: status=#{new_internal_status}, obs_status=#{obs_status}"
    else
      Rails.logger.debug "Booking #{booking.id} status unchanged: #{obs_status}"
    end
  end

  def extract_obs_status(obs_data)
    # Try different possible locations for status in OBS response
    obs_data['order_status']&.dig('name') ||
    obs_data['info']&.dig('order_status')&.dig('name') ||
    obs_data['status'] ||
    obs_data[:status] ||
    'unknown'
  end
end
