# Pagy configuration
require 'pagy/extras/array'
require 'pagy/extras/headers'

# Pagy configuration
Pagy::DEFAULT[:items] = 10
Pagy::DEFAULT[:size] = 7
Pagy::DEFAULT[:max_items] = 1000  # Allow up to 1000 items per page
