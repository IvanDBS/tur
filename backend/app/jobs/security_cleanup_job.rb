# frozen_string_literal: true

# Security Cleanup Job
# Automatically cleans up expired blocks and maintains security data

class SecurityCleanupJob < ApplicationJob
  queue_as :default

  def perform
    Rails.logger.info "Starting security cleanup job"
    
    # Clean up expired IP blocks
    cleanup_expired_blocks
    
    # Clean up old brute force attempt records
    cleanup_old_brute_force_records
    
    # Clean up old rate limiting records
    cleanup_old_rate_limiting_records
    
    # Generate security report
    generate_security_report
    
    Rails.logger.info "Security cleanup job completed"
  end

  private

  def cleanup_expired_blocks
    IpBlockingService.cleanup_expired_blocks
    Rails.logger.info "Expired IP blocks cleaned up"
  end

  def cleanup_old_brute_force_records
    # Clean up brute force attempt records older than 24 hours
    brute_force_keys = Rails.cache.redis.keys('brute_force_attempts:*')
    brute_force_email_keys = Rails.cache.redis.keys('brute_force_email_attempts:*')
    
    cleaned_count = 0
    
    (brute_force_keys + brute_force_email_keys).each do |key|
      # Check if record is older than 24 hours
      if Rails.cache.redis.ttl(key) < 0
        Rails.cache.delete(key)
        cleaned_count += 1
      end
    end
    
    Rails.logger.info "Cleaned up #{cleaned_count} old brute force records"
  end

  def cleanup_old_rate_limiting_records
    # Clean up old rate limiting records
    rate_limit_keys = Rails.cache.redis.keys('rack::attack:*')
    
    cleaned_count = 0
    rate_limit_keys.each do |key|
      # Clean up records older than 1 hour
      if Rails.cache.redis.ttl(key) < 0
        Rails.cache.delete(key)
        cleaned_count += 1
      end
    end
    
    Rails.logger.info "Cleaned up #{cleaned_count} old rate limiting records"
  end

  def generate_security_report
    stats = IpBlockingService.statistics
    
    # Send daily security report if there are blocked IPs
    if stats[:blocked_count] > 0
      AlertService.instance.info("Daily Security Report", {
        blocked_ips: stats[:blocked_count],
        whitelisted_ips: stats[:whitelisted_count],
        recent_blocks: stats[:recent_blocks],
        timestamp: Time.current
      })
    end
  end
end
