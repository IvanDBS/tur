require 'rails_helper'

RSpec.describe Api::V1::Admin::NotificationsController, type: :controller do
  let(:admin_user) { create(:user, :admin) }
  let(:regular_user) { create(:user) }
  let(:notification) { create(:notification, user: regular_user) }

  before do
    # Mock JWT authentication and admin check
    allow(controller).to receive(:authenticate_user!).and_return(true)
    allow(controller).to receive(:current_user).and_return(admin_user)
    allow(controller).to receive(:ensure_admin!).and_return(true)
  end

  describe 'GET #index' do
    let!(:notifications) { create_list(:notification, 5) }

    it 'returns all notifications for admin' do
      get :index
      
      expect(response).to have_http_status(:ok)
      expect(json_response['success']).to be true
      expect(json_response['notifications']).to be_an(Array)
    end

    it 'includes stats' do
      get :index
      
      expect(json_response['stats']).to include(
        'total', 'unread', 'delivered', 'pending_delivery'
      )
    end

    it 'supports filtering by type' do
      create(:notification, notification_type: 'error')
      
      get :index, params: { type: 'error' }
      
      expect(json_response['notifications'].all? { |n| n['type'] == 'error' }).to be true
    end

    it 'supports filtering by delivered status' do
      create(:notification, :delivered)
      create(:notification, :pending_delivery)
      
      get :index, params: { delivered: 'true' }
      
      expect(json_response['notifications'].all? { |n| n['delivered'] == true }).to be true
    end
  end

  describe 'POST #create' do
    let(:notification_params) do
      {
        notification: {
          user_id: regular_user.id,
          title: 'Test Notification',
          message: 'Test message',
          notification_type: 'info',
          delivery_channels: ['in_app']
        }
      }
    end

    it 'creates notification' do
      expect {
        post :create, params: notification_params
      }.to change(Notification, :count).by(1)
      
      expect(response).to have_http_status(:created)
      expect(json_response['success']).to be true
    end

    it 'sets event_type to admin_message' do
      post :create, params: notification_params
      
      notification = Notification.last
      expect(notification.event_type).to eq('admin_message')
    end

    it 'validates message length' do
      long_message = 'a' * 2001
      params = notification_params.deep_dup
      params[:notification][:message] = long_message
      
      expect {
        post :create, params: params
      }.to raise_error(ActionController::BadRequest)
    end
  end

  describe 'POST #bulk' do
    let(:user_ids) { [regular_user.id] }
    let(:bulk_params) do
      {
        notification: {
          title: 'Bulk Test',
          message: 'Bulk message',
          notification_type: 'info'
        },
        user_ids: user_ids,
        delivery_channels: ['in_app']
      }
    end

    it 'creates bulk notifications' do
      expect {
        post :bulk, params: bulk_params
      }.to change(Notification, :count).by(1)
      
      expect(response).to have_http_status(:ok)
      expect(json_response['success']).to be true
    end

    it 'returns results with success/failure info' do
      post :bulk, params: bulk_params
      
      expect(json_response['results']).to be_an(Array)
      expect(json_response['results'].first['success']).to be true
    end

    it 'enforces rate limiting' do
      large_user_ids = (1..1001).to_a
      params = bulk_params.deep_dup
      params[:user_ids] = large_user_ids
      
      post :bulk, params: params
      
      expect(response).to have_http_status(:unprocessable_entity)
      expect(json_response['message']).to include('Too many users')
    end

    it 'validates empty user list' do
      params = bulk_params.deep_dup
      params[:user_ids] = []
      
      post :bulk, params: params
      
      expect(response).to have_http_status(:unprocessable_entity)
      expect(json_response['message']).to include('No users selected')
    end
  end

  describe 'GET #stats' do
    let!(:notifications) do
      [
        create(:notification, :unread),
        create(:notification, :read),
        create(:notification, :delivered),
        create(:notification, :pending_delivery)
      ]
    end

    it 'returns notification statistics' do
      get :stats
      
      expect(response).to have_http_status(:ok)
      expect(json_response['success']).to be true
      
      stats = json_response['stats']
      expect(stats['total']).to eq(4)
      expect(stats['unread']).to eq(1)
      expect(stats['delivered']).to eq(1)
      expect(stats['pending_delivery']).to eq(1)
    end
  end

  describe 'POST #cleanup' do
    let!(:old_notification) { create(:notification, created_at: 35.days.ago) }
    let!(:recent_notification) { create(:notification, created_at: 10.days.ago) }

    it 'cleans up old notifications' do
      expect {
        post :cleanup, params: { days: 30 }
      }.to change(Notification, :count).by(-1)
      
      expect(response).to have_http_status(:ok)
      expect(json_response['message']).to include('Cleaned up')
    end
  end

  describe 'authorization' do
    context 'when user is not admin' do
      before do
        allow(controller).to receive(:current_user).and_return(regular_user)
        allow(controller).to receive(:ensure_admin!).and_call_original
      end

      it 'denies access to admin endpoints' do
        get :index
        
        expect(response).to have_http_status(:forbidden)
        expect(json_response['message']).to include('Admin privileges required')
      end
    end
  end

  private

  def json_response
    JSON.parse(response.body)
  end
end
