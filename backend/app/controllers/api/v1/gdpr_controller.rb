# frozen_string_literal: true

# GDPR Controller for handling data protection requests
module Api
  module V1
    class GdprController < Api::V1::BaseController
      before_action :authenticate_user!

      # GET /api/v1/gdpr/consents
      # Get user's current consent status
      def consents
        user_consents = GdprConsentService.get_user_consents(current_user)
        
        render_success({
          consents: user_consents,
          consent_types: GdprConsentService::CONSENT_TYPES
        })
      end

      # POST /api/v1/gdpr/consents
      # Update user consent
      def update_consent
        consent_type = params[:consent_type]&.to_sym
        granted = params[:granted]
        
        unless GdprConsentService::CONSENT_TYPES.key?(consent_type)
          return render_error('Invalid consent type', :bad_request)
        end
        
        unless [true, false].include?(granted)
          return render_error('Granted must be true or false', :bad_request)
        end
        
        success = GdprConsentService.record_consent(
          current_user, 
          consent_type, 
          granted, 
          request.remote_ip
        )
        
        if success
          render_success({ message: 'Consent updated successfully' })
        else
          render_error('Failed to update consent', :unprocessable_entity)
        end
      end

      # POST /api/v1/gdpr/revoke-consents
      # Revoke all consents (GDPR right to withdraw)
      def revoke_consents
        GdprConsentService.revoke_all_consents(current_user)
        
        render_success({ message: 'All consents revoked successfully' })
      end

      # GET /api/v1/gdpr/export-data
      # Export user data (GDPR right to data portability)
      def export_data
        user_data = GdprConsentService.export_user_data(current_user)
        
        render_success({
          user_data: user_data,
          exported_at: Time.current.iso8601
        })
      end

      # DELETE /api/v1/gdpr/delete-data
      # Delete user data (GDPR right to be forgotten)
      def delete_data
        # Require confirmation
        unless params[:confirm] == 'DELETE_MY_DATA'
          return render_error('Confirmation required. Send confirm: "DELETE_MY_DATA"', :bad_request)
        end
        
        GdprConsentService.delete_user_data(current_user)
        
        render_success({ 
          message: 'User data has been anonymized successfully',
          note: 'Your account has been anonymized but not deleted to maintain system integrity'
        })
      end

      # GET /api/v1/gdpr/data-usage
      # Get information about how user data is used
      def data_usage
        data_usage_info = {
          data_collected: [
            'Email address (for authentication)',
            'Booking information (for tour reservations)',
            'IP address (for security and analytics)',
            'User agent (for technical support)'
          ],
          data_usage: [
            'Process tour bookings and reservations',
            'Send booking confirmations and updates',
            'Provide customer support',
            'Improve service quality and security'
          ],
          data_sharing: [
            'Shared with tour operators (OBS) for booking processing',
            'Not shared with third parties for marketing purposes'
          ],
          data_retention: [
            'Booking data: 7 years (legal requirement)',
            'Account data: Until account deletion',
            'Logs: 1 year (anonymized)'
          ],
          user_rights: [
            'Right to access your data',
            'Right to correct inaccurate data',
            'Right to delete your data',
            'Right to data portability',
            'Right to withdraw consent'
          ]
        }
        
        render_success(data_usage_info)
      end
    end
  end
end
