namespace :bookings do
  desc "Sync bookings that were created locally but not on OBS server"
  task sync_missing: :environment do
    puts "🔄 Syncing bookings that are missing on OBS server..."
    
    # Find bookings that don't have obs_order_id (not synced to OBS)
    missing_bookings = Booking.where(obs_order_id: nil, status: 'pending')
    
    puts "Found #{missing_bookings.count} bookings to sync"
    
    missing_bookings.each do |booking|
      puts "\n📋 Processing booking ID: #{booking.id}"
      puts "   Hash: #{booking.obs_booking_hash}"
      puts "   Status: #{booking.status}"
      
      begin
        obs_adapter = ObsAdapter.new(user_id: booking.user_id)
        
        # Try to create booking on OBS server
        puts "   🔄 Creating booking on OBS server..."
        
        # Prepare data in OBS API format
        obs_booking_data = {
          selectedServices: ['hotel', 'avia_transport'],
          aquapark_services: [],
          never_land_entrance: [],
          gala_dinner: [],
          tourists: prepare_tourists_for_obs(booking),
          comment: booking.notes || '',
          notes: booking.tour_details.dig('notes') || [],
          total_sum: booking.total_amount.to_f
        }
        
        obs_response = obs_adapter.create_booking(
          booking.obs_booking_hash, 
          obs_booking_data
        )
        
        if obs_response.present?
          booking.update!(
            obs_order_id: obs_response.dig('order_id') || obs_response.dig('id'),
            operator_status: obs_response.dig('status'),
            last_synced_at: Time.current
          )
          puts "   ✅ Successfully synced! Order ID: #{booking.obs_order_id}"
        else
          puts "   ❌ No response from OBS server"
        end
        
      rescue ObsAdapter::Error => e
        puts "   ❌ OBS API error: #{e.message}"
      rescue StandardError => e
        puts "   ❌ Unexpected error: #{e.message}"
      end
    end
    
    puts "\n✅ Sync completed!"
  end
end
