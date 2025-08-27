class CreateBookings < ActiveRecord::Migration[8.0]
  def change
    create_table :bookings do |t|
      t.references :user, null: false, foreign_key: true
      t.references :package, null: false, foreign_key: true
      t.string :obs_booking_id, null: false
      t.string :status, null: false, default: 'pending'
      t.datetime :expires_at
      t.json :raw_json # Raw data from OBS API

      t.timestamps
    end

    add_index :bookings, :obs_booking_id, unique: true
    add_index :bookings, :status
    add_index :bookings, :expires_at
  end
end
