<template>
  <div class="page-layout">
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
  import SearchForm from '../components/SearchForm.vue'
  import SearchResults from '../components/SearchResults.vue'
  import { useSearchData } from '../composables/useSearchData'

  // State
  const searchResults = ref<any[]>([])
  const isSearching = ref(false)
  const hasMoreResults = ref(false)
  const currentSearchParams = ref(null)

  // Получаем методы поиска
  const { performSearch } = useSearchData()

  // Methods
  const handleSearch = async (searchParams: any) => {
    isSearching.value = true
    currentSearchParams.value = searchParams

    try {
      console.log('Searching with params:', searchParams)

      // Подготавливаем параметры для OBS API
      const obsSearchParams = {
        country: searchParams.destination?.id || 0,
        package_template: searchParams.package?.id || 0,
        airport_city_from: searchParams.departureCity?.id || 0,
        airport_city_to: searchParams.arrivalCity ? [searchParams.arrivalCity.id] : undefined,
        date_from: searchParams.checkInDate || searchParams.date || '',
        date_to: searchParams.checkOutDate || searchParams.date || '',
        nights_from: searchParams.nights || 6,
        nights_to: searchParams.nights2 || searchParams.nights || 6,
        adults: searchParams.adults || 2,
        children: searchParams.children || 0,
        children_age: searchParams.childrenAges || [],
        selected_hotels: searchParams.selectedHotels || [],
        meals: searchParams.selectedMeals?.map((id: number) => {
          // Получаем название питания по ID
          const meal = searchParams.meals?.find((m: any) => m.id === id)
          return meal?.name || ''
        }).filter(Boolean) || [],
        options: searchParams.selectedOptions?.map((id: number) => {
          // Получаем название опции по ID
          const option = searchParams.options?.find((o: any) => o.id === id)
          return option?.name || ''
        }).filter(Boolean) || [],
        price_from: searchParams.priceFrom || undefined,
        price_to: searchParams.priceTo || undefined
      }

      console.log('OBS search params:', obsSearchParams)

      // Выполняем поиск через OBS API
      const results = await performSearch(obsSearchParams)
      
      if (results && typeof results === 'object') {
        // Преобразуем результаты в нужный формат
        searchResults.value = Object.entries(results).map(([key, result]: [string, any]) => ({
          unique_key: key,
          rid: result.rid || key,
          accommodation: {
            hotel: {
              name: result.accommodation?.hotel?.name || 'Unknown Hotel',
              category: result.accommodation?.hotel?.category || 'Unknown',
              city: result.accommodation?.hotel?.city || 'Unknown City',
            },
            room: {
              name: result.accommodation?.room?.name || 'Standard Room',
            },
            meal: {
              full_name: result.accommodation?.meal?.full_name || 'Unknown Meal',
            },
          },
          dates: {
            check_in: result.dates?.check_in || '',
            check_out: result.dates?.check_out || '',
          },
          nights: {
            total: result.nights?.total || 0,
          },
          price: {
            amount: result.price?.amount || 0,
            currency: result.price?.currency || 'EUR',
            type: result.price?.type || 'Standard',
          },
          // Дополнительные данные для расширенного отображения
          tickets: result.tickets,
          transfers: result.transfers,
          additional_services: result.additional_services
        }))
        
        hasMoreResults.value = searchResults.value.length > 0
      } else {
        searchResults.value = []
        hasMoreResults.value = false
      }

    } catch (error) {
      console.error('Search failed:', error)
      searchResults.value = []
      hasMoreResults.value = false
    } finally {
      isSearching.value = false
    }
  }

  const handleBooking = (result: unknown) => {
    console.log('Booking result:', result)
    // TODO: Navigate to booking page or open booking modal
  }

  const loadMoreResults = async () => {
    if (!currentSearchParams.value) return

    try {
      // TODO: Implement pagination in OBS API
      console.log('Loading more results...')
      
      // For now, just show that there are no more results
      hasMoreResults.value = false
    } catch (error) {
      console.error('Failed to load more results:', error)
    }
  }
</script>

<style scoped>
  .search-form-wrapper {
    margin-bottom: 2rem;
  }
</style>
