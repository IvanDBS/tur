class Api::V1::BaseController < ApplicationController
  # Base controller for all API endpoints
  # Add common functionality here
  
  # Skip CSRF protection for API
  skip_before_action :verify_authenticity_token
  
  # Handle exceptions
  rescue_from StandardError, with: :handle_exception
  rescue_from ActiveRecord::RecordNotFound, with: :handle_not_found
  rescue_from ActiveRecord::RecordInvalid, with: :handle_validation_error
  
  protected
  
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
  
  def handle_exception(exception)
    Rails.logger.error "API Error: #{exception.class} - #{exception.message}"
    Rails.logger.error exception.backtrace.join("\n")
    
    render_error(
      'Internal server error',
      :internal_server_error,
      Rails.env.development? ? [exception.message] : []
    )
  end
  
  def handle_not_found(exception)
    render_error('Resource not found', :not_found)
  end
  
  def handle_validation_error(exception)
    render_error(
      'Validation failed',
      :unprocessable_entity,
      exception.record.errors.full_messages
    )
  end
end
