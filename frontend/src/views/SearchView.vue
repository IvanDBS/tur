<template>
  <div class="search-page">
    <div class="container">
      <!-- Search Form -->
      <div class="search-form-wrapper">
        <SearchForm @search="handleSearch" />
      </div>
      
      <!-- Search Results -->
      <SearchResults 
        :results="searchResults"
        :isLoading="isSearching"
        :hasMore="hasMoreResults"
        @book="handleBooking"
        @loadMore="loadMoreResults"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SearchForm from '@/components/SearchForm.vue'
import SearchResults from '@/components/SearchResults.vue'

// State
const searchResults = ref([])
const isSearching = ref(false)
const hasMoreResults = ref(false)
const currentSearchParams = ref(null)

// Mock search results for demonstration
const mockResults = [
  {
    unique_key: "1",
    rid: "test1",
    accommodation: {
      hotel: {
        name: "ADALYA ARTSIDE HOTEL",
        category: "5* / HV1",
        city: "SIDE"
      },
      room: {
        name: "STANDARD ROOM LAND VIEW"
      },
      meal: {
        full_name: "ULTRA ALL INCLUSIVE"
      }
    },
    dates: {
      check_in: "2024-07-21",
      check_out: "2024-07-28"
    },
    nights: {
      total: 7
    },
    price: {
      amount: 1712,
      currency: "EUR",
      type: "EB до 31.07"
    }
  },
  {
    unique_key: "2", 
    rid: "test2",
    accommodation: {
      hotel: {
        name: "ADALYA OCEAN DELUXE",
        category: "5* / HV1", 
        city: "SIDE"
      },
      room: {
        name: "STANDARD ROOM LAND VIEW"
      },
      meal: {
        full_name: "ULTRA ALL INCLUSIVE"
      }
    },
    dates: {
      check_in: "2024-07-21",
      check_out: "2024-07-28"
    },
    nights: {
      total: 7
    },
    price: {
      amount: 1959,
      currency: "EUR",
      type: "EB до 31.07"
    }
  }
]

// Methods
const handleSearch = async (searchParams: any) => {
  isSearching.value = true
  currentSearchParams.value = searchParams
  
  try {
    // TODO: Replace with actual API call
    console.log('Searching with params:', searchParams)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    searchResults.value = mockResults
    hasMoreResults.value = true
    
  } catch (error) {
    console.error('Search failed:', error)
    searchResults.value = []
    hasMoreResults.value = false
  } finally {
    isSearching.value = false
  }
}

const handleBooking = (result: any) => {
  console.log('Booking result:', result)
  // TODO: Navigate to booking page or open booking modal
}

const loadMoreResults = async () => {
  if (!currentSearchParams.value) return
  
  try {
    // TODO: Load more results from API
    console.log('Loading more results...')
    
    // Simulate loading more
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // For demo, just add the same results again
    searchResults.value.push(...mockResults.slice(0, 1))
    hasMoreResults.value = false // No more results for demo
    
  } catch (error) {
    console.error('Failed to load more results:', error)
  }
}
</script>

<style scoped>
.search-page {
  min-height: calc(100vh - 72px - 200px); /* Вычитаем высоту хедера и футера */
  padding-top: 7rem;
  padding-bottom: 2rem;
  background: var(--color-background-soft);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.search-form-wrapper {
  margin-bottom: 2rem;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .search-page {
    min-height: calc(100vh - 64px - 200px);
    padding-top: 5rem;
    padding-bottom: 1rem;
  }
  
  .container {
    padding: 0 1rem;
  }
}
</style>
