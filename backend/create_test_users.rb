# Create test users for notification system
puts "Creating test users..."

# Create admin user
admin = User.find_or_create_by(email: 'admin@example.com') do |user|
  user.password = 'password123'
  user.password_confirmation = 'password123'
  user.admin = true
  user.first_name = 'Admin'
  user.last_name = 'User'
end

puts "Admin user: #{admin.email} (ID: #{admin.id})"

# Create regular users
users_data = [
  { email: 'ivan@example.com', first_name: 'Иван', last_name: 'Иванов' },
  { email: 'maria@example.com', first_name: 'Мария', last_name: 'Петрова' },
  { email: 'alex@example.com', first_name: 'Алексей', last_name: 'Сидоров' },
  { email: 'elena@example.com', first_name: 'Елена', last_name: 'Козлова' },
  { email: 'dmitry@example.com', first_name: 'Дмитрий', last_name: 'Волков' }
]

users_data.each do |user_data|
  user = User.find_or_create_by(email: user_data[:email]) do |u|
    u.password = 'password123'
    u.password_confirmation = 'password123'
    u.first_name = user_data[:first_name]
    u.last_name = user_data[:last_name]
    u.admin = false
  end
  puts "User: #{user.email} (ID: #{user.id})"
end

puts "\nTotal users: #{User.count}"
puts "Admin users: #{User.where(admin: true).count}"
puts "Regular users: #{User.where(admin: false).count}"

# Create a test notification
test_user = User.where(admin: false).first
if test_user
  notification = Notification.create!(
    user: test_user,
    title: "Добро пожаловать!",
    message: "Это тестовое уведомление для проверки системы.",
    notification_type: 'info',
    delivery_channels: ['in_app'],
    event_type: 'admin_message',
    metadata: { test: true }
  )
  puts "\nTest notification created: ID #{notification.id} for user #{test_user.email}"
end

puts "\nDone!"
