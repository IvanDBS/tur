class Api::V1::Admin::UsersController < Api::V1::BaseController
  before_action :authenticate_user!
  before_action :ensure_admin!
  before_action :set_user, only: [:show, :update, :destroy]

  # GET /api/v1/admin/users
  def index
    users = User.includes(:bookings, :search_queries)
    
    # Apply filters
    users = users.where(admin: true) if params[:role] == 'admin'
    users = users.where(admin: false) if params[:role] == 'user'
    users = users.where(banned: true) if params[:status] == 'banned'
    users = users.where(banned: false) if params[:status] == 'active'
    
    # Search

    if params[:search].present?
      search_term = "%#{params[:search]}%"
      users = users.where(
        "email ILIKE ? OR first_name ILIKE ? OR last_name ILIKE ?",
        search_term, search_term, search_term
      )
    end
    
    # Sorting
    sort_field = params[:sort_field] || 'created_at'
    sort_direction = params[:sort_direction] == 'asc' ? :asc : :desc
    
    # Validate sort field
    allowed_sort_fields = %w[id email first_name last_name created_at last_sign_in_at sign_in_count]
    sort_field = 'created_at' unless allowed_sort_fields.include?(sort_field)
    
    users = users.order(sort_field => sort_direction)
    
    # Pagination
    page = params[:page]&.to_i || 1
    per_page = params[:per_page]&.to_i || 20
    per_page = [per_page, 100].min # Limit max per page
    
    total_count = users.count
    users = users.offset((page - 1) * per_page).limit(per_page)
    
    # Build response data
    users_data = users.map do |user|
      {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        admin: user.admin,
        banned: user.banned,
        created_at: user.created_at.iso8601,
        last_sign_in_at: user.last_sign_in_at&.iso8601,
        sign_in_count: user.sign_in_count,
        bookings_count: user.bookings.count,
        search_queries_count: user.search_queries.count
      }
    end
    
    total_pages = (total_count.to_f / per_page).ceil
    
    render json: {
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users: users_data,
        pagination: {
          current_page: page,
          total_pages: total_pages,
          total_count: total_count,
          per_page: per_page
        }
      }
    }
  end

  # GET /api/v1/admin/users/:id
  def show
    user_data = {
      id: @user.id,
      email: @user.email,
      first_name: @user.first_name,
      last_name: @user.last_name,
      phone: @user.phone,
      admin: @user.admin,
      banned: @user.banned,
      created_at: @user.created_at.iso8601,
      last_sign_in_at: @user.last_sign_in_at&.iso8601,
      sign_in_count: @user.sign_in_count,
      bookings_count: @user.bookings.count,
      search_queries_count: @user.search_queries.count
    }
    
    render json: {
      success: true,
      message: 'User retrieved successfully',
      data: {
        user: user_data
      }
    }
  end

  # PATCH/PUT /api/v1/admin/users/:id
  def update
    # Prevent admin from removing their own admin rights
    if @user == @current_user && params[:admin] == false
      render json: {
        success: false,
        message: 'You cannot remove admin rights from yourself'
      }, status: :unprocessable_entity
      return
    end
    
    # Prevent admin from banning themselves
    if @user == @current_user && params[:banned] == true
      render json: {
        success: false,
        message: 'You cannot ban yourself'
      }, status: :unprocessable_entity
      return
    end
    
    if @user.update(user_params)
      user_data = {
        id: @user.id,
        email: @user.email,
        first_name: @user.first_name,
        last_name: @user.last_name,
        phone: @user.phone,
        admin: @user.admin,
        banned: @user.banned,
        created_at: @user.created_at.iso8601,
        last_sign_in_at: @user.last_sign_in_at&.iso8601,
        sign_in_count: @user.sign_in_count,
        bookings_count: @user.bookings.count,
        search_queries_count: @user.search_queries.count
      }
      
      render json: {
        success: true,
        message: 'User updated successfully',
        data: {
          user: user_data
        }
      }
    else
      render json: {
        success: false,
        message: 'Failed to update user',
        errors: @user.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/admin/users/:id
  def destroy
    # Prevent admin from deleting themselves
    if @user == @current_user
      render json: {
        success: false,
        message: 'You cannot delete yourself'
      }, status: :unprocessable_entity
      return
    end
    
    if @user.destroy
      render json: {
        success: true,
        message: 'User deleted successfully'
      }
    else
      render json: {
        success: false,
        message: 'Failed to delete user',
        errors: @user.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  private

  def set_user
    @user = User.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: {
      success: false,
      message: 'User not found'
    }, status: :not_found
  end

  def user_params
    params.permit(:admin, :banned)
  end

  def ensure_admin!
    unless @current_user&.admin?
      render_error('Access denied. Admin privileges required.', :forbidden)
    end
  end
end
