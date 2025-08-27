class CreateObsCredentials < ActiveRecord::Migration[8.0]
  def change
    create_table :obs_credentials do |t|
      t.string :email, null: false
      t.text :encrypted_password, null: false
      t.text :refresh_token
      t.datetime :expires_at

      t.timestamps
    end

    add_index :obs_credentials, :email, unique: true
    add_index :obs_credentials, :expires_at
  end
end
