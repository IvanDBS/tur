# frozen_string_literal: true

# Admin controller for IP management and security monitoring
module Api
  module V1
    module Admin
      class IpManagementController < Api::V1::BaseController
        before_action :authenticate_user!
        before_action :ensure_admin!

        # GET /api/v1/admin/ip-management/blocked
        def blocked_ips
          blocked_ips = IpBlockingService.blocked_ips
          
          render_success({
            blocked_ips: blocked_ips,
            count: blocked_ips.count
          })
        end

        # GET /api/v1/admin/ip-management/whitelisted
        def whitelisted_ips
          whitelisted_ips = IpBlockingService.whitelisted_ips
          
          render_success({
            whitelisted_ips: whitelisted_ips,
            count: whitelisted_ips.count
          })
        end

        # POST /api/v1/admin/ip-management/block
        def block_ip
          ip = params[:ip]
          reason = params[:reason] || 'Manual block'
          duration = params[:duration] ? params[:duration].to_i.hours : nil

          if ip.blank?
            return render_error('IP address is required', :bad_request)
          end

          # Validate IP format
          unless valid_ip?(ip)
            return render_error('Invalid IP address format', :bad_request)
          end

          block_data = IpBlockingService.block_ip(ip, reason: reason, duration: duration)
          
          render_success({
            message: "IP #{ip} has been blocked",
            block_data: block_data
          })
        end

        # DELETE /api/v1/admin/ip-management/unblock/:ip
        def unblock_ip
          ip = params[:ip]

          if ip.blank?
            return render_error('IP address is required', :bad_request)
          end

          IpBlockingService.unblock_ip(ip)
          
          render_success({
            message: "IP #{ip} has been unblocked"
          })
        end

        # POST /api/v1/admin/ip-management/whitelist
        def whitelist_ip
          ip = params[:ip]
          reason = params[:reason] || 'Manual whitelist'

          if ip.blank?
            return render_error('IP address is required', :bad_request)
          end

          # Validate IP format
          unless valid_ip?(ip)
            return render_error('Invalid IP address format', :bad_request)
          end

          IpBlockingService.whitelist_ip(ip, reason: reason)
          
          render_success({
            message: "IP #{ip} has been whitelisted"
          })
        end

        # DELETE /api/v1/admin/ip-management/remove-whitelist/:ip
        def remove_whitelist
          ip = params[:ip]

          if ip.blank?
            return render_error('IP address is required', :bad_request)
          end

          IpBlockingService.remove_from_whitelist(ip)
          
          render_success({
            message: "IP #{ip} has been removed from whitelist"
          })
        end

        # GET /api/v1/admin/ip-management/statistics
        def statistics
          stats = IpBlockingService.statistics
          
          # Add additional security statistics
          security_stats = {
            rate_limiting_stats: get_rate_limiting_stats,
            failed_attempts_stats: get_failed_attempts_stats,
            ddos_protection_stats: get_ddos_protection_stats
          }
          
          render_success({
            ip_management: stats,
            security: security_stats
          })
        end

        # POST /api/v1/admin/ip-management/cleanup
        def cleanup_expired
          IpBlockingService.cleanup_expired_blocks
          
          render_success({
            message: "Expired blocks have been cleaned up"
          })
        end

        private

        def ensure_admin!
          unless current_user&.admin?
            render_error('Admin access required', :forbidden)
          end
        end

        def valid_ip?(ip)
          # Basic IP validation
          ip.match?(/\A(\d{1,3}\.){3}\d{1,3}\z/) || ip.match?(/\A([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\z/)
        end

        def get_rate_limiting_stats
          # Get rate limiting statistics from Redis
          {
            active_throttles: Rails.cache.redis.keys('rack::attack:*').count,
            blocked_requests_today: Rails.cache.redis.keys('rack::attack:blocked:*').count
          }
        end

        def get_failed_attempts_stats
          # Get failed authentication attempts statistics
          brute_force_keys = Rails.cache.redis.keys('brute_force_attempts:*')
          {
            active_brute_force_ips: brute_force_keys.count,
            total_failed_attempts: brute_force_keys.sum { |key| Rails.cache.read(key) || 0 }
          }
        end

        def get_ddos_protection_stats
          # Get DDOS protection statistics
          {
            ddos_throttles: Rails.cache.redis.keys('rack::attack:ddos:*').count,
            large_requests_blocked: Rails.cache.redis.keys('rack::attack:block-large-requests:*').count
          }
        end
      end
    end
  end
end
