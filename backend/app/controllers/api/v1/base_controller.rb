class Api::V1::BaseController < ApplicationController
  # Base controller for all API endpoints
  # Add common functionality here
  
  private
  
  def render_success(data = {}, message = 'Success', status = :ok)
    render json: {
      success: true,
      message: message,
      data: data
    }, status: status
  end
  
  def render_error(message = 'Error', status = :unprocessable_entity, errors = [])
    render json: {
      success: false,
      message: message,
      errors: errors
    }, status: status
  end
end
