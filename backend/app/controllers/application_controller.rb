class ApplicationController < ActionController::API
  include Pagy::Backend

  # Enhanced logging for production
  before_action :set_request_id
  before_action :log_request_info

  private

  def set_request_id
    @request_id = request.headers['X-Request-ID'] || SecureRandom.uuid
    response.headers['X-Request-ID'] = @request_id
  end

  def log_request_info
    # Add request context to logs
    Rails.logger.tagged(
      request_id: @request_id,
      remote_ip: request.remote_ip,
      user_id: current_user&.id
    ) do
      Rails.logger.info "Request started: #{request.method} #{request.path}"
    end
  end
end
