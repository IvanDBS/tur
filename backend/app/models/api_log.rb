# API log model for debugging
class ApiLog < ApplicationRecord
  # Validations
  validates :endpoint, presence: true
  validates :status, presence: true, numericality: { in: 100..599 }

  # Scopes
  scope :by_endpoint, ->(endpoint) { where(endpoint: endpoint) }
  scope :by_status, ->(status) { where(status: status) }
  scope :errors, -> { where('status >= 400') }
  scope :recent, -> { order(created_at: :desc) }

  # Instance methods
  def success?
    status >= 200 && status < 300
  end

  def error?
    status >= 400
  end

  def duration
    return nil unless created_at

    Time.current - created_at
  end
end
