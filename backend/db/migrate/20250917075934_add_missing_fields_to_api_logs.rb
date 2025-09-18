class AddMissingFieldsToApiLogs < ActiveRecord::Migration[8.0]
  def change
    add_column :api_logs, :method, :string
    add_column :api_logs, :path, :string
    add_column :api_logs, :duration_ms, :integer
    add_column :api_logs, :user_id, :integer
    add_column :api_logs, :ip_address, :string
    add_column :api_logs, :user_agent, :text
    add_column :api_logs, :request_id, :string
  end
end
