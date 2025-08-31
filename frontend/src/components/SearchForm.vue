<template>
  <div class="search-container">
    <!-- Compact Search Form -->
    <CompactSearchForm
      v-if="!isExpanded"
      v-model="searchForm"
      :departure-cities="searchData.departureCities.value"
      :countries="searchData.countries.value"
      :nights-options="searchData.nightsOptions.value"
      :adults-options="searchData.adultsOptions.value"
      :children-options="searchData.childrenOptions.value"
      :children-age-options="searchData.childrenAgeOptions.value"
      @search="handleSearch"
      @expand="toggleExpanded"
    />

    <!-- Expanded Search Form -->
    <ExpandedSearchForm
      v-else
      v-model="searchForm"
      :selected-filters="selectedFilters"
      :departure-cities="searchData.departureCities.value"
      :countries="searchData.countries.value"
      :packages="searchData.packages.value"
      :arrival-cities="searchData.arrivalCities.value"
      :nights-options="searchData.nightsOptions.value"
      :adults-options="searchData.adultsOptions.value"
      :children-options="searchData.childrenOptions.value"
      :children-age-options="searchData.childrenAgeOptions.value"
      :regions="searchData.regions.value"
      :categories="searchData.categories.value"
      :hotels="searchData.hotels.value"
      :meals="searchData.meals.value"
      :options="searchData.options.value"
      @search="handleSearch"
      @reset="handleReset"
      @collapse="toggleExpanded"
      @update:selected-filters="selectedFilters = $event"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import CompactSearchForm from './search/CompactSearchForm.vue'
  import ExpandedSearchForm from './search/ExpandedSearchForm.vue'
  import { useSearchData } from '../composables/useSearchData'
  import type { SearchForm, SelectedFilters } from '../types/search'

  // Reactive data
  const searchForm = ref<SearchForm>({
    departureCity: null,
    destination: null,
    package: null,
    arrivalCity: null,
    date: null,
    checkInDate: null,
    checkOutDate: null,
    nights: 6,
    nights2: 6,
    adults: 2,
    children: 0,
    childrenAges: [],
    priceFrom: null,
    priceTo: null,
    selectedHotels: [],
  })

  const selectedFilters = ref<SelectedFilters>({
    regions: [],
    categories: [],
    hotels: [],
    meals: [],
    options: [],
  })

  const isExpanded = ref(false)
  const isLoading = ref(false)

  // Получаем данные из composable
  const searchData = useSearchData()

  // Emits
  const emit = defineEmits<{
    search: [params: Record<string, unknown>]
  }>()

  // Methods
  const handleSearch = (
    form: typeof searchForm.value,
    filters?: typeof selectedFilters.value
  ) => {
    // Добавляем выбранные отели в форму поиска
    searchForm.value.selectedHotels = [...selectedFilters.value.hotels]

    console.log('Searching with params:', form)
    console.log('Selected filters:', filters || selectedFilters.value)
    console.log('Children ages:', searchForm.value.childrenAges)

    // После поиска всегда показываем компактную форму
    isExpanded.value = false

    isLoading.value = true
    setTimeout(() => {
      isLoading.value = false
      emit('search', {
        ...form,
        selectedRegions: filters?.regions || selectedFilters.value.regions,
        selectedCategories:
          filters?.categories || selectedFilters.value.categories,
        selectedMeals: filters?.meals || selectedFilters.value.meals,
        selectedOptions: filters?.options || selectedFilters.value.options,
        childrenAges: searchForm.value.childrenAges,
      })
    }, 1000)
  }

  const handleReset = () => {
    searchForm.value = {
      departureCity: null,
      destination: null,
      package: null,
      arrivalCity: null,
      date: null,
      checkInDate: null,
      checkOutDate: null,
      nights: 6,
      nights2: 6,
      adults: 2,
      children: 0,
      childrenAges: [],
      priceFrom: null,
      priceTo: null,
      selectedHotels: [],
    }
    selectedFilters.value = {
      regions: [],
      categories: [],
      hotels: [],
      meals: [],
      options: [],
    }
  }

  const toggleExpanded = () => {
    isExpanded.value = !isExpanded.value
  }
</script>

<style scoped>
  /* Search Form Container */
  .search-container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 12px 0;
    box-sizing: border-box;
  }
</style>
