# Webhook controller for receiving status updates from external operators
module Api
  module V1
    class WebhookController < Api::V1::BaseController
      # No authentication required for webhook endpoints (we'll use webhook secret instead)

      # POST /api/v1/webhook/obs
      def obs_webhook
        begin
          # Verify webhook signature for security
          unless verify_obs_webhook_signature
            Rails.logger.warn "Invalid webhook signature from IP: #{request.remote_ip}"
            render_error('Invalid webhook signature', :unauthorized)
            return
          end

          # Parse webhook payload
          webhook_data = parse_webhook_payload
          unless webhook_data
            Rails.logger.error "Failed to parse webhook payload"
            render_error('Invalid webhook payload', :bad_request)
            return
          end

          # Process webhook data
          process_obs_webhook(webhook_data)

          # Log successful webhook processing
          Rails.logger.info "Successfully processed OBS webhook: #{webhook_data.inspect}"
          
          render_success({ message: 'Webhook processed successfully' })
          
        rescue StandardError => e
          Rails.logger.error "Error processing OBS webhook: #{e.message}"
          Rails.logger.error e.backtrace.join("\n")
          render_error('Internal server error', :internal_server_error)
        end
      end

      private

      def verify_obs_webhook_signature
        # Get webhook secret from environment
        webhook_secret = ENV['OBS_WEBHOOK_SECRET']
        return false if webhook_secret.blank?

        # Get signature from headers
        signature = request.headers['X-OBS-Signature'] || request.headers['X-Hub-Signature-256']
        return false if signature.blank?

        # Calculate expected signature
        expected_signature = "sha256=#{OpenSSL::HMAC.hexdigest('SHA256', webhook_secret, request.body.read)}"
        
        # Reset body for further processing
        request.body.rewind
        
        # Compare signatures securely
        ActiveSupport::SecurityUtils.secure_compare(signature, expected_signature)
      rescue StandardError => e
        Rails.logger.error "Error verifying webhook signature: #{e.message}"
        false
      end

      def parse_webhook_payload
        # Parse JSON payload
        payload = JSON.parse(request.body.read)
        
        # Validate required fields
        unless payload.is_a?(Hash) && payload['order_id'].present?
          Rails.logger.error "Invalid webhook payload structure: #{payload.inspect}"
          return nil
        end

        payload
      rescue JSON::ParserError => e
        Rails.logger.error "Failed to parse webhook JSON: #{e.message}"
        nil
      end

      def process_obs_webhook(webhook_data)
        # Extract booking identifier from webhook
        obs_booking_hash = webhook_data['order_id'] || webhook_data['booking_hash']
        
        unless obs_booking_hash.present?
          Rails.logger.error "No booking identifier found in webhook: #{webhook_data.inspect}"
          return
        end

        # Find booking by OBS booking hash
        booking = Booking.find_by(obs_booking_hash: obs_booking_hash)
        
        unless booking
          Rails.logger.warn "Booking not found for OBS hash: #{obs_booking_hash}"
          return
        end

        # Log webhook processing
        Rails.logger.info "Processing webhook for booking #{booking.id} (OBS hash: #{obs_booking_hash})"

        # Trigger immediate status check for this specific booking
        # This will use the existing MonitorBookingJob logic
        MonitorBookingJob.perform_later(booking.id)

        # Also update booking with webhook data if it contains status info
        if webhook_data['status'].present?
          update_booking_from_webhook(booking, webhook_data)
        end
      end

      def update_booking_from_webhook(booking, webhook_data)
        # Extract status from webhook
        obs_status = webhook_data['status']
        new_internal_status = booking.map_obs_status(obs_status)

        # Prepare updates
        updates = {
          operator_status: obs_status,
          last_synced_at: Time.current
        }

        # Update internal status if changed
        if booking.status != new_internal_status
          updates[:status] = new_internal_status
          
          # Set status-specific timestamps
          case new_internal_status
          when 'confirmed'
            updates[:confirmed_at] = Time.current
          when 'cancelled'
            updates[:cancelled_at] = Time.current
          end
        end

        # Check for tour details changes (including flights)
        if webhook_data['tour_details'] && webhook_data['tour_details'] != booking.tour_details
          old_tour_details = booking.tour_details
          updates[:tour_details] = webhook_data['tour_details']
          
          # Log flight changes specifically
          log_flight_changes_from_webhook(booking, old_tour_details, webhook_data['tour_details'])
        end

        # Check for flight-specific changes
        if webhook_data['flight_changes']
          handle_flight_changes_from_webhook(booking, webhook_data['flight_changes'])
        end

        # Update booking if there are changes
        if updates.any?
          booking.update!(updates)
          Rails.logger.info "Updated booking #{booking.id} from webhook: status=#{new_internal_status}, obs_status=#{obs_status}"
        end
      end

      def log_flight_changes_from_webhook(booking, old_tour_details, new_tour_details)
        return unless old_tour_details.is_a?(Hash) && new_tour_details.is_a?(Hash)

        old_flights = old_tour_details['flights'] || {}
        new_flights = new_tour_details['flights'] || {}

        # Check departure flight changes
        if old_flights['there'] != new_flights['there']
          log_flight_change_from_webhook(booking, 'departure', old_flights['there'], new_flights['there'])
        end

        # Check arrival flight changes
        if old_flights['back'] != new_flights['back']
          log_flight_change_from_webhook(booking, 'arrival', old_flights['back'], new_flights['back'])
        end
      end

      def log_flight_change_from_webhook(booking, direction, old_flight, new_flight)
        return unless old_flight.is_a?(Hash) && new_flight.is_a?(Hash)

        changes = []
        
        # Check date changes
        if old_flight['date'] != new_flight['date']
          changes << "date: #{old_flight['date']} → #{new_flight['date']}"
        end

        # Check departure time changes
        if old_flight.dig('departure', 'time') != new_flight.dig('departure', 'time')
          old_time = old_flight.dig('departure', 'time')
          new_time = new_flight.dig('departure', 'time')
          changes << "departure time: #{old_time} → #{new_time}"
        end

        # Check arrival time changes
        if old_flight.dig('arrival', 'time') != new_flight.dig('arrival', 'time')
          old_time = old_flight.dig('arrival', 'time')
          new_time = new_flight.dig('arrival', 'time')
          changes << "arrival time: #{old_time} → #{new_time}"
        end

        # Check flight number changes
        if old_flight.dig('flight_number', 'number') != new_flight.dig('flight_number', 'number')
          old_number = old_flight.dig('flight_number', 'number')
          new_number = new_flight.dig('flight_number', 'number')
          changes << "flight number: #{old_number} → #{new_number}"
        end

        if changes.any?
          Rails.logger.warn "FLIGHT CHANGE FROM WEBHOOK - Booking #{booking.id} (#{direction}): #{changes.join(', ')}"
          
          # Store change in comments_data for tracking
          comments = booking.comments_data || {}
          webhook_changes = comments['webhook_flight_changes'] || []
          webhook_changes << {
            direction: direction,
            changes: changes,
            timestamp: Time.current.iso8601,
            source: 'webhook',
            old_flight: old_flight,
            new_flight: new_flight
          }
          comments['webhook_flight_changes'] = webhook_changes
          booking.update!(comments_data: comments)
        end
      end

      def handle_flight_changes_from_webhook(booking, flight_changes)
        Rails.logger.info "Processing flight changes from webhook for booking #{booking.id}: #{flight_changes.inspect}"
        
        # Store webhook flight changes
        comments = booking.comments_data || {}
        webhook_changes = comments['webhook_flight_changes'] || []
        webhook_changes << {
          changes: flight_changes,
          timestamp: Time.current.iso8601,
          source: 'webhook'
        }
        comments['webhook_flight_changes'] = webhook_changes
        booking.update!(comments_data: comments)
      end
    end
  end
end
