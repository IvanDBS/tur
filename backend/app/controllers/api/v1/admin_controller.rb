# Admin controller for managing bookings and system administration
module Api
  module V1
    class AdminController < Api::V1::BaseController
      before_action :authenticate_user!
      before_action :ensure_admin!

      # GET /api/v1/admin/bookings
      def bookings
        bookings_query = Booking.includes(:user, :search_query).recent

        # Apply filters
        if params[:status].present?
          bookings_query = bookings_query.where(status: params[:status])
        end

        if params[:search].present?
          search_term = "%#{params[:search]}%"
          bookings_query = bookings_query.joins(:user)
                                        .where("bookings.id::text ILIKE ? OR users.email ILIKE ?", 
                                               search_term, search_term)
        end

        # Paginate results
        pagy, bookings = pagy(bookings_query, items: params[:per_page] || 20)

        render_success({
          bookings: bookings.map do |booking|
            {
              id: booking.id,
              user: {
                id: booking.user.id,
                email: booking.user.email,
                name: "#{booking.user.first_name} #{booking.user.last_name}".strip.presence || booking.user.email
              },
              status: booking.status,
              total_amount: booking.total_amount,
              tour_details: booking.tour_details_hash,
              customer_data: booking.customer_data_hash,
              created_at: booking.created_at,
              confirmed_at: booking.confirmed_at,
              cancelled_at: booking.cancelled_at,
              obs_booking_hash: booking.obs_booking_hash,
              obs_order_id: booking.obs_order_id,
              operator_id: booking.operator_id,
              operator_status: booking.operator_status
            }
          end,
          pagination: {
            current_page: pagy.page,
            total_pages: pagy.pages,
            total_count: pagy.count,
            per_page: pagy.limit
          }
        })
      end

      # GET /api/v1/admin/bookings/:id
      def booking_details
        booking = Booking.includes(:user, :search_query).find(params[:id])
        
        render_success({
          booking: {
            id: booking.id,
            user: {
              id: booking.user.id,
              email: booking.user.email,
              name: "#{booking.user.first_name} #{booking.user.last_name}".strip.presence || booking.user.email,
              phone: booking.user.phone
            },
            status: booking.status,
            total_amount: booking.total_amount,
            tour_details: booking.tour_details_hash,
            customer_data: booking.customer_data_hash,
            notes: booking.notes,
            created_at: booking.created_at,
            confirmed_at: booking.confirmed_at,
            cancelled_at: booking.cancelled_at,
            obs_booking_hash: booking.obs_booking_hash,
            obs_order_id: booking.obs_order_id,
            operator_id: booking.operator_id,
            operator_status: booking.operator_status,
            search_query: booking.search_query&.as_json(only: [:id, :obs_search_id, :created_at])
          }
        })
      rescue ActiveRecord::RecordNotFound
        render_error('Booking not found', :not_found)
      end

      # PATCH /api/v1/admin/bookings/:id/status
      def update_booking_status
        booking = Booking.find(params[:id])
        new_status = params[:status]

        unless %w[pending confirmed cancelled failed].include?(new_status)
          return render_error('Invalid status', :bad_request)
        end

        # Update booking status
        booking.status = new_status
        
        case new_status
        when 'confirmed'
          booking.confirmed_at = Time.current
          booking.obs_order_id ||= "ADMIN-#{booking.id}-#{Time.current.to_i}"
        when 'cancelled'
          booking.cancelled_at = Time.current
        end

        if booking.save
          render_success({
            booking: {
              id: booking.id,
              status: booking.status,
              confirmed_at: booking.confirmed_at,
              cancelled_at: booking.cancelled_at,
              obs_order_id: booking.obs_order_id
            }
          })
        else
          render_error("Failed to update booking: #{booking.errors.full_messages.join(', ')}", :unprocessable_entity)
        end
      rescue ActiveRecord::RecordNotFound
        render_error('Booking not found', :not_found)
      end

      # GET /api/v1/admin/stats
      def stats
        total_bookings = Booking.count
        pending_bookings = Booking.where(status: 'pending').count
        confirmed_bookings = Booking.where(status: 'confirmed').count
        cancelled_bookings = Booking.where(status: 'cancelled').count
        
        recent_bookings = Booking.where(created_at: 7.days.ago..).count
        total_revenue = Booking.where(status: 'confirmed').sum(:total_amount)

        render_success({
          stats: {
            total_bookings: total_bookings,
            pending_bookings: pending_bookings,
            confirmed_bookings: confirmed_bookings,
            cancelled_bookings: cancelled_bookings,
            recent_bookings: recent_bookings,
            total_revenue: total_revenue
          }
        })
      end

      # POST /api/v1/admin/bookings/:id/sync
      def sync_booking_status
        booking = Booking.find(params[:id])
        
        begin
          # Trigger immediate status sync for this booking
          MonitorBookingJob.perform_later(booking.id)
          
          render_success({
            message: "Booking status sync initiated",
            booking_id: booking.id,
            current_status: booking.status,
            last_synced_at: booking.last_synced_at
          })
        rescue StandardError => e
          Rails.logger.error "Failed to initiate booking sync for #{booking.id}: #{e.message}"
          render_error("Failed to sync booking status: #{e.message}", :internal_server_error)
        end
      rescue ActiveRecord::RecordNotFound
        render_error('Booking not found', :not_found)
      end

      # POST /api/v1/admin/bookings/sync_all
      def sync_all_bookings
        begin
          # Trigger sync for all active bookings
          SyncBookingStatusesJob.perform_later
          
          # Count bookings that will be synced
          active_bookings_count = Booking.where(status: ['pending', 'processing', 'confirmed', 'changed'])
                                         .where('last_synced_at IS NULL OR last_synced_at < ?', 2.hours.ago)
                                         .count
          
          render_success({
            message: "Bulk booking status sync initiated",
            bookings_to_sync: active_bookings_count
          })
        rescue StandardError => e
          Rails.logger.error "Failed to initiate bulk booking sync: #{e.message}"
          render_error("Failed to sync all bookings: #{e.message}", :internal_server_error)
        end
      end

      # GET /api/v1/admin/bookings/:id/obs-details
      def obs_booking_details
        booking_hash = params[:id]
        
        begin
          # Get OBS order details from OBS API using site authentication
          site_auth = ObsSiteAuthService.instance
          obs_service = ObsApiService.new(
            base_url: ENV['OBS_API_BASE_URL'] || 'https://test-v2.obs.md',
            access_token: site_auth.access_token
          )
          
          # First try to get order details by operator_id (numeric ID from OBS API)
          if params[:operator_id].present?
            order_details = obs_service.get_order_details(params[:operator_id].to_i)
            if order_details
              render_success(order_details)
              return
            end
          end
          
          # Fallback: try to get order details by order ID (more complete data)
          if params[:order_id].present?
            order_details = obs_service.get_order_details(params[:order_id].to_i)
            if order_details
              render_success(order_details)
              return
            end
          end
          
          # Try to find order by order_number using GET Index
          if params[:order_number].present?
            orders_list = obs_service.get_orders_list(filters: { order_number: params[:order_number] })
            if orders_list && orders_list.any?
              # Get the first order and extract its ID
              order_data = orders_list.first
              order_id = order_data['id']
              if order_id
                order_details = obs_service.get_order_details(order_id)
                if order_details
                  render_success(order_details)
                  return
                end
              end
            end
          end
          
          # Fallback to booking details by hash
          booking_details = obs_service.get_booking(booking_hash)
          
          if booking_details
            render_success(booking_details)
          else
            render_error('Booking details not found', :not_found)
          end
        rescue StandardError => e
          Rails.logger.error "Failed to fetch OBS booking details: #{e.message}"
          render_error("Failed to fetch booking details: #{e.message}", :internal_server_error)
        end
      end

    private

      def ensure_admin!
        unless current_user&.admin?
          Rails.logger.warn "Non-admin user #{current_user&.id} attempted to access admin panel"
          render_error('Admin access required', :forbidden)
        end
      end
    end
  end
end
