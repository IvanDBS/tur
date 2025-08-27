class CreateAvailabilities < ActiveRecord::Migration[8.0]
  def change
    create_table :availabilities do |t|
      t.references :package, null: false, foreign_key: true
      t.date :date, null: false
      t.string :status, null: false # available/unavailable/limited
      t.integer :capacity
      t.json :raw_json # Raw data from OBS API

      t.timestamps
    end

    add_index :availabilities, [:package_id, :date], unique: true
    add_index :availabilities, :date
    add_index :availabilities, :status
  end
end
