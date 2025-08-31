module Api
  module V1
    class HealthController < Api::V1::BaseController
      def index
        render_success({
                         status: 'healthy',
                         timestamp: Time.current.iso8601,
                         version: '1.0.0'
                       }, 'Service is healthy')
      end
    end
  end
end
