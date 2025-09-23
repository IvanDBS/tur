require 'rails_helper'

RSpec.describe Api::V1::NotificationsController, type: :controller do
  let(:user) { create(:user) }
  let(:notification) { create(:notification, user: user) }
  let(:other_user) { create(:user) }
  let(:other_notification) { create(:notification, user: other_user) }

  before do
    # Mock JWT authentication
    allow(controller).to receive(:authenticate_user!).and_return(true)
    allow(controller).to receive(:current_user).and_return(user)
  end

  describe 'GET #index' do
    let!(:notifications) { create_list(:notification, 5, user: user) }

    it 'returns user notifications' do
      get :index
      
      expect(response).to have_http_status(:ok)
      expect(json_response['success']).to be true
      expect(json_response['notifications']).to be_an(Array)
      expect(json_response['notifications'].length).to eq(5)
    end

    it 'includes pagination info' do
      get :index
      
      expect(json_response['pagination']).to include(
        'current_page', 'total_pages', 'total_count', 'per_page'
      )
    end

    it 'includes unread count' do
      create(:notification, :unread, user: user)
      create(:notification, :read, user: user)
      
      get :index
      
      expect(json_response['unread_count']).to eq(6) # 5 from let! + 1 unread
    end

    it 'supports pagination' do
      get :index, params: { page: 2, per_page: 2 }
      
      expect(json_response['pagination']['current_page']).to eq(2)
      expect(json_response['pagination']['per_page']).to eq(2)
    end
  end

  describe 'GET #show' do
    it 'returns specific notification' do
      get :show, params: { id: notification.id }
      
      expect(response).to have_http_status(:ok)
      expect(json_response['success']).to be true
      expect(json_response['notification']['id']).to eq(notification.id)
    end

    it 'returns 404 for non-existent notification' do
      get :show, params: { id: 99999 }
      
      expect(response).to have_http_status(:not_found)
      expect(json_response['success']).to be false
    end

    it 'returns 404 for other user notification' do
      get :show, params: { id: other_notification.id }
      
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'PATCH #mark_read' do
    let(:unread_notification) { create(:notification, :unread, user: user) }

    it 'marks notification as read' do
      patch :mark_read, params: { id: unread_notification.id }
      
      expect(response).to have_http_status(:ok)
      expect(json_response['success']).to be true
      expect(unread_notification.reload.read_at).to be_present
    end

    it 'returns 404 for other user notification' do
      patch :mark_read, params: { id: other_notification.id }
      
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'PATCH #mark_all_read' do
    let!(:unread_notifications) { create_list(:notification, 3, :unread, user: user) }

    it 'marks all user notifications as read' do
      patch :mark_all_read
      
      expect(response).to have_http_status(:ok)
      expect(json_response['success']).to be true
      
      unread_notifications.each do |notification|
        expect(notification.reload.read_at).to be_present
      end
    end
  end

  describe 'DELETE #destroy' do
    it 'deletes user notification' do
      expect {
        delete :destroy, params: { id: notification.id }
      }.to change(Notification, :count).by(-1)
      
      expect(response).to have_http_status(:ok)
      expect(json_response['success']).to be true
    end

    it 'returns 404 for other user notification' do
      expect {
        delete :destroy, params: { id: other_notification.id }
      }.not_to change(Notification, :count)
      
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'GET #unread_count' do
    let!(:unread_notifications) { create_list(:notification, 3, :unread, user: user) }
    let!(:read_notifications) { create_list(:notification, 2, :read, user: user) }

    it 'returns unread count' do
      get :unread_count
      
      expect(response).to have_http_status(:ok)
      expect(json_response['success']).to be true
      expect(json_response['unread_count']).to eq(3)
    end
  end

  private

  def json_response
    JSON.parse(response.body)
  end
end
