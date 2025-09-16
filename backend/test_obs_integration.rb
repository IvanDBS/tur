#!/usr/bin/env ruby
# Test script for OBS API integration
# Run with: rails runner test_obs_integration.rb

puts "🧪 Testing OBS API Integration"
puts "=" * 50

# Test 1: Site Authentication
puts "\n1. Testing Site Authentication..."
begin
  site_auth = ObsSiteAuthService.instance
  token = site_auth.access_token
  
  if token.present?
    puts "✅ Site authentication successful"
    puts "   Token: #{token[0..20]}..."
  else
    puts "❌ Site authentication failed"
  end
rescue => e
  puts "❌ Site authentication error: #{e.message}"
end

# Test 2: Search API
puts "\n2. Testing Search API..."
begin
  obs_adapter = ObsAdapter.new
  cities = obs_adapter.departure_cities
  
  if cities.is_a?(Array) && cities.any?
    puts "✅ Departure cities fetched successfully"
    puts "   Found #{cities.length} cities"
    puts "   First city: #{cities.first['name']} (ID: #{cities.first['id']})"
  else
    puts "❌ Failed to fetch departure cities"
  end
rescue => e
  puts "❌ Search API error: #{e.message}"
end

# Test 3: Countries API
puts "\n3. Testing Countries API..."
begin
  obs_adapter = ObsAdapter.new
  countries = obs_adapter.countries(33785) # Bucharest airport
  
  if countries.is_a?(Array) && countries.any?
    puts "✅ Countries fetched successfully"
    puts "   Found #{countries.length} countries"
    puts "   First country: #{countries.first['name']} (ID: #{countries.first['id']})"
  else
    puts "❌ Failed to fetch countries"
  end
rescue => e
  puts "❌ Countries API error: #{e.message}"
end

# Test 4: Package Templates API
puts "\n4. Testing Package Templates API..."
begin
  obs_adapter = ObsAdapter.new
  templates = obs_adapter.package_templates(223, 33785) # Romania, Bucharest
  
  if templates.is_a?(Array) && templates.any?
    puts "✅ Package templates fetched successfully"
    puts "   Found #{templates.length} templates"
    puts "   First template: #{templates.first['name']} (ID: #{templates.first['id']})"
  else
    puts "❌ Failed to fetch package templates"
  end
rescue => e
  puts "❌ Package templates API error: #{e.message}"
end

# Test 5: Search Packages (with minimal params)
puts "\n5. Testing Search Packages API..."
begin
  obs_adapter = ObsAdapter.new
  
  # Minimal search parameters with future dates
  future_date = (Date.current + 30.days).strftime("%d.%m.%Y")
  search_params = {
    country: 223,
    package_template: 53,
    airport_city_from: 33785,
    airport_city_to: [50004],
    date_from: future_date,
    date_to: future_date,
    nights_from: 7,
    nights_to: 7,
    adults: 2,
    selected_hotels: [6428, 62, 582],
    meals: ["AI and better", "HB", "RB"]
  }
  
  results = obs_adapter.search_packages(search_params)
  
  if results.is_a?(Hash) && results.any?
    puts "✅ Search packages successful"
    puts "   Found #{results.keys.length} results"
    first_key = results.keys.first
    first_result = results[first_key]
    puts "   First result: Hotel #{first_result.dig('accommodation', 'hotel', 'name')}"
    puts "   Price: #{first_result.dig('price', 'amount')} #{first_result.dig('price', 'currency')}"
  else
    puts "❌ Failed to search packages"
  end
rescue => e
  puts "❌ Search packages API error: #{e.message}"
end

puts "\n" + "=" * 50
puts "🏁 OBS API Integration Test Complete"
puts "\nNext steps:"
puts "1. Test booking endpoints with real booking hashes"
puts "2. Test webhook integration"
puts "3. Test full booking flow"
