# Admin controller for notification monitoring and metrics
module Api
  module V1
    module Admin
      class NotificationMonitoringController < Api::V1::BaseController
        before_action :authenticate_user!
        before_action :ensure_admin!
        
        # GET /api/v1/admin/notification_monitoring/metrics
        def metrics
          timeframe = parse_timeframe(params[:timeframe])
          metrics = NotificationMonitoringService.instance.get_metrics(timeframe)
          
          render json: {
            success: true,
            metrics: metrics
          }
        end
        
        # GET /api/v1/admin/notification_monitoring/channel_performance
        def channel_performance
          timeframe = parse_timeframe(params[:timeframe])
          performance = NotificationMonitoringService.instance.get_channel_performance(timeframe)
          
          render json: {
            success: true,
            channel_performance: performance
          }
        end
        
        # GET /api/v1/admin/notification_monitoring/error_analysis
        def error_analysis
          timeframe = parse_timeframe(params[:timeframe])
          analysis = NotificationMonitoringService.instance.get_error_analysis(timeframe)
          
          render json: {
            success: true,
            error_analysis: analysis
          }
        end
        
        # GET /api/v1/admin/notification_monitoring/health
        def health
          health_status = NotificationMonitoringService.instance.health_check
          
          status_code = case health_status[:status]
                       when 'healthy'
                         :ok
                       when 'degraded'
                         :service_unavailable
                       else
                         :internal_server_error
                       end
          
          render json: {
            success: health_status[:status] == 'healthy',
            health: health_status
          }, status: status_code
        end
        
        # POST /api/v1/admin/notification_monitoring/check_alerts
        def check_alerts
          NotificationMonitoringService.instance.check_and_alert
          
          render json: {
            success: true,
            message: 'Alert check completed'
          }
        end
        
        # GET /api/v1/admin/notification_monitoring/dashboard
        def dashboard
          # Get comprehensive dashboard data
          timeframe = parse_timeframe(params[:timeframe] || '24h')
          
          metrics = NotificationMonitoringService.instance.get_metrics(timeframe)
          channel_performance = NotificationMonitoringService.instance.get_channel_performance(timeframe)
          error_analysis = NotificationMonitoringService.instance.get_error_analysis(timeframe)
          health_status = NotificationMonitoringService.instance.health_check
          
          # Get recent notifications for activity feed
          recent_notifications = Notification.includes(:user)
                                           .recent
                                           .limit(20)
                                           .map(&method(:notification_summary))
          
          # Get notification trends (last 7 days)
          trends = get_notification_trends(7.days)
          
          render json: {
            success: true,
            dashboard: {
              metrics: metrics,
              channel_performance: channel_performance,
              error_analysis: error_analysis,
              health_status: health_status,
              recent_notifications: recent_notifications,
              trends: trends,
              generated_at: Time.current
            }
          }
        end
        
        private
        
        def parse_timeframe(timeframe_param)
          case timeframe_param
          when '1h', '1hour'
            1.hour
          when '6h', '6hours'
            6.hours
          when '24h', '24hours', '1d', '1day'
            24.hours
          when '7d', '7days', '1w', '1week'
            7.days
          when '30d', '30days', '1m', '1month'
            30.days
          else
            24.hours # default
          end
        end
        
        def notification_summary(notification)
          {
            id: notification.id,
            title: notification.title,
            type: notification.notification_type,
            user: {
              id: notification.user.id,
              email: notification.user.email
            },
            delivered: notification.delivered?,
            read: notification.read?,
            created_at: notification.created_at,
            delivery_channels: notification.delivery_channels
          }
        end
        
        def get_notification_trends(timeframe)
          start_date = timeframe.ago.to_date
          end_date = Date.current
          
          # Group notifications by day
          daily_counts = Notification.where(created_at: start_date..end_date)
                                   .group("DATE(created_at)")
                                   .count
          
          # Fill in missing days with 0
          trends = []
          (start_date..end_date).each do |date|
            trends << {
              date: date.strftime('%Y-%m-%d'),
              count: daily_counts[date] || 0
            }
          end
          
          trends
        end
      end
    end
  end
end
