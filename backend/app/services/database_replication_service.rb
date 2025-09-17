# frozen_string_literal: true

# Database Replication Service
# Manages read/write splitting and replica health monitoring
class DatabaseReplicationService
  include Singleton

  # Operations that should use read replicas
  READ_OPERATIONS = %w[
    SELECT
    SHOW
    EXPLAIN
    DESCRIBE
    WITH
  ].freeze

  # Operations that must use primary database
  WRITE_OPERATIONS = %w[
    INSERT
    UPDATE
    DELETE
    CREATE
    DROP
    ALTER
    TRUNCATE
    GRANT
    REVOKE
  ].freeze

  # Operations that should use primary for consistency
  CONSISTENCY_OPERATIONS = %w[
    BEGIN
    COMMIT
    ROLLBACK
    SAVEPOINT
    RELEASE
    LOCK
    UNLOCK
  ].freeze

  class << self
    # Determine if operation should use replica
    def should_use_replica?(sql)
      return false unless replica_available?
      return false if in_transaction?
      
      sql = sql.to_s.strip.upcase
      
      # Check for write operations
      return false if WRITE_OPERATIONS.any? { |op| sql.start_with?(op) }
      
      # Check for consistency operations
      return false if CONSISTENCY_OPERATIONS.any? { |op| sql.start_with?(op) }
      
      # Use replica for read operations
      READ_OPERATIONS.any? { |op| sql.start_with?(op) }
    end

    # Get appropriate database connection
    def get_connection(force_primary: false)
      if force_primary || !should_use_replica_for_current_operation?
        primary_connection
      else
        replica_connection
      end
    end

    # Check if replica is available and healthy
    def replica_available?
      return false unless Rails.env.production?
      return false unless replica_connection
      
      begin
        # Quick health check
        replica_connection.execute("SELECT 1")
        true
      rescue StandardError => e
        Rails.logger.warn "Replica health check failed: #{e.message}"
        false
      end
    end

    # Get replica lag information
    def replica_lag
      return nil unless replica_available?
      
      begin
        # PostgreSQL specific lag check
        result = replica_connection.execute(
          "SELECT EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp())) as lag_seconds"
        )
        
        lag_seconds = result.first&.dig('lag_seconds')
        lag_seconds&.to_f
      rescue StandardError => e
        Rails.logger.error "Failed to get replica lag: #{e.message}"
        nil
      end
    end

    # Monitor replica health
    def monitor_replica_health
      return unless Rails.env.production?
      
      lag = replica_lag
      
      if lag.nil?
        AlertService.instance.warning("Replica health check failed", {
          timestamp: Time.current.iso8601
        })
      elsif lag > 30 # More than 30 seconds lag
        AlertService.instance.warning("High replica lag detected", {
          lag_seconds: lag,
          timestamp: Time.current.iso8601
        })
      end
    end

    # Force primary database for critical operations
    def with_primary_database(&_block)
      original_force_primary = Thread.current[:force_primary_db]
      Thread.current[:force_primary_db] = true
      
      yield
    ensure
      Thread.current[:force_primary_db] = original_force_primary
    end

    # Force replica database for read operations
    def with_replica_database(&_block)
      return yield unless replica_available?
      
      original_force_replica = Thread.current[:force_replica_db]
      Thread.current[:force_replica_db] = true
      
      yield
    ensure
      Thread.current[:force_replica_db] = original_force_replica
    end

    # Get database connection statistics
    def connection_stats
      {
        primary: {
          pool_size: primary_connection.pool.size,
          checked_out: primary_connection.pool.checked_out.size,
          available: primary_connection.pool.available.size
        },
        replica: replica_available? ? {
          pool_size: replica_connection.pool.size,
          checked_out: replica_connection.pool.checked_out.size,
          available: replica_connection.pool.available.size
        } : nil,
        replica_lag: replica_lag,
        replica_healthy: replica_available?
      }
    end

    private

    def primary_connection
      ActiveRecord::Base.connection
    end

    def replica_connection
      return nil unless Rails.env.production?
      
      @replica_connection ||= begin
        config = Rails.application.config.database_configuration['production']['replica']
        next nil unless config
        
        ActiveRecord::Base.establish_connection(config)
        ActiveRecord::Base.connection
      rescue StandardError => e
        Rails.logger.error "Failed to establish replica connection: #{e.message}"
        nil
      end
    end

    def should_use_replica_for_current_operation?
      return false if Thread.current[:force_primary_db]
      return true if Thread.current[:force_replica_db]
      
      # Check current SQL if available
      current_sql = Thread.current[:current_sql]
      return false unless current_sql
      
      should_use_replica?(current_sql)
    end

    def in_transaction?
      ActiveRecord::Base.connection.transaction_open?
    end
  end
end
