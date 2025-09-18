# frozen_string_literal: true

# Booking Confirmation Service
# Handles booking confirmation with OBS integration
class BookingConfirmationService
  include ActiveModel::Model
  include ActiveModel::Attributes

  attribute :booking, :object
  attribute :user, :object

  def initialize(booking:, user:)
    super()
    @booking = booking
    @user = user
    @obs_adapter = ObsAdapter.new(user_id: user.id)
  end

  def call
    validate_booking_status!
    confirm_with_obs
  rescue StandardError => e
    error_result(e.message)
  end

  private

  def validate_booking_status!
    unless @booking.status == 'pending'
      raise StandardError, 'Only pending bookings can be confirmed'
    end
  end

  def confirm_with_obs
    booking_data = prepare_booking_data_for_obs
    obs_response = @obs_adapter.create_booking(@booking.obs_booking_hash, booking_data)
    
    obs_order_id = extract_order_id(obs_response)
    update_booking_status(obs_response, obs_order_id)
    
    success_result
  end

  def prepare_booking_data_for_obs
    {
      selectedServices: ['hotel', 'avia_transport'],
      aquapark_services: [],
      never_land_entrance: [],
      gala_dinner: [],
      tourists: prepare_tourists_data,
      transfers: prepare_transfers_data,
      insurance: prepare_insurance_data,
      comment: extract_comment_from_notes,
      notes: prepare_notes_data,
      total_sum: @booking.total_amount
    }
  end

  def prepare_tourists_data
    customer_data = @booking.customer_data_hash
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

  def prepare_transfers_data
    tour_details = @booking.tour_details_hash
    services = tour_details['services'] || {}
    values = tour_details['values'] || {}
    
    if values['transfers'].present?
      return values['transfers']
    end
    
    transfers = services['transfers'] || []
    if transfers.any?
      first_transfer = transfers.first
      if first_transfer.is_a?(Hash) && first_transfer['id'].present?
        return first_transfer['id']
      end
    end
    
    customer_data = @booking.customer_data_hash
    additional_services = customer_data['additional_services'] || {}
    transfer = additional_services['transfer'] || {}
    
    transfer_type = transfer['type'] || 'GROUP'
    
    case transfer_type.upcase
    when 'INDIVIDUAL'
      '269:270'
    else
      '1165:1166'
    end
  end

  def prepare_insurance_data
    customer_data = @booking.customer_data_hash
    additional_services = customer_data['additional_services'] || {}
    insurance = additional_services['insurance'] || {}
    
    insurance_type = insurance['type'] || 'STANDARD'
    
    case insurance_type.upcase
    when 'EXTENDED'
      2
    else
      1
    end
  end

  def prepare_notes_data
    tour_details = @booking.tour_details_hash
    tour_notes = tour_details['notes'] || []
    
    if tour_notes.any?
      return tour_notes
    end
    
    notes = []
    customer_data = @booking.customer_data_hash
    notes_data = customer_data['notes'] || {}
    
    if notes_data.is_a?(Hash)
      note_mappings = {
        'honeymooners' => 'Honeymooners',
        'regularGuest' => "Hotel's regular guest(s)",
        'twinBeds' => 'Twin beds (according possibility)',
        'groundFloor' => 'Ground floor',
        'notGroundFloor' => 'NOT ground floor',
        'babyCot' => 'Baby cot',
        'handicapAccessible' => 'Handicap accessible room (according possibility)',
        'doubleBed' => 'Double bed/King size (according possibility)'
      }
      
      note_mappings.each do |key, value|
        notes << value if notes_data[key]
      end
    else
      # Legacy format
      legacy_mappings = {
        'honeymooners' => 'Honeymooners',
        'regularGuest' => "Hotel's regular guest(s)",
        'twinBeds' => 'Twin beds (according possibility)',
        'groundFloor' => 'Ground floor',
        'notGroundFloor' => 'NOT ground floor',
        'babyCot' => 'Baby cot',
        'handicapAccessible' => 'Handicap accessible room (according possibility)',
        'doubleBed' => 'Double bed/King size (according possibility)'
      }
      
      legacy_mappings.each do |key, value|
        notes << value if customer_data[key]
      end
    end

    notes
  end

  def extract_comment_from_notes
    customer_data = @booking.customer_data_hash
    notes = customer_data['notes'] || {}
    
    if notes.is_a?(Hash) && notes['comment'].present?
      return notes['comment']
    end
    
    if notes.is_a?(String) && notes.present?
      return notes
    end
    
    @booking.notes || ''
  end

  def transliterate_to_english(text)
    return 'John' if text.blank?
    
    transliteration_map = {
      'А' => 'A', 'Б' => 'B', 'В' => 'V', 'Г' => 'G', 'Д' => 'D', 'Е' => 'E', 'Ё' => 'E',
      'Ж' => 'Zh', 'З' => 'Z', 'И' => 'I', 'Й' => 'Y', 'К' => 'K', 'Л' => 'L', 'М' => 'M',
      'Н' => 'N', 'О' => 'O', 'П' => 'P', 'Р' => 'R', 'С' => 'S', 'Т' => 'T', 'У' => 'U',
      'Ф' => 'F', 'Х' => 'Kh', 'Ц' => 'Ts', 'Ч' => 'Ch', 'Ш' => 'Sh', 'Щ' => 'Shch',
      'Ъ' => '', 'Ы' => 'Y', 'Ь' => '', 'Э' => 'E', 'Ю' => 'Yu', 'Я' => 'Ya',
      'а' => 'a', 'б' => 'b', 'в' => 'v', 'г' => 'g', 'д' => 'd', 'е' => 'e', 'ё' => 'e',
      'ж' => 'zh', 'з' => 'z', 'и' => 'i', 'й' => 'y', 'к' => 'k', 'л' => 'l', 'м' => 'm',
      'н' => 'n', 'о' => 'o', 'п' => 'p', 'р' => 'r', 'с' => 's', 'т' => 't', 'у' => 'u',
      'ф' => 'f', 'х' => 'kh', 'ц' => 'ts', 'ч' => 'ch', 'ш' => 'sh', 'щ' => 'shch',
      'ъ' => '', 'ы' => 'y', 'ь' => '', 'э' => 'e', 'ю' => 'yu', 'я' => 'ya'
    }
    
    result = text.chars.map { |char| transliteration_map[char] || char }.join
    result = result.gsub(/[^a-zA-Z\s\-]/, '').strip
    result.present? ? result : 'John'
  end

  def extract_order_id(obs_response)
    obs_response.dig('order_number') || obs_response.dig('order_id') || obs_response.dig('id')
  end

  def update_booking_status(obs_response, obs_order_id)
    @booking.update!(
      obs_order_id: obs_order_id,
      operator_id: obs_response.dig('id'), # Numeric ID for OBS API calls
      status: 'confirmed',
      confirmed_at: Time.current,
      tour_details: obs_response
    )
  end

  def success_result
    {
      success: true,
      booking: {
        id: @booking.id,
        obs_booking_hash: @booking.obs_booking_hash,
        obs_order_id: @booking.obs_order_id,
        status: @booking.status,
        total_amount: @booking.total_amount,
        confirmed_at: @booking.confirmed_at
      }
    }
  end

  def error_result(message)
    {
      success: false,
      error: message
    }
  end
end
