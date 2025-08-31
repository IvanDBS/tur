# Authentication controller for Devise JWT
class Api::V1::AuthController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :authenticate_user!, only: [:me, :update_profile, :change_password]
  
  # POST /api/v1/auth/sign_up
  def sign_up
    @user = User.new(sign_up_params)
    
    if @user.save
      render json: {
        success: true,
        message: 'User registered successfully',
        user: {
          id: @user.id,
          email: @user.email,
          firstName: @user.first_name,
          lastName: @user.last_name,
          phone: @user.phone
        }
      }, status: :created
    else
      render json: {
        success: false,
        errors: @user.errors.full_messages
      }, status: :unprocessable_entity
    end
  end
  
  # POST /api/v1/auth/sign_in
  def sign_in
    @user = User.find_by(email: sign_in_params[:email])
    
    if @user&.valid_password?(sign_in_params[:password])
      render json: {
        success: true,
        message: 'Signed in successfully',
        user: {
          id: @user.id,
          email: @user.email,
          firstName: @user.first_name,
          lastName: @user.last_name,
          phone: @user.phone
        }
      }
    else
      render json: {
        success: false,
        errors: ['Invalid email or password']
      }, status: :unauthorized
    end
  end
  
  # DELETE /api/v1/auth/sign_out
  def sign_out
    # JWT tokens are stateless, so we just return success
    # In a real app, you might want to add the token to a blacklist
    render json: {
      success: true,
      message: 'Signed out successfully'
    }
  end
  
  # GET /api/v1/auth/me
  def me
    render json: {
      success: true,
      user: {
        id: current_user.id,
        email: current_user.email,
        firstName: current_user.first_name,
        lastName: current_user.last_name,
        phone: current_user.phone,
        createdAt: current_user.created_at,
        updatedAt: current_user.updated_at
      }
    }
  end
  
  # PUT /api/v1/auth/profile
  def update_profile
    if current_user.update(profile_params)
      render json: {
        success: true,
        user: {
          id: current_user.id,
          email: current_user.email,
          firstName: current_user.first_name,
          lastName: current_user.last_name,
          phone: current_user.phone,
          createdAt: current_user.created_at,
          updatedAt: current_user.updated_at
        }
      }
    else
      render json: {
        success: false,
        errors: current_user.errors.full_messages
      }, status: :unprocessable_entity
    end
  end
  
  # PUT /api/v1/auth/change_password
  def change_password
    if current_user.valid_password?(password_params[:current_password])
      if current_user.update(password: password_params[:new_password])
        render json: { success: true, message: 'Password updated successfully' }
      else
        render json: {
          success: false,
          errors: current_user.errors.full_messages
        }, status: :unprocessable_entity
      end
    else
      render json: {
        success: false,
        errors: ['Current password is incorrect']
      }, status: :unauthorized
    end
  end
  
  private
  
  def sign_up_params
    params.permit(:email, :password, :password_confirmation, :first_name, :last_name, :phone)
  end
  
  def sign_in_params
    params.permit(:email, :password)
  end
  
  def profile_params
    params.permit(:first_name, :last_name, :phone)
  end
  
  def password_params
    params.permit(:current_password, :new_password)
  end
end
