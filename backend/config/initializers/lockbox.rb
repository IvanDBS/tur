# Lockbox configuration for encryption
Lockbox.master_key = ENV['LOCKBOX_MASTER_KEY'] || Rails.application.credentials.lockbox_master_key

# Generate master key if not present (development only)
if Rails.env.development? && Lockbox.master_key.blank?
  master_key = Lockbox.generate_key
  Rails.logger.warn "Generated Lockbox master key for development: #{master_key}"
  Rails.logger.warn "Add this to your .env file: LOCKBOX_MASTER_KEY=#{master_key}"
  Lockbox.master_key = master_key
end

# Configure encryption options
Lockbox.default_options = {
  encode: true,
  encode_prefix: "lbx:",
  encode_suffix: ""
}
