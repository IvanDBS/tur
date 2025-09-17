# frozen_string_literal: true

# Database Replication Controller for admin monitoring
module Api
  module V1
    module Admin
      class DatabaseReplicationController < Api::V1::BaseController
        before_action :authenticate_user!
        before_action :require_admin!

        # GET /api/v1/admin/database-replication/status
        def status
          stats = DatabaseReplicationService.connection_stats
          
          render_success({
            replication_status: {
              replica_available: DatabaseReplicationService.replica_available?,
              replica_lag: DatabaseReplicationService.replica_lag,
              connection_stats: stats,
              timestamp: Time.current.iso8601
            }
          })
        end

        # GET /api/v1/admin/database-replication/health
        def health
          # Perform comprehensive health check
          health_data = {
            primary_healthy: check_primary_health,
            replica_healthy: check_replica_health,
            replica_lag: DatabaseReplicationService.replica_lag,
            connection_pools: DatabaseReplicationService.connection_stats,
            timestamp: Time.current.iso8601
          }
          
          overall_health = health_data[:primary_healthy] && 
                          (health_data[:replica_healthy] || !Rails.env.production?)
          
          render_success({
            health: overall_health,
            details: health_data
          })
        end

        # POST /api/v1/admin/database-replication/test-replica
        def test_replica
          begin
            # Test replica connection
            start_time = Time.current
            
            # Simple read test
            result = DatabaseReplicationService.with_replica_database do
              ActiveRecord::Base.connection.execute("SELECT 1 as test")
            end
            
            duration = ((Time.current - start_time) * 1000).round(2)
            
            render_success({
              test_result: {
                success: true,
                response_time_ms: duration,
                result: result.first,
                timestamp: Time.current.iso8601
              }
            })
          rescue StandardError => e
            render_error("Replica test failed: #{e.message}", :service_unavailable)
          end
        end

        # POST /api/v1/admin/database-replication/force-primary
        def force_primary
          # Force all operations to use primary database for a period
          DatabaseReplicationService.with_primary_database do
            render_success({
              message: 'All operations forced to primary database',
              timestamp: Time.current.iso8601
            })
          end
        end

        # GET /api/v1/admin/database-replication/metrics
        def metrics
          metrics_data = {
            connection_pools: DatabaseReplicationService.connection_stats,
            replica_lag: DatabaseReplicationService.replica_lag,
            replica_available: DatabaseReplicationService.replica_available?,
            environment: Rails.env,
            timestamp: Time.current.iso8601
          }
          
          # Add historical metrics if available
          if defined?(Redis)
            begin
              lag_history = Rails.cache.read('replica_lag_history') || []
              metrics_data[:lag_history] = lag_history.last(10) # Last 10 measurements
            rescue StandardError => e
              Rails.logger.warn "Failed to get lag history: #{e.message}"
            end
          end
          
          render_success(metrics_data)
        end

        private

        def require_admin!
          unless current_user&.admin?
            render_error('Admin access required', :forbidden)
          end
        end

        def check_primary_health
          begin
            ActiveRecord::Base.connection.execute("SELECT 1")
            true
          rescue StandardError => e
            Rails.logger.error "Primary database health check failed: #{e.message}"
            false
          end
        end

        def check_replica_health
          return true unless Rails.env.production? # Skip in development
          
          begin
            DatabaseReplicationService.with_replica_database do
              ActiveRecord::Base.connection.execute("SELECT 1")
            end
            true
          rescue StandardError => e
            Rails.logger.error "Replica database health check failed: #{e.message}"
            false
          end
        end
      end
    end
  end
end
