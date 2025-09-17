# frozen_string_literal: true

# Database Replication Middleware
# Automatically routes read operations to replica database
class DatabaseReplicationMiddleware
  def initialize(app)
    @app = app
  end

  def call(env)
    request = Rack::Request.new(env)
    
    # Determine if this is a read-only request
    if read_only_request?(request)
      DatabaseReplicationService.with_replica_database do
        @app.call(env)
      end
    else
      # Use primary database for write operations
      @app.call(env)
    end
  end

  private

  def read_only_request?(request)
    # GET requests are typically read-only
    return true if request.get?
    
    # Specific read-only endpoints
    read_only_paths = [
      '/api/v1/health',
      '/api/v1/search',
      '/api/v1/bookings', # GET requests only
      '/api/v1/operators',
      '/api/v1/admin/stats',
      '/api/v1/gdpr/consents',
      '/api/v1/gdpr/export-data',
      '/api/v1/gdpr/data-usage'
    ]
    
    read_only_paths.any? { |path| request.path.start_with?(path) }
  end
end
