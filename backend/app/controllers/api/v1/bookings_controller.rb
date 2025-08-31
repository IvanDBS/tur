# Bookings controller for OBS tour bookings
module Api
  module V1
    class BookingsController < Api::V1::BaseController
      before_action :authenticate_user!
      before_action :set_booking, only: %i[show update destroy calculate confirm]

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

        # Find search query if provided
        search_query = nil
        if search_id.present?
          search_query = current_user.search_queries.find_by(obs_search_id: search_id)
          return render_error('Search not found', :not_found) if search_query.nil?
        end

        # Get booking details from OBS API
        booking_hash = booking_params[:booking_hash]
        return render_error('Booking hash is required', :bad_request) if booking_hash.blank?

        begin
          # Get booking details from OBS
          adapter = ObsAdapter.new(user_id: current_user.id)
          obs_booking = adapter.booking_status(booking_hash)

          # Create booking record
          booking = current_user.bookings.build(
            search_query: search_query,
            obs_booking_hash: booking_hash,
            total_amount: obs_booking['total_sum'] || 0,
            tour_details: obs_booking['hotel'] || {},
            customer_data: booking_params[:customer_data] || {},
            status: 'pending'
          )

          if booking.save
            render_success({
                             booking: {
                               id: booking.id,
                               obs_booking_hash: booking.obs_booking_hash,
                               status: booking.status,
                               total_amount: booking.total_amount,
                               tour_details: booking.tour_details_hash
                             }
                           }, :created)
          else
            render_error("Failed to create booking: #{booking.errors.full_messages.join(', ')}", :unprocessable_entity)
          end
        rescue ObsAdapter::Error => e
          render_error("Failed to get booking details: #{e.message}", :bad_gateway)
        end
      end

      # POST /api/v1/bookings/:id/calculate
      def calculate
        customer_data = params[:customer_data] || {}

        begin
          # Calculate booking with OBS API
          obs_response = ObsApiService.new.calculate_booking(@booking.obs_booking_hash, customer_data)

          # Update booking with calculated data
          @booking.update!(
            customer_data: customer_data,
            total_amount: obs_response['total_amount'] || @booking.total_amount
          )

          render_success({
                           booking: {
                             id: @booking.id,
                             obs_booking_hash: @booking.obs_booking_hash,
                             total_amount: @booking.total_amount,
                             customer_data: @booking.customer_data_hash,
                             calculation_details: obs_response
                           }
                         })
        rescue ObsApiService::Error => e
          render_error("Failed to calculate booking: #{e.message}", :bad_gateway)
        end
      end

      # POST /api/v1/bookings/:id/confirm
      def confirm
        if @booking.status != 'pending'
          return render_error('Only pending bookings can be confirmed',
                              :unprocessable_entity)
        end

        begin
          # Confirm booking with OBS API
          adapter = ObsAdapter.new(user_id: current_user.id)
          obs_response = adapter.book(
            @booking.obs_booking_hash,
            @booking.customer_data_hash
          )

          # Update booking status
          @booking.update!(
            obs_order_id: obs_response['order_number'],
            status: 'confirmed',
            confirmed_at: Time.current
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
          render_error("Failed to confirm booking: #{e.message}", :bad_gateway)
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
          # Cancel booking in OBS API
          adapter = ObsAdapter.new(user_id: current_user.id)
          adapter.cancel_booking(@booking.obs_booking_hash)

          @booking.update!(
            status: 'cancelled',
            cancelled_at: Time.current
          )

          render_success({ message: 'Booking cancelled successfully' })
        rescue ObsAdapter::Error => e
          render_error("Failed to cancel booking: #{e.message}", :bad_gateway)
        end
      end

      private

      def set_booking
        @booking = current_user.bookings.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render_error('Booking not found', :not_found)
      end
    end
  end
end
