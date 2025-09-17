# frozen_string_literal: true

# IP Blocking Service
# Manages IP blacklists and whitelists for security

class IpBlockingService
  BLACKLIST_KEY = 'blocked_ips'
  WHITELIST_KEY = 'whitelisted_ips'
  TEMPORARY_BLOCK_KEY = 'temporary_blocks'

  class << self
    # Block an IP address
    def block_ip(ip, reason: 'Manual block', duration: nil)
      block_data = {
        ip: ip,
        reason: reason,
        blocked_at: Time.current,
        duration: duration,
        expires_at: duration ? Time.current + duration : nil
      }
      
      Rails.cache.write("#{BLACKLIST_KEY}:#{ip}", block_data, expires_in: duration || 24.hours)
      
      Rails.logger.warn "IP blocked: #{ip} - Reason: #{reason}"
      
      # Send alert
      AlertService.instance.warning("IP blocked", block_data)
      
      block_data
    end

    # Unblock an IP address
    def unblock_ip(ip)
      Rails.cache.delete("#{BLACKLIST_KEY}:#{ip}")
      Rails.logger.info "IP unblocked: #{ip}"
    end

    # Check if IP is blocked
    def blocked?(ip)
      block_data = Rails.cache.read("#{BLACKLIST_KEY}:#{ip}")
      
      if block_data
        # Check if temporary block has expired
        if block_data[:expires_at] && Time.current > block_data[:expires_at]
          unblock_ip(ip)
          return false
        end
        return true
      end
      
      false
    end

    # Get block information for IP
    def block_info(ip)
      Rails.cache.read("#{BLACKLIST_KEY}:#{ip}")
    end

    # Whitelist an IP address
    def whitelist_ip(ip, reason: 'Manual whitelist')
      whitelist_data = {
        ip: ip,
        reason: reason,
        whitelisted_at: Time.current
      }
      
      Rails.cache.write("#{WHITELIST_KEY}:#{ip}", whitelist_data, expires_in: 30.days)
      Rails.logger.info "IP whitelisted: #{ip} - Reason: #{reason}"
    end

    # Remove IP from whitelist
    def remove_from_whitelist(ip)
      Rails.cache.delete("#{WHITELIST_KEY}:#{ip}")
      Rails.logger.info "IP removed from whitelist: #{ip}"
    end

    # Check if IP is whitelisted
    def whitelisted?(ip)
      Rails.cache.exist?("#{WHITELIST_KEY}:#{ip}")
    end

    # Get all blocked IPs
    def blocked_ips
      keys = Rails.cache.redis.keys("#{BLACKLIST_KEY}:*")
      keys.map do |key|
        ip = key.split(':').last
        {
          ip: ip,
          info: block_info(ip)
        }
      end
    end

    # Get all whitelisted IPs
    def whitelisted_ips
      keys = Rails.cache.redis.keys("#{WHITELIST_KEY}:*")
      keys.map do |key|
        ip = key.split(':').last
        {
          ip: ip,
          info: Rails.cache.read("#{WHITELIST_KEY}:#{ip}")
        }
      end
    end

    # Auto-block IP based on failed attempts
    def auto_block_ip(ip, attempts_count)
      if attempts_count > 20
        block_ip(ip, 
          reason: "Auto-blocked after #{attempts_count} failed attempts",
          duration: 24.hours
        )
        return true
      end
      false
    end

    # Clean up expired blocks
    def cleanup_expired_blocks
      blocked_ips.each do |block_data|
        ip = block_data[:ip]
        info = block_data[:info]
        
        if info && info[:expires_at] && Time.current > info[:expires_at]
          unblock_ip(ip)
        end
      end
    end

    # Get blocking statistics
    def statistics
      {
        blocked_count: blocked_ips.count,
        whitelisted_count: whitelisted_ips.count,
        recent_blocks: blocked_ips.select do |block|
          block[:info] && block[:info][:blocked_at] > 1.hour.ago
        end.count
      }
    end
  end
end
