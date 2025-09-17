# frozen_string_literal: true

# IDOR Protection Concern
# Provides methods for protecting against Insecure Direct Object Reference attacks
module IdorProtection
  extend ActiveSupport::Concern

  included do
    # Set request IP for audit logging
    before_action :set_request_ip_for_audit
  end

  private

  # Validate user access to a resource
  def validate_resource_access!(resource_type, resource_id, action = 'read')
    begin
      resource = AccessValidationService.validate_resource_access(
        current_user, 
        resource_type, 
        resource_id
      )
      
      # Check action permissions
      unless AccessValidationService.can_perform_action?(
        current_user, 
        resource_type, 
        resource_id, 
        action
      )
        AccessValidationService.audit_resource_access(
          current_user, 
          resource_type, 
          resource_id, 
          action, 
          false
        )
        raise AccessValidationService::AccessDeniedError, 
              "Action '#{action}' not allowed on this resource"
      end
      
      # Audit successful access
      AccessValidationService.audit_resource_access(
        current_user, 
        resource_type, 
        resource_id, 
        action, 
        true
      )
      
      resource
    rescue AccessValidationService::AccessDeniedError => e
      Rails.logger.warn "IDOR protection: #{e.message} for user #{current_user.id}"
      render_error(e.message, :forbidden)
      nil
    rescue AccessValidationService::ResourceNotFoundError => e
      Rails.logger.warn "IDOR protection: #{e.message} for user #{current_user.id}"
      render_error(e.message, :not_found)
      nil
    end
  end

  # Validate multiple resources access
  def validate_multiple_resources_access!(resource_type, resource_ids, action = 'read')
    begin
      resources = AccessValidationService.validate_multiple_resources_access(
        current_user, 
        resource_type, 
        resource_ids
      )
      
      # Check action permissions for each resource
      resources.each_with_index do |_resource, index|
        unless AccessValidationService.can_perform_action?(
          current_user, 
          resource_type, 
          resource_ids[index], 
          action
        )
          AccessValidationService.audit_resource_access(
            current_user, 
            resource_type, 
            resource_ids[index], 
            action, 
            false
          )
          raise AccessValidationService::AccessDeniedError, 
                "Action '#{action}' not allowed on resource #{resource_ids[index]}"
        end
        
        # Audit successful access
        AccessValidationService.audit_resource_access(
          current_user, 
          resource_type, 
          resource_ids[index], 
          action, 
          true
        )
      end
      
      resources
    rescue AccessValidationService::AccessDeniedError => e
      Rails.logger.warn "IDOR protection: #{e.message} for user #{current_user.id}"
      render_error(e.message, :forbidden)
      nil
    rescue AccessValidationService::ResourceNotFoundError => e
      Rails.logger.warn "IDOR protection: #{e.message} for user #{current_user.id}"
      render_error(e.message, :not_found)
      nil
    end
  end

  # Generate secure resource token
  def generate_resource_token(resource_type, resource_id, expires_in: 1.hour)
    AccessValidationService.generate_resource_token(
      current_user, 
      resource_type, 
      resource_id, 
      expires_in: expires_in
    )
  end

  # Validate resource token
  def validate_resource_token!(token)
    AccessValidationService.validate_resource_token(token)
  rescue AccessValidationService::AccessDeniedError => e
    Rails.logger.warn "Invalid resource token: #{e.message}"
    render_error('Invalid or expired resource token', :unauthorized)
    nil
  end

  # Enhanced parameter validation with IDOR protection
  def validate_secure_params!(params_hash, required_fields = [])
    # Check for suspicious parameter patterns
    suspicious_patterns = [
      /\.\./,  # Path traversal
      /<script/i,  # XSS attempts
      /union\s+select/i,  # SQL injection
      /javascript:/i,  # JavaScript injection
    ]
    
    params_hash.each do |key, value|
      next unless value.is_a?(String)
      
      suspicious_patterns.each do |pattern|
        if value.match?(pattern)
          Rails.logger.warn "Suspicious parameter detected: #{key} = #{value[0..50]}"
          render_error('Invalid parameter format', :bad_request)
          return false
        end
      end
    end
    
    # Validate required fields
    missing_fields = required_fields - params_hash.keys
    if missing_fields.any?
      render_error("Missing required fields: #{missing_fields.join(', ')}", :bad_request)
      return false
    end
    
    true
  end

  # Set request IP for audit logging
  def set_request_ip_for_audit
    Thread.current[:request_ip] = request.remote_ip
  end

  # Enhanced error handling for IDOR protection
  def handle_idor_error(error)
    case error
    when AccessValidationService::AccessDeniedError
      Rails.logger.warn "IDOR protection triggered: #{error.message}"
      render_error('Access denied', :forbidden)
    when AccessValidationService::ResourceNotFoundError
      Rails.logger.warn "Resource not found: #{error.message}"
      render_error('Resource not found', :not_found)
    else
      Rails.logger.error "Unexpected IDOR protection error: #{error.message}"
      render_error('Internal server error', :internal_server_error)
    end
  end
end
