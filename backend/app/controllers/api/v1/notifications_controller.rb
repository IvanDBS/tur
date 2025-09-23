# API controller for user notifications
module Api
  module V1
    class NotificationsController < Api::V1::BaseController
      before_action :authenticate_user!
      before_action :set_notification, only: [:show, :mark_read, :destroy]
      
      # GET /api/v1/notifications
      def index
        @notifications = current_user.notifications.recent
        
        # Pagination
        page = params[:page]&.to_i || 1
        per_page = params[:per_page]&.to_i || 20
        offset = (page - 1) * per_page
        
        @notifications = @notifications.offset(offset).limit(per_page)
        
        total_count = current_user.notifications.count
        total_pages = (total_count.to_f / per_page).ceil
        
        render json: {
          success: true,
          notifications: @notifications.map(&method(:notification_json)),
          pagination: {
            current_page: page,
            total_pages: total_pages,
            total_count: total_count,
            per_page: per_page
          },
          unread_count: current_user.notifications.unread.count
        }
      end
      
      # GET /api/v1/notifications/:id
      def show
        render json: {
          success: true,
          notification: notification_json(@notification)
        }
      end
      
      # PATCH /api/v1/notifications/:id/mark_read
      def mark_read
        @notification.mark_as_read!
        
        render json: {
          success: true,
          message: 'Notification marked as read',
          notification: notification_json(@notification)
        }
      end
      
      # PATCH /api/v1/notifications/mark_all_read
      def mark_all_read
        current_user.notifications.unread.update_all(read_at: Time.current)
        
        render json: {
          success: true,
          message: 'All notifications marked as read'
        }
      end
      
      # DELETE /api/v1/notifications/:id
      def destroy
        @notification.destroy
        
        render json: {
          success: true,
          message: 'Notification deleted'
        }
      end
      
      # GET /api/v1/notifications/unread_count
      def unread_count
        count = current_user.notifications.unread.count
        
        render json: {
          success: true,
          unread_count: count
        }
      end
      
      private
      
      def set_notification
        @notification = current_user.notifications.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render_error('Notification not found', :not_found)
      end
      
      def notification_json(notification)
        {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: notification.notification_type,
          delivery_channels: notification.delivery_channels,
          read: notification.read?,
          read_at: notification.read_at,
          created_at: notification.created_at,
          metadata: notification.metadata
        }
      end
      
    end
  end
end
