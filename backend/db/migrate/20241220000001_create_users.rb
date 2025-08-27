class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users do |t|
      t.string :email, null: false
      t.string :obs_user_id, null: false
      t.text :obs_access_token
      t.text :obs_refresh_token
      t.datetime :obs_token_expires_at

      t.timestamps
    end

    add_index :users, :email, unique: true
    add_index :users, :obs_user_id, unique: true
  end
end
