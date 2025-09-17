# frozen_string_literal: true

# Log Anonymization Middleware
# Automatically anonymizes personal data in Rails logs
class LogAnonymizationMiddleware
  def initialize(app)
    @app = app
  end

  def call(env)
    # Store original logger
    original_logger = Rails.logger
    
    # Create anonymized logger wrapper
    anonymized_logger = AnonymizedLogger.new(original_logger)
    
    # Temporarily replace Rails logger
    Rails.logger = anonymized_logger
    
    # Process request
    @app.call(env)
  ensure
    # Restore original logger
    Rails.logger = original_logger
  end

  # Custom logger that anonymizes log messages
  class AnonymizedLogger
    def initialize(original_logger)
      @original_logger = original_logger
    end

    def method_missing(method, *args, &block)
      if @original_logger.respond_to?(method)
        # Anonymize log messages
        anonymized_args = args.map { |arg| anonymize_log_argument(arg) }
        @original_logger.public_send(method, *anonymized_args, &block)
      else
        super
      end
    end

    def respond_to_missing?(method, include_private = false)
      @original_logger.respond_to?(method, include_private) || super
    end

    private

    def anonymize_log_argument(arg)
      case arg
      when String
        DataAnonymizationService.anonymize_string(arg)
      when Hash
        DataAnonymizationService.anonymize_log_entry(arg)
      else
        arg
      end
    end
  end
end
