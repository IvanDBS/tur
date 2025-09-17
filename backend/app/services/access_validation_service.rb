# frozen_string_literal: true

# Access Validation Service
# Provides comprehensive IDOR protection and resource access validation
class AccessValidationService
  class AccessDeniedError < StandardError; end
  class ResourceNotFoundError < StandardError; end

  class << self
    # Validate user access to a booking
    def validate_booking_access(user, booking_id)
      booking = find_booking_with_validation(booking_id)
      validate_booking_ownership(user, booking)
      booking
    end

    # Validate user access to a search query
    def validate_search_query_access(user, search_id)
      search_query = find_search_query_with_validation(search_id)
      validate_search_query_ownership(user, search_query)
      search_query
    end

    # Validate user access to any resource by type and ID
    def validate_resource_access(user, resource_type, resource_id)
      case resource_type.to_s
      when 'booking'
        validate_booking_access(user, resource_id)
      when 'search_query'
        validate_search_query_access(user, resource_id)
      else
        raise ArgumentError, "Unknown resource type: #{resource_type}"
      end
    end

    # Validate multiple resource access (for batch operations)
    def validate_multiple_resources_access(user, resource_type, resource_ids)
      resource_ids.map do |resource_id|
        validate_resource_access(user, resource_type, resource_id)
      end
    end

    # Check if user can perform action on resource
    def can_perform_action?(user, resource_type, resource_id, action)
      begin
        resource = validate_resource_access(user, resource_type, resource_id)
        check_action_permissions(user, resource, action)
      rescue AccessDeniedError, ResourceNotFoundError
        false
      end
    end

    # Generate secure resource token for temporary access
    def generate_resource_token(user, resource_type, resource_id, expires_in: 1.hour)
      payload = {
        user_id: user.id,
        resource_type: resource_type,
        resource_id: resource_id,
        exp: expires_in.from_now.to_i,
        iat: Time.current.to_i
      }
      
      JWT.encode(payload, Rails.application.credentials.secret_key_base)
    end

    # Validate resource token
    def validate_resource_token(token)
      decoded_token = JWT.decode(
        token,
        Rails.application.credentials.secret_key_base,
        true,
        { algorithm: 'HS256' }
      )
      
      payload = decoded_token[0]
      
      # Check expiration
      if Time.current.to_i > payload['exp']
        raise AccessDeniedError, 'Resource token expired'
      end
      
      payload
    rescue JWT::DecodeError, JWT::ExpiredSignature
      raise AccessDeniedError, 'Invalid resource token'
    end

    # Audit resource access for security monitoring
    def audit_resource_access(user, resource_type, resource_id, action, success)
      audit_data = {
        user_id: DataAnonymizationService.anonymize_user_id(user.id),
        resource_type: resource_type,
        resource_id: resource_id,
        action: action,
        success: success,
        timestamp: Time.current.iso8601,
        ip_address: DataAnonymizationService.anonymize_string(Thread.current[:request_ip] || 'unknown')
      }
      
      # Log access attempt
      if success
        Rails.logger.info "Resource access granted: #{audit_data}"
      else
        Rails.logger.warn "Resource access denied: #{audit_data}"
        
        # Send alert for repeated access violations
        track_access_violation(user, resource_type, resource_id, action)
      end
    end

    private

    def find_booking_with_validation(booking_id)
      booking = Booking.find_by(id: booking_id)
      raise ResourceNotFoundError, 'Booking not found' unless booking
      booking
    end

    def find_search_query_with_validation(search_id)
      search_query = SearchQuery.find_by(id: search_id)
      raise ResourceNotFoundError, 'Search query not found' unless search_query
      search_query
    end

    def validate_booking_ownership(user, booking)
      unless booking.user_id == user.id
        raise AccessDeniedError, 'Access denied: booking does not belong to user'
      end
    end

    def validate_search_query_ownership(user, search_query)
      unless search_query.user_id == user.id
        raise AccessDeniedError, 'Access denied: search query does not belong to user'
      end
    end

    def check_action_permissions(user, resource, action)
      case action.to_s
      when 'read'
        true # Basic read access is validated by ownership
      when 'update'
        # Additional business logic for update permissions
        case resource.class.name
        when 'Booking'
          resource.pending? || resource.processing?
        when 'SearchQuery'
          true
        else
          false
        end
      when 'delete'
        # Additional business logic for delete permissions
        case resource.class.name
        when 'Booking'
          resource.pending? || resource.cancelled?
        when 'SearchQuery'
          true
        else
          false
        end
      else
        false
      end
    end

    def track_access_violation(_user, resource_type, _resource_id, action)
      key = "access_violations:#{_user.id}:#{resource_type}:#{action}"
      violations = Rails.cache.read(key) || 0
      violations += 1
      
      Rails.cache.write(key, violations, expires_in: 1.hour)
      
      # Send alert if too many violations
      if violations >= 5
        AlertService.instance.warning("Multiple access violations detected", {
          user_id: DataAnonymizationService.anonymize_user_id(user.id),
          resource_type: resource_type,
          action: action,
          violations: violations
        })
      end
    end
  end
end
