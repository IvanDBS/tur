class CreatePackages < ActiveRecord::Migration[8.0]
  def change
    create_table :packages do |t|
      t.references :hotel, null: false, foreign_key: true
      t.string :name, null: false
      t.text :description
      t.decimal :price, precision: 10, scale: 2
      t.integer :obs_id # ID from OBS API
      t.json :raw_json # Raw data from OBS API

      t.timestamps
    end

    add_index :packages, :name
    add_index :packages, :price
    add_index :packages, :obs_id, unique: true
  end
end
