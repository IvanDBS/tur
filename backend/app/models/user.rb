# User model for OBS API integration and Devise authentication
require 'jwt'

class User < ApplicationRecord
  # Include default devise modules
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :lockable, :timeoutable, :trackable

  # Include JWT authentication
  devise :jwt_authenticatable, jwt_revocation_strategy: JwtDenylist

  # Associations
  has_many :search_queries, dependent: :destroy
  has_many :bookings, dependent: :destroy

  # Encrypt sensitive data
  encrypts :obs_refresh_token, :obs_access_token

  # Validations
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :obs_user_id, presence: true, uniqueness: true

  # Callbacks
  before_validation :generate_obs_user_id, on: :create
  before_validation :set_uid, on: :create

  # Instance methods
  def generate_jwt
    Rails.cache.fetch("user_jwt_#{id}_#{updated_at.to_i}", expires_in: 12.hours) do
      jti = SecureRandom.uuid
      JWT.encode(
        {
          user_id: id,
          exp: 12.hours.from_now.to_i,
          iat: Time.current.to_i,
          jti: jti
        },
        Rails.application.credentials.secret_key_base
      )
    end
  end

  def generate_refresh_jwt
    jti = SecureRandom.uuid
    JWT.encode(
      {
        user_id: id,
        exp: 7.days.from_now.to_i,
        iat: Time.current.to_i,
        type: 'refresh',
        jti: jti
      },
      Rails.application.credentials.secret_key_base
    )
  end

  def obs_tokens_valid?
    obs_access_token.present? &&
      obs_refresh_token.present? &&
      obs_token_expires_at.present? &&
      obs_token_expires_at > Time.current
  end

  def refresh_obs_tokens!
    return false if obs_refresh_token.blank?

    begin
      response = ObsApiService.new.refresh_token(obs_refresh_token)

      update!(
        obs_access_token: response['access_token'],
        obs_refresh_token: response['refresh_token'],
        obs_token_expires_at: Time.current + response['expires_in'].seconds
      )

      true
    rescue ObsApiService::Error => e
      Rails.logger.error "Failed to refresh OBS tokens for user #{id}: #{e.message}"
      false
    end
  end

  def logout_from_obs!
    return false if obs_access_token.blank?

    begin
      ObsApiService.new.logout(obs_access_token)

      update!(
        obs_access_token: nil,
        obs_refresh_token: nil,
        obs_token_expires_at: nil
      )

      true
    rescue ObsApiService::Error => e
      Rails.logger.error "Failed to logout from OBS for user #{id}: #{e.message}"
      false
    end
  end

  private

  def generate_obs_user_id
    self.obs_user_id ||= SecureRandom.uuid
  end

  def set_uid
    self.uid = email if uid.blank?
  end
end
