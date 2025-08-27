class CreateCities < ActiveRecord::Migration[8.0]
  def change
    create_table :cities do |t|
      t.string :name, null: false
      t.string :type, null: false # departure/arrival
      t.integer :obs_id # ID from OBS API

      t.timestamps
    end

    add_index :cities, :name
    add_index :cities, :type
    add_index :cities, :obs_id, unique: true
  end
end
