# frozen_string_literal: true

# Read Replica Support Concern
# Provides methods for using read replicas in models
module ReadReplicaSupport
  extend ActiveSupport::Concern

  class_methods do
    # Execute read operations on replica
    def on_replica(&block)
      if DatabaseReplicationService.replica_available?
        DatabaseReplicationService.with_replica_database(&block)
      else
        yield
      end
    end

    # Force read operations on primary database
    def on_primary(&block)
      DatabaseReplicationService.with_primary_database(&block)
    end

    # Find records using replica for better performance
    def find_on_replica(*args)
      on_replica { find(*args) }
    end

    # Find all records using replica
    def all_on_replica
      on_replica { all }
    end

    # Count records using replica
    def count_on_replica
      on_replica { count }
    end

    # Exists check using replica
    def exists_on_replica?(conditions = :none)
      on_replica { exists?(conditions) }
    end

    # Pluck using replica
    def pluck_on_replica(*args)
      on_replica { pluck(*args) }
    end

    # Select using replica
    def select_on_replica(*args)
      on_replica { select(*args) }
    end

    # Where clause using replica
    def where_on_replica(*args)
      on_replica { where(*args) }
    end

    # Order using replica
    def order_on_replica(*args)
      on_replica { order(*args) }
    end

    # Limit using replica
    def limit_on_replica(limit)
      on_replica { limit(limit) }
    end

    # Offset using replica
    def offset_on_replica(offset)
      on_replica { offset(offset) }
    end

    # Group using replica
    def group_on_replica(*args)
      on_replica { group(*args) }
    end

    # Having using replica
    def having_on_replica(*args)
      on_replica { having(*args) }
    end

    # Joins using replica
    def joins_on_replica(*args)
      on_replica { joins(*args) }
    end

    # Includes using replica
    def includes_on_replica(*args)
      on_replica { includes(*args) }
    end

    # Preload using replica
    def preload_on_replica(*args)
      on_replica { preload(*args) }
    end

    # Eager load using replica
    def eager_load_on_replica(*args)
      on_replica { eager_load(*args) }
    end

    # Left joins using replica
    def left_joins_on_replica(*args)
      on_replica { left_joins(*args) }
    end

    # Left outer joins using replica
    def left_outer_joins_on_replica(*args)
      on_replica { left_outer_joins(*args) }
    end

    # Distinct using replica
    def distinct_on_replica
      on_replica { distinct }
    end

    # Unscope using replica
    def unscope_on_replica(*args)
      on_replica { unscope(*args) }
    end

    # Reorder using replica
    def reorder_on_replica(*args)
      on_replica { reorder(*args) }
    end

    # Reverse order using replica
    def reverse_order_on_replica
      on_replica { reverse_order }
    end

    # First using replica
    def first_on_replica(limit = nil)
      on_replica { first(limit) }
    end

    # Last using replica
    def last_on_replica(limit = nil)
      on_replica { last(limit) }
    end

    # Take using replica
    def take_on_replica(limit = nil)
      on_replica { take(limit) }
    end

    # Sample using replica
    def sample_on_replica(n = nil)
      on_replica { sample(n) }
    end

    # Find by using replica
    def find_by_on_replica(*args)
      on_replica { find_by(*args) }
    end

    # Find or initialize by using replica
    def find_or_initialize_by_on_replica(*args)
      on_replica { find_or_initialize_by(*args) }
    end

    # Find or create by using replica
    def find_or_create_by_on_replica(*args)
      on_replica { find_or_create_by(*args) }
    end

    # Find or create by using replica with block
    def find_or_create_by_on_replica!(*args, &block)
      on_replica { find_or_create_by!(*args, &block) }
    end
  end

  # Instance methods
  def reload_on_replica
    self.class.on_replica { reload }
  end

  def association_on_replica(name)
    self.class.on_replica { association(name) }
  end
end
