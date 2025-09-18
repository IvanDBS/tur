class AddOperatorIdToBookings < ActiveRecord::Migration[8.0]
  def change
    add_column :bookings, :operator_id, :integer
  end
end
