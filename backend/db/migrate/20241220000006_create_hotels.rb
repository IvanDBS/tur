class CreateHotels < ActiveRecord::Migration[8.0]
  def change
    create_table :hotels do |t|
      t.string :name, null: false
      t.integer :stars
      t.string :region
      t.integer :obs_id # ID from OBS API
      t.json :raw_json # Raw data from OBS API

      t.timestamps
    end

    add_index :hotels, :name
    add_index :hotels, :stars
    add_index :hotels, :region
    add_index :hotels, :obs_id, unique: true
  end
end
