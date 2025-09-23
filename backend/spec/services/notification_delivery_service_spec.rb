require 'rails_helper'

RSpec.describe NotificationDeliveryService, type: :service do
  let(:user) { create(:user) }
  let(:notification) { create(:notification, user: user) }
  let(:service) { described_class.instance }

  describe '#deliver' do
    context 'with in_app channel' do
      it 'delivers notification through in_app channel' do
        result = service.deliver(notification, ['in_app'])
        
        expect(result['in_app'][:success]).to be true
        expect(result['in_app'][:result][:status]).to eq('delivered')
      end
    end

    context 'with email channel' do
      it 'delivers notification through email channel' do
        result = service.deliver(notification, ['email'])
        
        expect(result['email'][:success]).to be true
        expect(result['email'][:result][:status]).to eq('delivered')
      end
    end

    context 'with multiple channels' do
      it 'delivers through all specified channels' do
        result = service.deliver(notification, ['in_app', 'email'])
        
        expect(result.keys).to contain_exactly('in_app', 'email')
        expect(result['in_app'][:success]).to be true
        expect(result['email'][:success]).to be true
      end
    end

    context 'with invalid channel' do
      it 'handles invalid channel gracefully' do
        result = service.deliver(notification, ['invalid_channel'])
        
        expect(result['invalid_channel'][:success]).to be false
        expect(result['invalid_channel'][:error]).to be_present
      end
    end
  end

  describe '#deliver_bulk' do
    let(:user_ids) { [user.id] }
    let(:notification_data) do
      {
        title: 'Bulk Test',
        message: 'Bulk message',
        notification_type: 'info',
        metadata: { test: true }
      }
    end

    it 'creates notifications for multiple users' do
      expect {
        service.deliver_bulk(notification_data, user_ids, ['in_app'])
      }.to change(Notification, :count).by(1)
    end

    it 'returns results with success/failure info' do
      results = service.deliver_bulk(notification_data, user_ids, ['in_app'])
      
      expect(results).to be_an(Array)
      expect(results.first[:success]).to be true
      expect(results.first[:notification_id]).to be_present
    end

    it 'handles user creation errors gracefully' do
      # Mock user creation to fail
      allow(Notification).to receive(:create!).and_raise(StandardError.new('Database error'))
      
      results = service.deliver_bulk(notification_data, user_ids, ['in_app'])
      
      expect(results.first[:success]).to be false
      expect(results.first[:error]).to eq('Database error')
    end
  end

  describe '#delivery_stats' do
    let!(:recent_notifications) do
      [
        create(:notification, :delivered, created_at: 1.hour.ago),
        create(:notification, :pending_delivery, created_at: 2.hours.ago)
      ]
    end

    it 'returns delivery statistics' do
      stats = service.delivery_stats(24.hours)
      
      expect(stats[:total_notifications]).to eq(2)
      expect(stats[:delivered_notifications]).to eq(1)
      expect(stats[:pending_notifications]).to eq(1)
      expect(stats[:channel_stats]).to be_a(Hash)
      expect(stats[:error_rate]).to be_a(Numeric)
    end
  end

  describe 'delivery handlers' do
    describe 'InAppDeliveryHandler' do
      let(:handler) { InAppDeliveryHandler.new }

      it 'delivers in-app notifications' do
        result = handler.deliver(notification)
        
        expect(result[:status]).to eq('delivered')
        expect(result[:method]).to eq('in_app')
      end

      it 'supports in_app channel' do
        expect(handler.supports_channel?('in_app')).to be true
        expect(handler.supports_channel?('email')).to be false
      end
    end

    describe 'EmailDeliveryHandler' do
      let(:handler) { EmailDeliveryHandler.new }

      it 'delivers email notifications' do
        result = handler.deliver(notification)
        
        expect(result[:status]).to eq('delivered')
        expect(result[:method]).to eq('email')
      end

      it 'skips delivery if user has no email' do
        user_without_email = create(:user, email: nil)
        notification_without_email = create(:notification, user: user_without_email)
        
        result = handler.deliver(notification_without_email)
        
        expect(result[:status]).to eq('skipped')
        expect(result[:reason]).to eq('no_email')
      end
    end

    describe 'SmsDeliveryHandler' do
      let(:handler) { SmsDeliveryHandler.new }

      it 'delivers SMS notifications' do
        result = handler.deliver(notification)
        
        expect(result[:status]).to eq('delivered')
        expect(result[:method]).to eq('sms')
      end

      it 'skips delivery if user has no phone' do
        user_without_phone = create(:user, phone: nil)
        notification_without_phone = create(:notification, user: user_without_phone)
        
        result = handler.deliver(notification_without_phone)
        
        expect(result[:status]).to eq('skipped')
        expect(result[:reason]).to eq('no_phone')
      end
    end
  end
end
