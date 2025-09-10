# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

# Create test users for development
if Rails.env.development?
  # Create admin user
  admin_user = User.find_or_create_by!(email: 'admin@example.com') do |user|
    user.password = 'password123'
    user.password_confirmation = 'password123'
    user.first_name = 'Admin'
    user.last_name = 'User'
    user.phone = '+37312345678'    user.admin = true
    user.banned = false
  end

  # Create regular user
  regular_user = User.find_or_create_by!(email: 'user@example.com') do |user|
    user.password = 'password123'
    user.password_confirmation = 'password123'
    user.first_name = 'Regular'
    user.last_name = 'User'
    user.phone = '+37387654321'
    user.admin = false
    user.banned = false
  end

  puts "Created users:"
  puts "- Admin: #{admin_user.email} (password: password123)"
  puts "- User: #{regular_user.email} (password: password123)"

  # Clear existing bookings
  Booking.destroy_all
  puts "Cleared existing bookings"

  # Create test bookings for regular user
  bookings_data = [
    {
      hotel_name: "IC HOTELS SANTAI FAMILY RESORT",
      hotel_category: "5* / HV1",
      city: "BELEK",
      room_type: "STANDARD ROOM LAND VIEW",
      meal_plan: "ULTRA ALL INCLUSIVE",
      check_in: "2025-10-05",
      check_out: "2025-10-12",
      nights: 7,
      price: 2370,
      currency: "EUR",
      status: "pending",
      order_number: "TT25-TR/001",
      tourists: [
        { name: "MR. IVAN PETROV", category: "mr", birthday: "1985-03-15" },
        { name: "MRS. MARIA PETROVA", category: "mrs", birthday: "1987-07-22" }
      ],
      flight_info: {
        departure: { date: "2025-10-05", time: "06:30", airport: "RMO", city: "CHISINAU" },
        arrival: { date: "2025-10-12", time: "05:30", airport: "RMO", city: "CHISINAU" }
      }
    },
    {
      hotel_name: "ADALYA ARTSIDE HOTEL",
      hotel_category: "5* / HV1",
      city: "SIDE",
      room_type: "STANDARD ROOM SEA VIEW",
      meal_plan: "ULTRA ALL INCLUSIVE",
      check_in: "2025-10-15",
      check_out: "2025-10-22",
      nights: 7,
      price: 1959,
      currency: "EUR",
      status: "confirmed",
      order_number: "TT25-TR/002",
      tourists: [
        { name: "MR. ALEXEY SMIRNOV", category: "mr", birthday: "1990-11-08" }
      ],
      flight_info: {
        departure: { date: "2025-10-15", time: "08:15", airport: "RMO", city: "CHISINAU" },
        arrival: { date: "2025-10-22", time: "07:45", airport: "RMO", city: "CHISINAU" }
      }
    },
    {
      hotel_name: "GRAND KEMER HOTEL",
      hotel_category: "5* / HV1",
      city: "KEMER",
      room_type: "DELUXE ROOM",
      meal_plan: "ALL INCLUSIVE",
      check_in: "2025-10-20",
      check_out: "2025-10-27",
      nights: 7,
      price: 2150,
      currency: "EUR",
      status: "pending",
      order_number: "TT25-TR/003",
      tourists: [
        { name: "MRS. ELENA KOZLOVA", category: "mrs", birthday: "1988-05-12" },
        { name: "MR. DMITRY KOZLOV", category: "mr", birthday: "1986-09-30" },
        { name: "CHD. ANNA KOZLOVA", category: "chd", birthday: "2015-02-14" }
      ],
      flight_info: {
        departure: { date: "2025-10-20", time: "12:00", airport: "RMO", city: "CHISINAU" },
        arrival: { date: "2025-10-27", time: "11:30", airport: "RMO", city: "CHISINAU" }
      }
    },
    {
      hotel_name: "ROYAL WINGS HOTEL",
      hotel_category: "4* / HV1",
      city: "ANTALYA",
      room_type: "STANDARD ROOM",
      meal_plan: "HALF BOARD",
      check_in: "2025-10-25",
      check_out: "2025-11-01",
      nights: 7,
      price: 1680,
      currency: "EUR",
      status: "cancelled",
      order_number: "TT25-TR/004",
      tourists: [
        { name: "MRS. OLGA NOVIKOVA", category: "mrs", birthday: "1992-12-03" }
      ],
      flight_info: {
        departure: { date: "2025-10-25", time: "14:20", airport: "RMO", city: "CHISINAU" },
        arrival: { date: "2025-11-01", time: "13:50", airport: "RMO", city: "CHISINAU" }
      }
    },
    {
      hotel_name: "SUNSET BEACH CLUB",
      hotel_category: "5* / HV1",
      city: "ALANYA",
      room_type: "FAMILY ROOM",
      meal_plan: "ULTRA ALL INCLUSIVE",
      check_in: "2025-10-30",
      check_out: "2025-11-06",
      nights: 7,
      price: 2450,
      currency: "EUR",
      status: "failed",
      order_number: "TT25-TR/005",
      tourists: [
        { name: "MR. SERGEY VOLKOV", category: "mr", birthday: "1983-08-17" },
        { name: "MRS. TATYANA VOLKOVA", category: "mrs", birthday: "1985-01-25" },
        { name: "CHD. MAXIM VOLKOV", category: "chd", birthday: "2012-06-10" },
        { name: "CHD. SOFIA VOLKOVA", category: "chd", birthday: "2018-04-05" }
      ],
      flight_info: {
        departure: { date: "2025-10-30", time: "10:45", airport: "RMO", city: "CHISINAU" },
        arrival: { date: "2025-11-06", time: "10:15", airport: "RMO", city: "CHISINAU" }
      }
    }
  ]

  bookings_data.each do |booking_data|
    booking = Booking.find_or_create_by!(obs_order_id: booking_data[:order_number]) do |b|
      b.user = regular_user
      b.obs_booking_hash = "test_#{booking_data[:order_number].gsub('/', '_')}_#{SecureRandom.hex(8)}"
      b.obs_order_id = booking_data[:order_number]
      b.status = booking_data[:status]
      b.total_amount = booking_data[:price]
      b.expires_at = Time.current + 7.days
      
      # Store tour details in JSON format
      b.tour_details = {
        hotel_name: booking_data[:hotel_name],
        hotel_category: booking_data[:hotel_category],
        city: booking_data[:city],
        room_type: booking_data[:room_type],
        meal_plan: booking_data[:meal_plan],
        check_in: booking_data[:check_in],
        check_out: booking_data[:check_out],
        nights: booking_data[:nights],
        currency: booking_data[:currency],
        tourists: booking_data[:tourists],
        flight_info: booking_data[:flight_info]
      }.to_json
      
      # Store customer data
      b.customer_data = {
        name: "#{regular_user.first_name} #{regular_user.last_name}",
        email: regular_user.email,
        phone: regular_user.phone
      }.to_json
      
      # Set status-specific timestamps
      case booking_data[:status]
      when "confirmed"
        b.confirmed_at = Time.current - rand(1..7).days
      when "cancelled"
        b.cancelled_at = Time.current - rand(1..5).days
      end
    end
    
    puts "Created booking: #{booking.obs_order_id} - #{JSON.parse(booking.tour_details)['hotel_name']} (#{booking.status})"
  end

  puts "\nCreated #{bookings_data.length} test bookings for user: #{regular_user.email}"
end
