# OBS API credentials model
class ObsCredential < ApplicationRecord
  # Encrypt sensitive data
  encrypts :encrypted_password, :refresh_token
  
  # Validations
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :encrypted_password, presence: true
  
  # Scopes
  scope :active, -> { where('expires_at IS NULL OR expires_at > ?', Time.current) }
  
  # Instance methods
  def expired?
    expires_at.present? && expires_at < Time.current
  end
  
  def active?
    !expired?
  end
end
