require 'rails_helper'

RSpec.describe Notification, type: :model do
  let(:user) { create(:user) }
  
  describe 'validations' do
    it { should validate_presence_of(:title) }
    it { should validate_presence_of(:message) }
    it { should validate_presence_of(:notification_type) }
    it { should validate_length_of(:title).is_at_most(255) }
    it { should validate_length_of(:message).is_at_most(2000) }
    
    it 'validates notification_type enum' do
      notification = build(:notification, notification_type: 'invalid_type')
      expect(notification).not_to be_valid
      expect(notification.errors[:notification_type]).to include("'invalid_type' is not a valid notification_type")
    end
    
    it 'validates delivery_channels' do
      notification = build(:notification, delivery_channels: ['invalid_channel'])
      expect(notification).not_to be_valid
      expect(notification.errors[:delivery_channels]).to include("contains invalid channels: invalid_channel")
    end
  end

  describe 'associations' do
    it { should belong_to(:user) }
  end

  describe 'scopes' do
    let!(:read_notification) { create(:notification, user: user, read_at: Time.current) }
    let!(:unread_notification) { create(:notification, user: user, read_at: nil) }
    let!(:delivered_notification) { create(:notification, user: user, delivered: true) }
    let!(:pending_notification) { create(:notification, user: user, delivered: false) }

    describe '.unread' do
      it 'returns unread notifications' do
        expect(Notification.unread).to include(unread_notification)
        expect(Notification.unread).not_to include(read_notification)
      end
    end

    describe '.read' do
      it 'returns read notifications' do
        expect(Notification.read).to include(read_notification)
        expect(Notification.read).not_to include(unread_notification)
      end
    end

    describe '.delivered' do
      it 'returns delivered notifications' do
        expect(Notification.delivered).to include(delivered_notification)
        expect(Notification.delivered).not_to include(pending_notification)
      end
    end

    describe '.pending_delivery' do
      it 'returns pending notifications' do
        expect(Notification.pending_delivery).to include(pending_notification)
        expect(Notification.pending_delivery).not_to include(delivered_notification)
      end
    end

    describe '.by_type' do
      let!(:info_notification) { create(:notification, user: user, notification_type: 'info') }
      let!(:error_notification) { create(:notification, user: user, notification_type: 'error') }

      it 'filters by notification type' do
        expect(Notification.by_type('info')).to include(info_notification)
        expect(Notification.by_type('info')).not_to include(error_notification)
      end
    end
  end

  describe 'callbacks' do
    it 'sets default delivery channels on create' do
      notification = create(:notification, delivery_channels: nil)
      expect(notification.delivery_channels).to eq(['in_app'])
    end

    it 'triggers delivery job after create' do
      expect {
        create(:notification, user: user)
      }.to have_enqueued_job(NotificationDeliveryJob)
    end
  end

  describe 'instance methods' do
    let(:notification) { create(:notification, user: user) }

    describe '#read?' do
      it 'returns true when read_at is present' do
        notification.update!(read_at: Time.current)
        expect(notification.read?).to be true
      end

      it 'returns false when read_at is nil' do
        expect(notification.read?).to be false
      end
    end

    describe '#mark_as_read!' do
      it 'sets read_at timestamp' do
        expect {
          notification.mark_as_read!
        }.to change { notification.read_at }.from(nil)
      end

      it 'does not update if already read' do
        notification.update!(read_at: Time.current)
        original_read_at = notification.read_at
        
        expect {
          notification.mark_as_read!
        }.not_to change { notification.read_at }
      end
    end

    describe '#mark_as_delivered!' do
      it 'sets delivered flag and timestamp' do
        expect {
          notification.mark_as_delivered!
        }.to change { notification.delivered }.from(false).to(true)
          .and change { notification.delivered_at }.from(nil)
      end
    end

    describe '#supports_channel?' do
      it 'returns true for supported channels' do
        expect(notification.supports_channel?('in_app')).to be true
        expect(notification.supports_channel?('email')).to be true
      end

      it 'returns false for unsupported channels' do
        expect(notification.supports_channel?('invalid')).to be false
      end
    end
  end

  describe 'class methods' do
    describe '.create_from_event' do
      let(:event_data) do
        {
          user_id: user.id,
          title: 'Test Event',
          message: 'Test message',
          notification_type: 'info',
          delivery_channels: ['in_app', 'email'],
          event_id: '123',
          metadata: { test: true }
        }
      end

      it 'creates notification from event data' do
        expect {
          Notification.create_from_event('test_event', event_data)
        }.to change(Notification, :count).by(1)
      end

      it 'sets correct attributes' do
        notification = Notification.create_from_event('test_event', event_data)
        
        expect(notification.user_id).to eq(user.id)
        expect(notification.title).to eq('Test Event')
        expect(notification.event_type).to eq('test_event')
        expect(notification.event_id).to eq('123')
        expect(notification.metadata).to eq({ 'test' => true })
      end
    end

    describe '.cleanup_old_notifications' do
      let!(:old_notification) { create(:notification, user: user, created_at: 35.days.ago) }
      let!(:recent_notification) { create(:notification, user: user, created_at: 10.days.ago) }

      it 'deletes notifications older than specified days' do
        expect {
          Notification.cleanup_old_notifications(30)
        }.to change(Notification, :count).by(-1)
        
        expect(Notification.exists?(old_notification.id)).to be false
        expect(Notification.exists?(recent_notification.id)).to be true
      end
    end

    describe '.unread_count_for_user' do
      let!(:user1_unread) { create(:notification, user: user, read_at: nil) }
      let!(:user1_read) { create(:notification, user: user, read_at: Time.current) }
      let(:user2) { create(:user) }
      let!(:user2_unread) { create(:notification, user: user2, read_at: nil) }

      it 'returns unread count for specific user' do
        expect(Notification.unread_count_for_user(user.id)).to eq(1)
        expect(Notification.unread_count_for_user(user2.id)).to eq(1)
      end
    end
  end
end