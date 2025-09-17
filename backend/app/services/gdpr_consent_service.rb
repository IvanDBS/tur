# frozen_string_literal: true

# GDPR Consent Service
# Manages user consent for personal data processing
class GdprConsentService
  CONSENT_TYPES = {
    marketing: 'marketing_communications',
    analytics: 'analytics_tracking',
    personalization: 'personalized_content',
    data_sharing: 'data_sharing_with_partners'
  }.freeze

  class << self
    # Record user consent
    def record_consent(user, consent_type, granted, ip_address = nil)
      return false unless CONSENT_TYPES.key?(consent_type)
      
      consent_data = {
        user_id: user.id,
        consent_type: consent_type,
        granted: granted,
        ip_address: ip_address,
        timestamp: Time.current,
        version: current_consent_version
      }
      
      # Store in Redis with expiration
      key = "consent:#{user.id}:#{consent_type}"
      Rails.cache.write(key, consent_data, expires_in: 1.year)
      
      # Log consent change (anonymized)
      Rails.logger.info "Consent updated: #{consent_type} = #{granted} for user #{DataAnonymizationService.anonymize_user_id(user.id)}"
      
      true
    end

    # Check if user has given consent
    def has_consent?(user, consent_type)
      return false unless CONSENT_TYPES.key?(consent_type)
      
      key = "consent:#{user.id}:#{consent_type}"
      consent_data = Rails.cache.read(key)
      
      consent_data&.dig(:granted) == true
    end

    # Get all consents for user
    def get_user_consents(user)
      consents = {}
      
      CONSENT_TYPES.each_key do |consent_type|
        key = "consent:#{user.id}:#{consent_type}"
        consent_data = Rails.cache.read(key)
        
        if consent_data
          consents[consent_type] = {
            granted: consent_data[:granted],
            timestamp: consent_data[:timestamp],
            version: consent_data[:version]
          }
        end
      end
      
      consents
    end

    # Revoke all consents for user (GDPR right to withdraw)
    def revoke_all_consents(user)
      CONSENT_TYPES.each_key do |consent_type|
        key = "consent:#{user.id}:#{consent_type}"
        Rails.cache.delete(key)
      end
      
      Rails.logger.info "All consents revoked for user #{DataAnonymizationService.anonymize_user_id(user.id)}"
    end

    # Export user data (GDPR right to data portability)
    def export_user_data(user)
      {
        user_id: DataAnonymizationService.anonymize_user_id(user.id),
        email: DataAnonymizationService.anonymize_email(user.email),
        created_at: user.created_at,
        consents: get_user_consents(user),
        bookings_count: user.bookings.count,
        last_activity: user.updated_at
      }
    end

    # Delete user data (GDPR right to be forgotten)
    def delete_user_data(user)
      # Anonymize user data instead of hard delete
      user.update!(
        email: "deleted_user_#{user.id}@deleted.local",
        obs_user_id: "deleted_#{user.id}",
        obs_access_token: nil,
        obs_refresh_token: nil,
        obs_token_expires_at: nil
      )
      
      # Revoke all consents
      revoke_all_consents(user)
      
      # Anonymize bookings
      user.bookings.update_all(
        customer_data: { tourists: [], notes: {} }.to_json,
        notes: 'Data anonymized per GDPR request'
      )
      
      Rails.logger.info "User data anonymized for GDPR request: #{DataAnonymizationService.anonymize_user_id(user.id)}"
    end

    private

    def current_consent_version
      '1.0'
    end
  end
end
