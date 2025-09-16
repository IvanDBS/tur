class CleanTourDetailsData < ActiveRecord::Migration[8.0]
  def up
    # Clean existing tour_details data to remove reference data
    Booking.find_each do |booking|
      tour_details = booking.tour_details_hash
      
      # Only process if tour_details contains reference data
      if tour_details.is_a?(Hash) && tour_details['countries'].is_a?(Array)
        # Extract only relevant tour information
        cleaned_details = {
          hotel: tour_details['hotel'],
          flights: tour_details['flights'],
          tourists: tour_details['tourists'],
          services: tour_details['services'],
          notes: tour_details['notes'],
          price: tour_details['price'],
          values: tour_details['values']
        }.compact
        
        # Update booking with cleaned data
        booking.update_column(:tour_details, cleaned_details)
        puts "Cleaned tour_details for booking #{booking.id}"
      end
    end
  end

  def down
    # This migration cannot be reversed as we're removing data
    raise ActiveRecord::IrreversibleMigration
  end
end
