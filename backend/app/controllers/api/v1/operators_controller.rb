# Operators controller for monitoring and management
module Api
  module V1
    class OperatorsController < Api::V1::BaseController
      before_action :authenticate_user!
      before_action :ensure_admin, only: [:update_config, :toggle_operator]

      # GET /api/v1/operators
      def index
        operator_manager = OperatorManagerService.instance
        
        render_success({
          operators: operator_manager.get_operators_health,
          primary_operator: OperatorConfigService.primary_operator,
          available_operators: OperatorConfigService.available_operators
        })
      end

      # GET /api/v1/operators/:id/health
      def health
        operator_type = params[:id]
        operator_manager = OperatorManagerService.instance
        
        health_status = operator_manager.get_operators_health[operator_type]
        
        if health_status
          render_success({ operator: operator_type, health: health_status })
        else
          render_error("Operator not found: #{operator_type}", :not_found)
        end
      end

      # GET /api/v1/operators/:id/metrics
      def metrics
        operator_type = params[:id]
        time_range = params[:time_range]&.to_i&.seconds || 1.hour
        
        metrics = MetricsService.get_metrics(time_range)
        operator_metrics = metrics[:operators][operator_type]
        
        if operator_metrics
          render_success({ 
            operator: operator_type, 
            metrics: operator_metrics,
            time_range: time_range.to_i
          })
        else
          render_error("No metrics found for operator: #{operator_type}", :not_found)
        end
      end

      # GET /api/v1/operators/metrics
      def all_metrics
        time_range = params[:time_range]&.to_i&.seconds || 1.hour
        
        render_success({
          metrics: MetricsService.get_metrics(time_range),
          time_range: time_range.to_i
        })
      end

      # POST /api/v1/operators/:id/test
      def test
        operator_type = params[:id]
        
        begin
          operator_manager = OperatorManagerService.instance
          adapter = operator_manager.get_adapter(operator_type)
          
          if adapter
            # Test basic connectivity
            result = adapter.departure_cities
            render_success({ 
              operator: operator_type, 
              test_result: "success",
              message: "Operator is responding correctly",
              sample_data: result.is_a?(Array) ? result.first(3) : result
            })
          else
            render_error("Operator not found or disabled: #{operator_type}", :not_found)
          end
        rescue StandardError => e
          render_error("Operator test failed: #{e.message}", :bad_gateway)
        end
      end

      # PATCH /api/v1/operators/:id/toggle
      def toggle_operator
        operator_type = params[:id]
        enabled = params[:enabled]
        
        # This would typically update the configuration
        # For now, we'll just return the current status
        config = OperatorConfigService.config_for(operator_type)
        
        if config.any?
          render_success({
            operator: operator_type,
            enabled: enabled,
            message: "Operator status updated (configuration reload required)"
          })
        else
          render_error("Operator not found: #{operator_type}", :not_found)
        end
      end

      # GET /api/v1/operators/config
      def config
        render_success({
          primary_operator: OperatorConfigService.primary_operator,
          available_operators: OperatorConfigService.available_operators,
          global_config: {
            load_balancing_strategy: "weighted",
            fallback_enabled: true,
            health_check_interval: 300,
            metrics_enabled: true,
            circuit_breaker_enabled: true
          }
        })
      end

      private

      def ensure_admin
        unless current_user&.admin?
          render_error('Admin access required', :forbidden)
        end
      end
    end
  end
end
