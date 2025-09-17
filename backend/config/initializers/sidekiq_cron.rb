# Sidekiq Cron configuration for scheduled jobs
require 'sidekiq'
require 'sidekiq-cron'

# Configure cron-style scheduled jobs
if Rails.env.production? || Rails.env.development?
  Sidekiq::Cron::Job.load_from_hash({
    # Check OBS API health every 15 minutes
    'obs_health_check' => {
      'cron' => '*/15 * * * *',
      'class' => 'ObsHealthCheckJob',
      'description' => 'Check OBS API health and re-authenticate if needed every 15 minutes'
    },
    
    # Refresh availability every 30 minutes
    'refresh_availability' => {
      'cron' => '*/30 * * * *',
      'class' => 'RefreshAvailabilityJob',
      'description' => 'Refresh package availability from OBS API every 30 minutes'
    },
    
    # Monitor pending bookings every 3 minutes (more frequent for urgent bookings)
    'monitor_pending_bookings' => {
      'cron' => '*/3 * * * *',
      'class' => 'MonitorBookingJob',
      'description' => 'Monitor pending bookings and handle expiry/confirmation'
    },
    
    # Sync all active booking statuses every 30 minutes
    'sync_booking_statuses' => {
      'cron' => '*/30 * * * *',
      'class' => 'SyncBookingStatusesJob',
      'description' => 'Periodic synchronization of all active booking statuses'
    },
    
    # Import orders from OBS server every hour
    'sync_obs_orders' => {
      'cron' => '0 * * * *',
      'class' => 'SyncObsOrdersJob',
      'description' => 'Import orders from OBS server every hour'
    },
    
    # Sync reference data daily at 2 AM
    'sync_hotels_daily' => {
      'cron' => '0 2 * * *',
      'class' => 'SyncHotelsJob',
      'description' => 'Daily sync of hotels, cities and reference data'
    },
    
    # Sync cities weekly on Sunday at 3 AM
    'sync_cities_weekly' => {
      'cron' => '0 3 * * 0',
      'class' => 'SyncHotelsJob',
      'args' => ['cities'],
      'description' => 'Weekly sync of departure/arrival cities'
    },
    
    # System monitoring every 5 minutes
    'system_monitoring' => {
      'cron' => '*/5 * * * *',
      'class' => 'SystemMonitoringJob',
      'description' => 'System health monitoring every 5 minutes'
    },
    
    # Operator health monitoring every 10 minutes
    'operator_health_monitoring' => {
      'cron' => '*/10 * * * *',
      'class' => 'OperatorHealthMonitoringJob',
      'description' => 'Operator health monitoring every 10 minutes'
    },
    
    # Security cleanup every hour
    'security_cleanup' => {
      'cron' => '0 * * * *',
      'class' => 'SecurityCleanupJob',
      'description' => 'Security cleanup and maintenance every hour'
    },
    
    # Replica health monitoring every 5 minutes
    'replica_health_monitoring' => {
      'cron' => '*/5 * * * *',
      'class' => 'ReplicaHealthMonitoringJob',
      'description' => 'Monitor read replica health and performance every 5 minutes'
    }
  })
  
  Rails.logger.info "Loaded #{Sidekiq::Cron::Job.count} cron jobs"
  
  # Log all scheduled jobs
  Sidekiq::Cron::Job.all.each do |job|
    Rails.logger.info "Cron job: #{job.name} - #{job.cron} - #{job.description}"
  end
end
