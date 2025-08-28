# Service for managing background job scheduling
class JobSchedulerService
  class << self
    # Schedule availability refresh for specific package
    def refresh_package_availability(package_id, delay: 0)
      if delay > 0
        RefreshAvailabilityJob.set(wait: delay).perform_later(package_id)
      else
        RefreshAvailabilityJob.perform_later(package_id)
      end
    end
    
    # Schedule availability refresh for all packages
    def refresh_all_availability(delay: 0)
      if delay > 0
        RefreshAvailabilityJob.set(wait: delay).perform_later
      else
        RefreshAvailabilityJob.perform_later
      end
    end
    
    # Schedule booking monitoring for specific booking
    def monitor_booking(booking_id, delay: 0)
      if delay > 0
        MonitorBookingJob.set(wait: delay).perform_later(booking_id)
      else
        MonitorBookingJob.perform_later(booking_id)
      end
    end
    
    # Schedule booking monitoring for all pending bookings
    def monitor_all_bookings(delay: 0)
      if delay > 0
        MonitorBookingJob.set(wait: delay).perform_later
      else
        MonitorBookingJob.perform_later
      end
    end
    
    # Schedule reference data sync
    def sync_reference_data(type = 'all', delay: 0)
      if delay > 0
        SyncHotelsJob.set(wait: delay).perform_later(type)
      else
        SyncHotelsJob.perform_later(type)
      end
    end
    
    # Schedule immediate monitoring after booking
    def monitor_after_booking(booking)
      # Monitor the new booking
      monitor_booking(booking.id, delay: 2.minutes)
    end
    
    # Schedule jobs for new package
    def setup_new_package(package_id)
      # Initial availability refresh
      refresh_package_availability(package_id, delay: 30.seconds)
      
      Rails.logger.info "Scheduled initial jobs for package #{package_id}"
    end
    
    # Emergency job cancellation
    def cancel_all_jobs_for_package(package_id)
      # This would require additional Sidekiq setup to track jobs by package
      Rails.logger.warn "Emergency cancellation requested for package #{package_id}"
      
      # In production, you might want to implement job tracking
      # and selective cancellation here
    end
    
    # Get job statistics
    def job_stats
      {
        scheduled: Sidekiq::ScheduledSet.new.size,
        retry: Sidekiq::RetrySet.new.size,
        dead: Sidekiq::DeadSet.new.size,
        processed: Sidekiq::Stats.new.processed,
        failed: Sidekiq::Stats.new.failed,
        cron_jobs: defined?(Sidekiq::Cron::Job) ? Sidekiq::Cron::Job.count : 0
      }
    end
    
    # Health check for job system
    def healthy?
      stats = job_stats
      
      # Consider unhealthy if too many jobs are failing
      failure_rate = stats[:failed].to_f / (stats[:processed] + 1)
      return false if failure_rate > 0.1 # More than 10% failure rate
      
      # Consider unhealthy if retry queue is too large
      return false if stats[:retry] > 100
      
      # Consider unhealthy if dead queue is too large
      return false if stats[:dead] > 50
      
      true
    end
  end
end
