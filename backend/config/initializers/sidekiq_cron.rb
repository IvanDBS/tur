# Sidekiq Cron configuration for scheduled jobs
require 'sidekiq'
require 'sidekiq-cron'

# Configure cron-style scheduled jobs
if Rails.env.production? || Rails.env.development?
  Sidekiq::Cron::Job.load_from_hash({
    # Refresh availability every 30 minutes
    'refresh_availability' => {
      'cron' => '*/30 * * * *',
      'class' => 'RefreshAvailabilityJob',
      'description' => 'Refresh package availability from OBS API every 30 minutes'
    },
    
    # Monitor bookings every 5 minutes
    'monitor_bookings' => {
      'cron' => '*/5 * * * *',
      'class' => 'MonitorBookingJob',
      'description' => 'Monitor pending bookings and handle expiry/confirmation'
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
    }
  })
  
  Rails.logger.info "Loaded #{Sidekiq::Cron::Job.count} cron jobs"
  
  # Log all scheduled jobs
  Sidekiq::Cron::Job.all.each do |job|
    Rails.logger.info "Cron job: #{job.name} - #{job.cron} - #{job.description}"
  end
end
