# frozen_string_literal: true

# JsonFieldSupport Concern
# Provides methods for handling JSON fields with caching and validation
module JsonFieldSupport
  extend ActiveSupport::Concern

  class_methods do
    # Define JSON field with caching support
    def json_field(field_name, cache_expires_in: 1.hour)
      # Define getter method
      define_method("#{field_name}_hash") do
        instance_variable_get("@#{field_name}_hash") || begin
          cache_key = "#{self.class.name.downcase}_#{field_name}_#{id}_#{updated_at.to_i}"
          Rails.cache.fetch(cache_key, expires_in: cache_expires_in) do
            value = send(field_name)
            parsed = case value
                     when String
                       JSON.parse(value)
                     when Hash, Array
                       value
                     else
                       {}
                     end
            parsed || {}
          rescue StandardError
            {}
          end
        end
      end

      # Define setter method
      define_method("#{field_name}_hash=") do |hash|
        send("#{field_name}=", hash.to_json)
        instance_variable_set("@#{field_name}_hash", hash)
      end

      # Define cache invalidation method
      define_method("invalidate_#{field_name}_cache") do
        instance_variable_set("@#{field_name}_hash", nil)
        cache_key = "#{self.class.name.downcase}_#{field_name}_#{id}_#{updated_at.to_i}"
        Rails.cache.delete(cache_key)
      end
    end
  end

  # Instance method to invalidate all JSON field caches
  def invalidate_all_json_caches
    self.class.reflect_on_all_associations.each do |association|
      if association.macro == :belongs_to || association.macro == :has_one
        next
      end
    end

    # Find all JSON fields and invalidate their caches
    self.class.columns.each do |column|
      if column.type == :json || column.type == :jsonb
        send("invalidate_#{column.name}_cache") if respond_to?("invalidate_#{column.name}_cache")
      end
    end
  end

  # Callback to invalidate caches when record is updated
  def invalidate_json_caches_on_update
    invalidate_all_json_caches
  end
end
