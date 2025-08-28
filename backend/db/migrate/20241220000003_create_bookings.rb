class CreateBookings < ActiveRecord::Migration[8.0]
  def change
    create_table :bookings do |t|
      t.references :user, null: false, foreign_key: true
      t.references :search_query, null: true, foreign_key: true
      t.string :obs_booking_hash, null: false # Format: "rid:unique_key"
      t.string :obs_order_id # OBS order number after confirmation
      t.string :status, null: false, default: 'pending'
      t.decimal :total_amount, precision: 10, scale: 2
      t.json :tour_details # Hotel and tour info from OBS
      t.json :customer_data # Customer information for booking
      t.text :notes
      t.datetime :expires_at
      t.datetime :confirmed_at
      t.datetime :cancelled_at

      t.timestamps
    end

    add_index :bookings, :obs_booking_hash, unique: true
    add_index :bookings, :obs_order_id
    add_index :bookings, :status
    add_index :bookings, :expires_at
  end
end
