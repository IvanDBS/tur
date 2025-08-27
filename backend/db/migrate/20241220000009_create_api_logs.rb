class CreateApiLogs < ActiveRecord::Migration[8.0]
  def change
    create_table :api_logs do |t|
      t.string :endpoint, null: false
      t.text :request
      t.text :response
      t.integer :status
      t.datetime :created_at, null: false
    end

    add_index :api_logs, :endpoint
    add_index :api_logs, :status
    add_index :api_logs, :created_at
  end
end
