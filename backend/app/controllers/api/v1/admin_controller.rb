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
              obs_order_id: booking.obs_order_id
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

      private

      def ensure_admin!
        # TODO: Implement proper admin role checking
        # For now, allow any authenticated user to access admin panel
        # In production, you should check for admin role/permissions
        unless current_user
          render_error('Admin access required', :forbidden)
        end
      end
    end
  end
end
