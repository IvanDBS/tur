# Bookings controller for OBS tour bookings
module Api
  module V1
    class BookingsController < Api::V1::BaseController
      before_action :authenticate_user!
      before_action :set_booking, only: %i[show update destroy confirm]

      # GET /api/v1/bookings
      def index
        bookings = current_user.bookings.recent.includes(:search_query)

        render_success({
                         bookings: bookings.map do |booking|
                           {
                             id: booking.id,
                             obs_booking_hash: booking.obs_booking_hash,
                             status: booking.status,
                             total_amount: booking.total_amount,
                             tour_details: booking.tour_details_hash,
                             customer_data: booking.customer_data_hash,
                             created_at: booking.created_at,
                             confirmed_at: booking.confirmed_at,
                             can_be_cancelled: booking.can_be_cancelled?
                           }
                         end
                       })
      end

      # GET /api/v1/bookings/:id
      def show
        render_success({
                         booking: {
                           id: @booking.id,
                           obs_booking_hash: @booking.obs_booking_hash,
                           obs_order_id: @booking.obs_order_id,
                           status: @booking.status,
                           total_amount: @booking.total_amount,
                           customer_data: @booking.customer_data_hash,
                           tour_details: @booking.tour_details_hash,
                           notes: @booking.notes,
                           created_at: @booking.created_at,
                           confirmed_at: @booking.confirmed_at,
                           cancelled_at: @booking.cancelled_at,
                           can_be_cancelled: @booking.can_be_cancelled?
                         }
                       })
      end

      # POST /api/v1/bookings
      def create
        booking_params = params[:booking] || {}
        search_id = booking_params[:search_id]
        booking_hash = booking_params[:booking_hash]

        return render_error('Booking hash is required', :bad_request) if booking_hash.blank?

        # Find search query if provided (optional)
        search_query = nil
        if search_id.present?
          search_query = current_user.search_queries.find_by(obs_search_id: search_id)
          # Don't fail if search_query is not found - it's optional for booking creation
          Rails.logger.info "Search query not found for search_id: #{search_id}, continuing without it"
        end

        begin
          # Get booking data from OBS API first
          obs_adapter = ObsAdapter.new(user_id: current_user.id)
          Rails.logger.info "Getting booking data for hash: #{booking_hash}"
          booking_data = obs_adapter.get_booking_data(booking_hash)
          Rails.logger.info "Received booking data: #{booking_data.inspect}"

          # Create booking record with OBS data
          # Filter only relevant tour details, exclude reference data
          tour_details = if booking_data.present?
            filter_tour_details(booking_data)
          else
            booking_params[:tour_details] || {}
          end
          total_amount = booking_data.dig('price', 'total_sum') || booking_params[:total_amount] || 0
          
          booking = current_user.bookings.build(
            search_query: search_query,
            obs_booking_hash: booking_hash,
            total_amount: total_amount,
            tour_details: tour_details,
            customer_data: booking_params[:customer_data] || {},
            status: 'pending'
          )

          if booking.save
            # Create booking on OBS server
            Rails.logger.info "Creating booking on OBS server for hash: #{booking_hash}"
            begin
              # Prepare data in OBS API format
              obs_booking_data = prepare_booking_data_for_obs(booking)
              Rails.logger.info "OBS booking data: #{obs_booking_data.inspect}"
              
              obs_response = obs_adapter.create_booking(booking_hash, obs_booking_data)
              Rails.logger.info "OBS booking created successfully: #{obs_response.inspect}"
              
              # Update booking with OBS response data
              if obs_response.present?
                booking.update!(
                  obs_order_id: obs_response.dig('order_number') || obs_response.dig('order_id') || obs_response.dig('id'),
                  operator_status: obs_response.dig('status'),
                  last_synced_at: Time.current
                )
                Rails.logger.info "Booking updated with OBS data: order_id=#{booking.obs_order_id}, status=#{booking.operator_status}"
                
                # Return success only if OBS booking was created
                render_success({
                                 booking: {
                                   id: booking.id,
                                   obs_booking_hash: booking.obs_booking_hash,
                                   obs_order_id: booking.obs_order_id,
                                   status: booking.status,
                                   operator_status: booking.operator_status,
                                   total_amount: booking.total_amount,
                                   tour_details: booking.tour_details_hash
                                 }
                               }, :created)
              else
                # OBS response is empty - this is an error
                Rails.logger.error "OBS booking creation failed: empty response"
                booking.destroy # Remove the local booking since OBS failed
                render_error("Failed to create booking with operator: empty response", :bad_gateway)
              end
            rescue ObsAdapter::Error => obs_error
              Rails.logger.error "Failed to create booking on OBS server: #{obs_error.message}"
              booking.destroy # Remove the local booking since OBS failed
              render_error("Failed to create booking with operator: #{obs_error.message}", :bad_gateway)
            end
          else
            render_error("Failed to create booking: #{booking.errors.full_messages.join(', ')}", :unprocessable_entity)
          end
        rescue ObsAdapter::Error => e
          Rails.logger.error "OBS API error in booking creation: #{e.message}"
          render_error("Failed to get booking data from operator: #{e.message}", :bad_gateway)
        rescue StandardError => e
          Rails.logger.error "Unexpected error in booking creation: #{e.message}"
          render_error("Internal server error: #{e.message}", :internal_server_error)
        end
      end

      # POST /api/v1/bookings/calculate
      def calculate
        booking_hash = params[:booking_hash]
        customer_data = params[:customer_data] || {}

        return render_error('Booking hash is required', :bad_request) if booking_hash.blank?

        begin
          # Calculate booking with OBS API
          obs_adapter = ObsAdapter.new(user_id: current_user.id)
          calculation_result = obs_adapter.calculate_booking(booking_hash, customer_data)

          # If OBS returns updated pricing, use it; otherwise return original data
          if calculation_result.present? && calculation_result.is_a?(Hash)
            render_success({
                             calculation_details: calculation_result
                           })
          else
            # No price change from OBS
            render_success({
                             calculation_details: {
                               message: "No price changes",
                               customer_data: customer_data
                             }
                           })
          end
        rescue ObsAdapter::Error => e
          Rails.logger.error "OBS API error in booking calculation: #{e.message}"
          render_error("Failed to calculate booking: #{e.message}", :bad_gateway)
        rescue StandardError => e
          Rails.logger.error "Unexpected error in booking calculation: #{e.message}"
          render_error("Internal server error: #{e.message}", :internal_server_error)
        end
      end

      # POST /api/v1/bookings/:id/confirm
      def confirm
        if @booking.status != 'pending'
          return render_error('Only pending bookings can be confirmed',
                              :unprocessable_entity)
        end

        begin
          # Prepare booking data for OBS API
          booking_data = prepare_booking_data_for_obs

          # Create booking with OBS API
          obs_adapter = ObsAdapter.new(user_id: current_user.id)
          obs_response = obs_adapter.create_booking(@booking.obs_booking_hash, booking_data)

          # Extract order ID from OBS response
          obs_order_id = obs_response.dig('order_number') || obs_response.dig('order_id') || obs_response.dig('id')

          # Update booking status
          @booking.update!(
            obs_order_id: obs_order_id,
            status: 'confirmed',
            confirmed_at: Time.current,
            tour_details: obs_response # Store full OBS response
          )

          render_success({
                           booking: {
                             id: @booking.id,
                             obs_booking_hash: @booking.obs_booking_hash,
                             obs_order_id: @booking.obs_order_id,
                             status: @booking.status,
                             total_amount: @booking.total_amount,
                             confirmed_at: @booking.confirmed_at
                           }
                         })
        rescue ObsAdapter::Error => e
          Rails.logger.error "OBS API error in booking confirmation: #{e.message}"
          render_error("Failed to confirm booking: #{e.message}", :bad_gateway)
        rescue StandardError => e
          Rails.logger.error "Unexpected error in booking confirmation: #{e.message}"
          render_error("Internal server error: #{e.message}", :internal_server_error)
        end
      end

      # PATCH /api/v1/bookings/:id
      def update
        update_params = params[:booking] || {}

        if @booking.update(update_params)
          render_success({
                           booking: {
                             id: @booking.id,
                             obs_booking_hash: @booking.obs_booking_hash,
                             status: @booking.status,
                             total_amount: @booking.total_amount,
                             notes: @booking.notes
                           }
                         })
        else
          render_error("Failed to update booking: #{@booking.errors.full_messages.join(', ')}", :unprocessable_entity)
        end
      end

      # DELETE /api/v1/bookings/:id
      def destroy
        if @booking.confirmed? && !@booking.can_be_cancelled?
          return render_error('Cannot cancel confirmed booking after 24 hours', :unprocessable_entity)
        end

        begin
          # Cancel booking with OBS API
          obs_adapter = ObsAdapter.new(user_id: current_user.id)
          obs_adapter.cancel_booking(@booking.obs_booking_hash)

          # Update local booking status
          @booking.update!(
            status: 'cancelled',
            cancelled_at: Time.current
          )

          render_success({ message: 'Booking cancelled successfully' })
        rescue ObsAdapter::Error => e
          Rails.logger.error "OBS API error in booking cancellation: #{e.message}"
          render_error("Failed to cancel booking: #{e.message}", :bad_gateway)
        rescue StandardError => e
          Rails.logger.error "Unexpected error in booking cancellation: #{e.message}"
          render_error("Internal server error: #{e.message}", :internal_server_error)
        end
      end

      private

      def set_booking
        @booking = current_user.bookings.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render_error('Booking not found', :not_found)
      end

      def prepare_booking_data_for_obs(booking = @booking)
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

      def prepare_tourists_data(booking = @booking)
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

      def prepare_transfers_data(booking = @booking)
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

      def prepare_insurance_data(booking = @booking)
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

      def filter_tour_details(obs_data)
        # Extract only relevant tour information, exclude reference data
        {
          hotel: obs_data['hotel'],
          flights: obs_data['flights'],
          tourists: obs_data['tourists'],
          services: obs_data['services'],
          notes: obs_data['notes'],
          price: obs_data['price'],
          values: obs_data['values']
        }.compact
      end

      def transliterate_to_english(text)
        return 'John' if text.blank?
        
        # Simple transliteration mapping for common Cyrillic characters
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
        
        # Apply transliteration
        result = text.chars.map { |char| transliteration_map[char] || char }.join
        
        # Clean up any remaining non-ASCII characters and ensure it's not empty
        result = result.gsub(/[^a-zA-Z\s\-]/, '').strip
        result.present? ? result : 'John'
      end

      def prepare_notes_data(booking = @booking)
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

      def extract_comment_from_notes(booking = @booking)
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
    end
  end
end
