# Admin controller for managing notifications
module Api
  module V1
    module Admin
      class NotificationsController < Api::V1::BaseController
        before_action :authenticate_user!
        before_action :ensure_admin!
        before_action :set_notification, only: [:show, :update, :destroy]
        
        # GET /api/v1/admin/notifications
        def index
          @notifications = Notification.includes(:user)
                                     .recent
          
          # Pagination
          page = params[:page]&.to_i || 1
          per_page = params[:per_page]&.to_i || 50
          offset = (page - 1) * per_page
          
          # Filtering (apply before pagination for better performance)
          @notifications = @notifications.by_type(params[:type]) if params[:type].present?
          @notifications = @notifications.by_event(params[:event_type]) if params[:event_type].present?
          @notifications = @notifications.where(user_id: params[:user_id]) if params[:user_id].present?
          @notifications = @notifications.where(delivered: params[:delivered]) if params[:delivered].present?
          
          @notifications = @notifications.offset(offset).limit(per_page)
          
          total_count = Notification.count
          total_pages = (total_count.to_f / per_page).ceil
          
          render json: {
            success: true,
            notifications: @notifications.map(&method(:admin_notification_json)),
            pagination: {
              current_page: page,
              total_pages: total_pages,
              total_count: total_count,
              per_page: per_page
            },
            stats: notification_stats
          }
        end
        
        # GET /api/v1/admin/notifications/:id
        def show
          render json: {
            success: true,
            notification: admin_notification_json(@notification)
          }
        end
        
        # POST /api/v1/admin/notifications
        def create
          @notification = Notification.new(notification_params)
          @notification.event_type = 'admin_message'
          
          if @notification.save
            render json: {
              success: true,
              message: 'Notification created successfully',
              notification: admin_notification_json(@notification)
            }, status: :created
          else
            render json: {
              success: false,
              errors: @notification.errors.full_messages
            }, status: :unprocessable_entity
          end
        end
        
        # POST /api/v1/admin/notifications/bulk
        def bulk
          user_ids = params[:user_ids] || []
          delivery_channels = params[:delivery_channels] || ['in_app']
          
          if user_ids.empty?
            render json: {
              success: false,
              message: 'No users selected for bulk notification'
            }, status: :unprocessable_entity
            return
          end
          
          # Rate limiting for bulk notifications
          if user_ids.count > 1000
            render json: {
              success: false,
              message: 'Too many users selected. Maximum 1000 users per bulk notification.'
            }, status: :unprocessable_entity
            return
          end
          
          results = []
          
          user_ids.each do |user_id|
            begin
              notification = Notification.create!(
                user_id: user_id,
                title: bulk_notification_params[:title],
                message: bulk_notification_params[:message],
                notification_type: bulk_notification_params[:notification_type] || 'info',
                delivery_channels: delivery_channels,
                event_type: 'admin_message',
                metadata: bulk_notification_params[:metadata] || {}
              )
              
              results << {
                user_id: user_id,
                success: true,
                notification_id: notification.id
              }
            rescue StandardError => e
              results << {
                user_id: user_id,
                success: false,
                error: e.message
              }
            end
          end
          
          success_count = results.count { |r| r[:success] }
          failure_count = results.count { |r| !r[:success] }
          
          render json: {
            success: true,
            message: "Bulk notification sent: #{success_count} successful, #{failure_count} failed",
            results: results,
            stats: {
              total: results.count,
              successful: success_count,
              failed: failure_count
            }
          }
        end
        
        # PATCH /api/v1/admin/notifications/:id
        def update
          if @notification.update(notification_params)
            render json: {
              success: true,
              message: 'Notification updated successfully',
              notification: admin_notification_json(@notification)
            }
          else
            render json: {
              success: false,
              errors: @notification.errors.full_messages
            }, status: :unprocessable_entity
          end
        end
        
        # DELETE /api/v1/admin/notifications/:id
        def destroy
          @notification.destroy
          
          render json: {
            success: true,
            message: 'Notification deleted successfully'
          }
        end
        
        # GET /api/v1/admin/notifications/stats
        def stats
          render json: {
            success: true,
            stats: notification_stats
          }
        end
        
        # POST /api/v1/admin/notifications/cleanup
        def cleanup
          days = params[:days]&.to_i || 30
          deleted_count = Notification.cleanup_old_notifications(days)
          
          render json: {
            success: true,
            message: "Cleaned up #{deleted_count} old notifications (older than #{days} days)"
          }
        end
        
        private
        
        def set_notification
          @notification = Notification.find(params[:id])
        rescue ActiveRecord::RecordNotFound
          render_error('Notification not found', :not_found)
        end
        
        def notification_params
          params.require(:notification).permit(
            :user_id, :title, :message, :notification_type, 
            :delivery_channels, :metadata
          ).tap do |permitted|
            # Validate message length
            if permitted[:message] && permitted[:message].length > 2000
              raise ActionController::BadRequest, 'Message too long. Maximum 2000 characters allowed.'
            end
            
            # Validate title length
            if permitted[:title] && permitted[:title].length > 255
              raise ActionController::BadRequest, 'Title too long. Maximum 255 characters allowed.'
            end
          end
        end
        
        def bulk_notification_params
          params.require(:notification).permit(
            :title, :message, :notification_type, :metadata
          ).tap do |permitted|
            # Validate message length
            if permitted[:message] && permitted[:message].length > 2000
              raise ActionController::BadRequest, 'Message too long. Maximum 2000 characters allowed.'
            end
            
            # Validate title length
            if permitted[:title] && permitted[:title].length > 255
              raise ActionController::BadRequest, 'Title too long. Maximum 255 characters allowed.'
            end
          end
        end
        
        def admin_notification_json(notification)
          {
            id: notification.id,
            user: {
              id: notification.user.id,
              email: notification.user.email,
              name: notification.user.full_name
            },
            title: notification.title,
            message: notification.message,
            type: notification.notification_type,
            delivery_channels: notification.delivery_channels,
            event_type: notification.event_type,
            event_id: notification.event_id,
            read: notification.read?,
            read_at: notification.read_at,
            delivered: notification.delivered?,
            delivered_at: notification.delivered_at,
            created_at: notification.created_at,
            metadata: notification.metadata
          }
        end
        
        def notification_stats
          {
            total: Notification.count,
            unread: Notification.unread.count,
            delivered: Notification.delivered.count,
            pending_delivery: Notification.pending_delivery.count,
            by_type: Notification.group(:notification_type).count,
            by_event: Notification.group(:event_type).count,
            recent_24h: Notification.where(created_at: 24.hours.ago..).count
          }
        end
        
      end
    end
  end
end
