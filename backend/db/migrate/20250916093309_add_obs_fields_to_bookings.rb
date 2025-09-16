class AddObsFieldsToBookings < ActiveRecord::Migration[8.0]
  def change
    add_column :bookings, :operator_type, :string, default: 'obs'
    add_column :bookings, :operator_booking_id, :string
    add_column :bookings, :operator_status, :string
    add_column :bookings, :last_synced_at, :datetime
    add_column :bookings, :payment_data, :json
    add_column :bookings, :comments_data, :json
    add_column :bookings, :is_checked, :boolean, default: false

    # Add indexes for better performance
    add_index :bookings, :operator_type
    add_index :bookings, :operator_booking_id
    add_index :bookings, :operator_status
    add_index :bookings, :last_synced_at
  end
end
