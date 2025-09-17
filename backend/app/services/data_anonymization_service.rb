# frozen_string_literal: true

# Data Anonymization Service for GDPR Compliance
# Handles anonymization of personal data in logs and responses
class DataAnonymizationService
  # Personal data patterns to anonymize
  PERSONAL_DATA_PATTERNS = {
    # Email addresses
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
    
    # Phone numbers (various formats)
    phone: /(\+?[0-9]{1,3}[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/,
    
    # Passport numbers (common formats)
    passport: /\b[A-Z]{1,2}[0-9]{6,9}\b/,
    
    # Credit card numbers (basic pattern)
    credit_card: /\b[0-9]{4}[\s-]?[0-9]{4}[\s-]?[0-9]{4}[\s-]?[0-9]{4}\b/,
    
    # Names (basic pattern - first and last name)
    name: /\b[A-Z][a-z]+ [A-Z][a-z]+\b/,
    
    # IP addresses
    ip_address: /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/,
    
    # User IDs (UUIDs and numeric IDs)
    user_id: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b|\buser_id["\s]*:["\s]*[0-9]+\b/
  }.freeze

  # Fields that should be completely removed from logs
  SENSITIVE_FIELDS = %w[
    password password_confirmation
    access_token refresh_token
    credit_card_number cvv
    passport_number fiscal_code
    birth_date
  ].freeze

  class << self
    # Anonymize personal data in a string
    def anonymize_string(text)
      return text unless text.is_a?(String)
      
      result = text.dup
      
      PERSONAL_DATA_PATTERNS.each do |type, pattern|
        result = result.gsub(pattern, anonymize_replacement(type))
      end
      
      result
    end

    # Anonymize personal data in a hash/object
    def anonymize_data(data)
      case data
      when Hash
        anonymize_hash(data)
      when Array
        data.map { |item| anonymize_data(item) }
      when String
        anonymize_string(data)
      else
        data
      end
    end

    # Anonymize log entry
    def anonymize_log_entry(log_data)
      return log_data unless log_data.is_a?(Hash)
      
      anonymized = log_data.dup
      
      # Remove sensitive fields completely
      SENSITIVE_FIELDS.each do |field|
        anonymized.delete(field)
        anonymized.delete(field.to_sym)
      end
      
      # Anonymize remaining data
      anonymize_data(anonymized)
    end

    # Check if data contains personal information
    def contains_personal_data?(text)
      return false unless text.is_a?(String)
      
      PERSONAL_DATA_PATTERNS.any? { |_, pattern| text.match?(pattern) }
    end

    # Generate anonymized user identifier for logs
    def anonymize_user_id(user_id)
      return nil unless user_id
      
      # Create a consistent but anonymized identifier
      Digest::SHA256.hexdigest("user_#{user_id}_#{Rails.application.credentials.secret_key_base}")[0..8]
    end

    # Anonymize email for logs
    def anonymize_email(email)
      return nil unless email&.include?('@')
      
      local, domain = email.split('@', 2)
      "#{local[0..2]}***@#{domain}"
    end

    private

    def anonymize_hash(hash)
      hash.transform_values { |value| anonymize_data(value) }
    end

    def anonymize_replacement(type)
      case type
      when :email
        '***@***.***'
      when :phone
        '***-***-****'
      when :passport
        '***-******'
      when :credit_card
        '****-****-****-****'
      when :name
        '*** ***'
      when :ip_address
        '***.***.***.***'
      when :user_id
        'user_***'
      else
        '***'
      end
    end
  end
end
