<template>
  <div class="search-container">
    <!-- Compact Search Form -->
    <CompactSearchForm
      v-if="!isExpanded"
      v-model="compactForm"
      @search="handleSearch"
      @expand="toggleExpanded"
    />

    <!-- Expanded Search Form -->
    <ExpandedSearchForm
      v-else
      v-model="expandedForm"
      :selected-filters="selectedFilters"
      :departure-cities="searchData.departureCitiesOptions.value"
      :countries="searchData.countriesOptions.value"
      :packages="searchData.packagesOptions.value"
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
  import { ref, onMounted, watch } from 'vue'
  import CompactSearchForm from './search/CompactSearchForm.vue'
  import ExpandedSearchForm from './search/ExpandedSearchForm.vue'
  import { useSearchData } from '../composables/useSearchData'
  import type { SearchForm, SelectedFilters, CompactSearchForm as CompactForm, ExpandedSearchForm as ExpandedForm } from '../types/search'

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

  // Создаем объекты для каждой формы
  const compactForm = ref<CompactForm>({
    departureCity: null,
    destination: null,
    package: null,
    date: null,
    nights: 6,
    adults: 2,
    children: 0,
    childrenAges: [],
  })

  const expandedForm = ref<ExpandedForm>({
    departureCity: null,
    destination: null,
    package: null,
    arrivalCity: null,
    checkInDate: null,
    checkOutDate: null,
    nights: 6,
    nights2: 6,
    adults: 2,
    children: 0,
    childrenAges: [],
    priceFrom: null,
    priceTo: null,
  })

  // Синхронизируем формы с основным searchForm
  watch(compactForm, (newForm) => {
    searchForm.value = { ...searchForm.value, ...newForm }
  }, { deep: true })

  watch(expandedForm, (newForm) => {
    searchForm.value = { ...searchForm.value, ...newForm }
  }, { deep: true })

  // Инициализация данных при монтировании
  onMounted(async () => {
    try {
      await searchData.initializeData()
      console.log('Search data initialized')
    } catch (err) {
      console.error('Failed to initialize search data:', err)
    }
  })

  // Emits
  const emit = defineEmits<{
    search: [params: Record<string, unknown>]
  }>()

  // Methods
  const handleSearch = () => {
    // Добавляем выбранные отели в форму поиска
    searchForm.value.selectedHotels = [...selectedFilters.value.hotels]

    console.log('Searching with params:', searchForm.value)
    console.log('Selected filters:', selectedFilters.value)
    console.log('Children ages:', searchForm.value.childrenAges)

    // После поиска всегда показываем компактную форму
    isExpanded.value = false

    isLoading.value = true
    setTimeout(() => {
      isLoading.value = false
      emit('search', {
        ...searchForm.value,
        selectedRegions: selectedFilters.value.regions,
        selectedCategories: selectedFilters.value.categories,
        selectedMeals: selectedFilters.value.meals,
        selectedOptions: selectedFilters.value.options,
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
    if (isExpanded.value) {
      // Сворачиваем форму - синхронизируем compactForm с searchForm
      compactForm.value = {
        departureCity: searchForm.value.departureCity || null,
        destination: searchForm.value.destination || null,
        package: searchForm.value.package || null,
        date: searchForm.value.date || null,
        nights: searchForm.value.nights || 6,
        adults: searchForm.value.adults || 2,
        children: searchForm.value.children || 0,
        childrenAges: searchForm.value.childrenAges || [],
      }
    } else {
      // Разворачиваем форму - синхронизируем expandedForm с searchForm
      expandedForm.value = {
        departureCity: searchForm.value.departureCity || null,
        destination: searchForm.value.destination || null,
        package: searchForm.value.package || null,
        arrivalCity: searchForm.value.arrivalCity || null,
        checkInDate: searchForm.value.checkInDate || null,
        checkOutDate: searchForm.value.checkOutDate || null,
        nights: searchForm.value.nights || 6,
        nights2: searchForm.value.nights2 || 6,
        adults: searchForm.value.adults || 2,
        children: searchForm.value.children || 0,
        childrenAges: searchForm.value.childrenAges || [],
        priceFrom: searchForm.value.priceFrom || null,
        priceTo: searchForm.value.priceTo || null,
      }
    }
    isExpanded.value = !isExpanded.value
  }

  // Явный экспорт для TypeScript
  defineExpose({})
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
