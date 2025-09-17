class ApplicationRecord < ActiveRecord::Base
  primary_abstract_class
  
  # Include read replica support for all models
  include ReadReplicaSupport
end
