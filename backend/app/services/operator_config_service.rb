# Operator Configuration Service
# Manages configuration for multiple tour operators
class OperatorConfigService
  include Singleton

  def initialize
    @config = load_config
  end

  # Get configuration for specific operator
  def self.config_for(operator_type)
    instance.config_for(operator_type)
  end

  # Get all available operators
  def self.available_operators
    instance.available_operators
  end

  # Get primary operator (fallback)
  def self.primary_operator
    instance.primary_operator
  end

  def config_for(operator_type)
    @config.dig('operators', operator_type.to_s) || {}
  end

  def available_operators
    @config.dig('operators', {}).keys
  end

  def primary_operator
    @config.dig('primary_operator') || 'obs'
  end

  # Check if operator is enabled
  def enabled?(operator_type)
    config_for(operator_type).dig('enabled') == true
  end

  # Get operator priority (for load balancing)
  def priority(operator_type)
    config_for(operator_type).dig('priority') || 1
  end

  # Get operator weight (for load balancing)
  def weight(operator_type)
    config_for(operator_type).dig('weight') || 1
  end

  # Get operator timeout settings
  def timeout(operator_type)
    config_for(operator_type).dig('timeout') || 30
  end

  # Get operator retry settings
  def retry_settings(operator_type)
    config_for(operator_type).dig('retry') || { max_retries: 3, base_delay: 1.0 }
  end

  # Get operator circuit breaker settings
  def circuit_breaker_settings(operator_type)
    config_for(operator_type).dig('circuit_breaker') || {
      failure_threshold: 5,
      recovery_timeout: 60,
      half_open_max_calls: 3
    }
  end

  private

  def load_config
    # Load from YAML file or environment variables
    if File.exist?(config_file_path)
      YAML.load_file(config_file_path)
    else
      load_from_environment
    end
  rescue StandardError => e
    Rails.logger.error "Failed to load operator config: #{e.message}"
    default_config
  end

  def config_file_path
    Rails.root.join('config', 'operators.yml')
  end

  def load_from_environment
    {
      'primary_operator' => ENV['PRIMARY_OPERATOR'] || 'obs',
      'operators' => {
        'obs' => {
          'enabled' => ENV['OBS_ENABLED'] != 'false',
          'name' => 'OBS',
          'base_url' => ENV['OBS_API_BASE_URL'] || 'https://test-v2.obs.md',
          'auth_type' => 'jwt',
          'priority' => 1,
          'weight' => 1,
          'timeout' => 30,
          'retry' => { 'max_retries' => 3, 'base_delay' => 1.0 },
          'circuit_breaker' => {
            'failure_threshold' => 5,
            'recovery_timeout' => 60,
            'half_open_max_calls' => 3
          }
        }
      }
    }
  end

  def default_config
    {
      'primary_operator' => 'obs',
      'operators' => {
        'obs' => {
          'enabled' => true,
          'name' => 'OBS',
          'base_url' => 'https://test-v2.obs.md',
          'auth_type' => 'jwt',
          'priority' => 1,
          'weight' => 1,
          'timeout' => 30,
          'retry' => { 'max_retries' => 3, 'base_delay' => 1.0 },
          'circuit_breaker' => {
            'failure_threshold' => 5,
            'recovery_timeout' => 60,
            'half_open_max_calls' => 3
          }
        }
      }
    }
  end
end
