FactoryBot.define do
  factory :notification do
    user
    title { Faker::Lorem.sentence(word_count: 3) }
    message { Faker::Lorem.paragraph(sentence_count: 2) }
    notification_type { 'info' }
    delivery_channels { ['in_app'] }
    event_type { 'test_event' }
    event_id { nil }
    metadata { {} }
    delivered { false }
    delivered_at { nil }
    read_at { nil }

    trait :read do
      read_at { Time.current }
    end

    trait :unread do
      read_at { nil }
    end

    trait :delivered do
      delivered { true }
      delivered_at { Time.current }
    end

    trait :pending_delivery do
      delivered { false }
      delivered_at { nil }
    end

    trait :with_email do
      delivery_channels { ['in_app', 'email'] }
    end

    trait :admin_message do
      notification_type { 'admin_message' }
      event_type { 'admin_message' }
    end

    trait :booking_update do
      notification_type { 'booking_update' }
      event_type { 'booking_created' }
      event_id { SecureRandom.hex(8) }
    end

    trait :system do
      notification_type { 'system' }
      event_type { 'system_maintenance' }
    end

    trait :with_metadata do
      metadata { { 
        source: 'test',
        priority: 'high',
        category: 'user_action'
      } }
    end
  end
end