class CreateNotifications < ActiveRecord::Migration[8.0]
  def change
    create_table :notifications do |t|
      t.references :user, null: false, foreign_key: true
      t.string :title, null: false
      t.text :message, null: false
      t.string :notification_type, null: false, default: 'info'
      t.string :delivery_channels, array: true, default: ['in_app']
      t.datetime :read_at
      t.json :metadata, default: {}
      t.string :event_type # Тип бизнес-события, которое вызвало уведомление
      t.string :event_id # ID объекта события (booking_id, user_id, etc.)
      t.boolean :delivered, default: false
      t.datetime :delivered_at

      t.timestamps
    end

    add_index :notifications, [:user_id, :read_at]
    add_index :notifications, [:user_id, :created_at]
    add_index :notifications, [:notification_type]
    add_index :notifications, [:event_type, :event_id]
    add_index :notifications, [:delivered]
  end
end
