class AddIdorProtectionIndexes < ActiveRecord::Migration[8.0]
  def change
    # Add indexes for better IDOR protection performance
    
    # Search queries - ensure fast user-based lookups
    add_index :search_queries, [:user_id, :id], 
              name: 'index_search_queries_on_user_and_id'
    
    # Bookings - ensure fast user-based lookups (already exists but ensure it's optimized)
    # add_index :bookings, [:user_id, :id], name: 'index_bookings_on_user_and_id' # Already exists
    
    # Add composite index for status-based queries with user
    add_index :bookings, [:user_id, :status, :created_at], 
              name: 'index_bookings_on_user_status_created'
    
    # Add index for search queries by obs_search_id and user
    add_index :search_queries, [:user_id, :obs_search_id], 
              name: 'index_search_queries_on_user_and_obs_search_id'
  end
end
