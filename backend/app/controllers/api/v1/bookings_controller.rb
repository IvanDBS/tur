# Bookings controller for OBS tour bookings
module Api
  module V1
    class BookingsController < Api::V1::BaseController
      before_action :authenticate_user!
      before_action :set_booking, only: %i[show update destroy confirm]

      # GET /api/v1/bookings
      def index
        # Use replica for read operations with optimized includes
        bookings = current_user.bookings
          .recent
          .includes(:search_query, :user)

        render_success({
                         bookings: bookings.map do |booking|
                           {
                             id: booking.id,
                             obs_booking_hash: booking.obs_booking_hash,
                             obs_order_id: booking.obs_order_id,
                             operator_id: booking.operator_id,
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
                           operator_id: @booking.operator_id,
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

        # Validate secure parameters
        unless validate_secure_params!(booking_params, ['booking_hash'])
          return
        end

        if booking_params[:booking_hash].blank?
          return render_error('Booking hash is required', :bad_request)
        end

        # Find search query if provided (optional)
        search_query = find_search_query(search_id)

        # Use BookingCreationService for complex logic
        service = BookingCreationService.new(
          user: current_user,
          booking_params: booking_params,
          search_query: search_query
        )

        result = service.call

        if result[:success]
          render_success(result[:booking], :created)
        else
          status_code = result[:error]&.include?('already') ? :conflict : :unprocessable_entity
          render_error(result[:error], status_code)
        end
      rescue ObsAdapter::Error => e
        Rails.logger.error "OBS API error in booking creation: #{e.message}"
        render_error("Failed to get booking data from operator: #{e.message}", :bad_gateway)
      rescue StandardError => e
        Rails.logger.error "Unexpected error in booking creation: #{e.message}"
        render_error("Internal server error: #{e.message}", :internal_server_error)
      end

      # POST /api/v1/bookings/calculate
      def calculate
        booking_hash = params[:booking_hash]
        customer_data = params[:customer_data] || {}

        return render_error('Booking hash is required', :bad_request) if booking_hash.blank?

        # Use BookingCalculationService
        service = BookingCalculationService.new(
          user: current_user,
          booking_hash: booking_hash,
          customer_data: customer_data
        )

        result = service.call

        if result[:success]
          render_success(result[:calculation_details])
        else
          render_error(result[:error], :bad_gateway)
        end
      rescue ObsAdapter::Error => e
        Rails.logger.error "OBS API error in booking calculation: #{e.message}"
        render_error("Failed to calculate booking: #{e.message}", :bad_gateway)
      rescue StandardError => e
        Rails.logger.error "Unexpected error in booking calculation: #{e.message}"
        render_error("Internal server error: #{e.message}", :internal_server_error)
      end

      # POST /api/v1/bookings/:id/confirm
      def confirm
        # Use BookingConfirmationService
        service = BookingConfirmationService.new(
          booking: @booking,
          user: current_user
        )

        result = service.call

        if result[:success]
          render_success(result[:booking])
        else
          render_error(result[:error], :unprocessable_entity)
        end
      rescue ObsAdapter::Error => e
        Rails.logger.error "OBS API error in booking confirmation: #{e.message}"
        render_error("Failed to confirm booking: #{e.message}", :bad_gateway)
      rescue StandardError => e
        Rails.logger.error "Unexpected error in booking confirmation: #{e.message}"
        render_error("Internal server error: #{e.message}", :internal_server_error)
      end

      # PATCH /api/v1/bookings/:id
      def update
        # Validate update permissions
        unless validate_resource_access!('booking', params[:id], 'update')
          return
        end
        
        update_params = params[:booking] || {}
        
        # Validate secure parameters
        unless validate_secure_params!(update_params)
          return
        end

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
        # Validate delete permissions
        unless validate_resource_access!('booking', params[:id], 'delete')
          return
        end

        # Use BookingCancellationService
        service = BookingCancellationService.new(
          booking: @booking,
          user: current_user
        )

        result = service.call

        if result[:success]
          render_success({ message: result[:message] })
        else
          render_error(result[:error], :unprocessable_entity)
        end
      rescue ObsAdapter::Error => e
        Rails.logger.error "OBS API error in booking cancellation: #{e.message}"
        render_error("Failed to cancel booking: #{e.message}", :bad_gateway)
      rescue StandardError => e
        Rails.logger.error "Unexpected error in booking cancellation: #{e.message}"
        render_error("Internal server error: #{e.message}", :internal_server_error)
      end

      private

      def set_booking
        @booking = validate_resource_access!('booking', params[:id], 'read')
        return unless @booking
      end

      def find_search_query(search_id)
        return nil if search_id.blank?
        
        begin
          search_query = validate_resource_access!('search_query', search_id, 'read')
          if search_query.nil?
            Rails.logger.info "Search query access denied for search_id: #{search_id}, continuing without it"
            nil
          else
            search_query
          end
        rescue => e
          Rails.logger.warn "Failed to find search query for search_id: #{search_id}, continuing without it - #{e.message}"
          nil
        end
      end

    end
  end
end
