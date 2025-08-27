class CreateSearchQueries < ActiveRecord::Migration[8.0]
  def change
    create_table :search_queries do |t|
      t.references :user, null: true, foreign_key: true
      t.string :obs_search_id, null: false
      t.text :search_params, null: false
      t.json :search_results
      t.datetime :expires_at

      t.timestamps
    end

    add_index :search_queries, :obs_search_id, unique: true
    add_index :search_queries, :expires_at
  end
end
