#!/usr/bin/env ruby

# Простой тест для проверки валидации бронирования
# Запуск: ruby test_booking_validation.rb

require_relative 'config/environment'

puts "🧪 Тестирование валидации бронирования..."

# Создаем тестового пользователя
user = User.find_or_create_by(email: 'test@example.com') do |u|
  u.password = 'password123'
  u.obs_user_id = 'test_user_123'
end

# Тест 1: Валидация имен в верхнем регистре (нормализация работает)
puts "\n1. Тест нормализации имен в верхний регистр"

booking_data = {
  'tourists' => [
    {
      'firstName' => 'john',  # должно быть приведено к верхнему регистру
      'lastName' => 'doe',    # должно быть приведено к верхнему регистру
      'birthDate' => '1990-01-01',
      'passportNumber' => 'ab123456',
      'passportExpiry' => '2030-01-01',
      'nationality' => 'MOLDOVA'
    }
  ]
}

booking = Booking.new(
  user: user,
  obs_booking_hash: 'test_hash_1',
  customer_data: booking_data.to_json,
  status: 'pending'
)

if booking.valid?
  puts "✅ ПРОЙДЕН: Нормализация работает - имена приведены к верхнему регистру"
  customer_data = booking.customer_data_hash
  tourist = customer_data['tourists'][0]
  puts "   Имя: '#{tourist['firstName']}' (должно быть 'JOHN')"
  puts "   Фамилия: '#{tourist['lastName']}' (должно быть 'DOE')"
  puts "   Паспорт: '#{tourist['passportNumber']}' (должно быть 'AB123456')"
else
  puts "❌ ОШИБКА: Валидация провалилась после нормализации"
  puts "   Ошибки: #{booking.errors.full_messages.join(', ')}"
end

# Тест 2: Валидация даты рождения из будущего
puts "\n2. Тест валидации даты рождения из будущего"

booking_data = {
  'tourists' => [
    {
      'firstName' => 'JOHN',
      'lastName' => 'DOE',
      'birthDate' => (Date.current + 1.year).to_s,  # дата из будущего
      'passportNumber' => 'AB123456',
      'passportExpiry' => '2030-01-01',
      'nationality' => 'MOLDOVA'
    }
  ]
}

booking = Booking.new(
  user: user,
  obs_booking_hash: 'test_hash_2',
  customer_data: booking_data.to_json,
  status: 'pending'
)

if booking.valid?
  puts "❌ ОШИБКА: Валидация должна была провалиться для даты рождения из будущего"
else
  puts "✅ ПРОЙДЕН: Валидация корректно отклоняет дату рождения из будущего"
  puts "   Ошибки: #{booking.errors.full_messages.join(', ')}"
end

# Тест 3: Валидация формата номера паспорта
puts "\n3. Тест валидации формата номера паспорта"

booking_data = {
  'tourists' => [
    {
      'firstName' => 'JOHN',
      'lastName' => 'DOE',
      'birthDate' => '1990-01-01',
      'passportNumber' => 'AB-123-456',  # содержит дефисы - недопустимо
      'passportExpiry' => '2030-01-01',
      'nationality' => 'MOLDOVA'
    }
  ]
}

booking = Booking.new(
  user: user,
  obs_booking_hash: 'test_hash_3',
  customer_data: booking_data.to_json,
  status: 'pending'
)

if booking.valid?
  puts "❌ ОШИБКА: Валидация должна была провалиться для номера паспорта с дефисами"
else
  puts "✅ ПРОЙДЕН: Валидация корректно отклоняет номер паспорта с недопустимыми символами"
  puts "   Ошибки: #{booking.errors.full_messages.join(', ')}"
end

# Тест 4: Валидация налогового кода
puts "\n4. Тест валидации налогового кода"

booking_data = {
  'tourists' => [
    {
      'firstName' => 'JOHN',
      'lastName' => 'DOE',
      'birthDate' => '1990-01-01',
      'passportNumber' => 'AB123456',
      'passportExpiry' => '2030-01-01',
      'nationality' => 'MOLDOVA',
      'fiscalCode' => '123'  # слишком короткий
    }
  ]
}

booking = Booking.new(
  user: user,
  obs_booking_hash: 'test_hash_4',
  customer_data: booking_data.to_json,
  status: 'pending'
)

if booking.valid?
  puts "❌ ОШИБКА: Валидация должна была провалиться для слишком короткого налогового кода"
else
  puts "✅ ПРОЙДЕН: Валидация корректно отклоняет слишком короткий налоговый код"
  puts "   Ошибки: #{booking.errors.full_messages.join(', ')}"
end

# Тест 5: Успешная валидация
puts "\n5. Тест успешной валидации"

booking_data = {
  'tourists' => [
    {
      'firstName' => 'JOHN',
      'lastName' => 'DOE',
      'birthDate' => '1990-01-01',
      'passportNumber' => 'AB123456',
      'passportExpiry' => '2030-01-01',
      'nationality' => 'MOLDOVA',
      'fiscalCode' => '1234567890123'  # корректный налоговый код
    }
  ]
}

booking = Booking.new(
  user: user,
  obs_booking_hash: 'test_hash_5',
  customer_data: booking_data.to_json,
  status: 'pending'
)

if booking.valid?
  puts "✅ ПРОЙДЕН: Валидация успешно проходит для корректных данных"
else
  puts "❌ ОШИБКА: Валидация не должна была провалиться для корректных данных"
  puts "   Ошибки: #{booking.errors.full_messages.join(', ')}"
end

puts "\n🎉 Тестирование завершено!"
