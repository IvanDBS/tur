# Base class for all application jobs
class ApplicationJob < ActiveJob::Base
  # Automatically retry jobs that encountered a deadlock
  retry_on ActiveRecord::Deadlocked

  # Most jobs are safe to ignore if the underlying records are no longer available
  discard_on ActiveJob::DeserializationError

  # Discard jobs that fail due to OBS API rate limiting
  discard_on ObsApiService::RateLimitError

  # Log job execution
  around_perform do |job, block|
    Rails.logger.info "Starting job: #{job.class.name} with arguments: #{job.arguments.inspect}"
    start_time = Time.current

    block.call

    duration = Time.current - start_time
    Rails.logger.info "Completed job: #{job.class.name} in #{duration.round(2)}s"
  rescue StandardError => e
    Rails.logger.error "Job failed: #{job.class.name} - #{e.message}"
    raise
  end
end
