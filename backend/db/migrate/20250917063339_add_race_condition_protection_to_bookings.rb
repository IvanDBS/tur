class AddRaceConditionProtectionToBookings < ActiveRecord::Migration[8.0]
  def change
    # Add version column for optimistic locking
    add_column :bookings, :lock_version, :integer, default: 0, null: false
    
    # Add composite unique index to prevent duplicate bookings for same user and booking hash
    add_index :bookings, [:user_id, :obs_booking_hash], 
              unique: true, 
              name: 'index_bookings_on_user_and_booking_hash'
    
    # Add index for better performance on status queries with user
    add_index :bookings, [:user_id, :status], 
              name: 'index_bookings_on_user_and_status'
    
    # Note: Race condition protection is handled at application level
    # with pessimistic locking in the Booking.create_safely method
  end
end
