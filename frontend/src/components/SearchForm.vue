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
  selectedHotels: []
})

const selectedFilters = ref<SelectedFilters>({
  regions: [],
  categories: [],
  hotels: [],
  meals: [],
  options: []
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
const handleSearch = (form: typeof searchForm.value, filters?: typeof selectedFilters.value) => {
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
      selectedCategories: filters?.categories || selectedFilters.value.categories,
      selectedMeals: filters?.meals || selectedFilters.value.meals,
      selectedOptions: filters?.options || selectedFilters.value.options,
      childrenAges: searchForm.value.childrenAges
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
    selectedHotels: []
  }
  selectedFilters.value = {
    regions: [],
    categories: [],
    hotels: [],
    meals: [],
    options: []
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
  max-width: 1154px;
  margin: 0 auto;
  padding: 12px 0;
  box-sizing: border-box;
}

/* ПРОСТЫЕ Multiselect overrides - только отступы! */
:deep(.multiselect) {
  border: 1px solid #DDDDDD !important;
  border-radius: 4px !important;
  font-family: var(--font-family) !important;
  min-height: 38px !important;
  height: 38px !important;
  position: relative !important;
  z-index: 10 !important;
}

:deep(.multiselect-wrapper) {
  padding-left: 10px !important; /* ОТСТУП СЛЕВА! */
  padding-right: 25px !important;
  padding-top: 10px !important;
  padding-bottom: 10px !important;
  min-height: 20px !important;
  height: 20px !important;
  line-height: 20px !important;
}

:deep(.multiselect-single-label),
:deep(.multiselect-placeholder) {
  font-size: 14px !important;
  line-height: 20px !important;
  height: 20px !important;
  margin: 0 !important;
  display: flex !important;
  align-items: center !important;
}

:deep(.multiselect-search) {
  padding-left: 10px !important;
}

:deep(.multiselect:focus-within) {
  border-color: var(--color-secondary) !important;
  box-shadow: 0 0 0 2px var(--color-secondary-muted) !important;
  z-index: 100 !important; /* Активный селектор поверх остальных */
}

:deep(.multiselect.is-open) {
  z-index: 100 !important; /* Открытый селектор поверх остальных */
}

/* Специфичные стили для multiselect в компактной форме */
.search-compact :deep(.multiselect) {
  z-index: 20 !important;
}

.search-compact :deep(.multiselect:focus-within),
.search-compact :deep(.multiselect.is-open) {
  z-index: 200 !important; /* Выше чем в расширенной форме */
}

.search-compact :deep(.multiselect-dropdown) {
  z-index: 2000 !important; /* Выше чем в расширенной форме */
}

:deep(.multiselect-dropdown) {
  z-index: 1000 !important;
  position: absolute !important;
}

/* Меняем зеленый цвет выбранного элемента на теплый серо-голубой */
:deep(.multiselect-option.is-selected) {
  background: rgba(26, 60, 97, 0.1) !important; /* Светлый темно-синий */
  color: var(--color-secondary) !important; /* Темно-синий для текста */
}

:deep(.multiselect-option.is-selected:hover) {
  background: rgba(26, 60, 97, 0.2) !important; /* Чуть темнее при hover */
}

:deep(.multiselect-option:hover) {
  background: #F7F9FA !important; /* Светло-серый при hover */
}

/* Меняем цвет тегов если используется multiple */
:deep(.multiselect-tag) {
  background: var(--color-secondary) !important; /* Темно-синий */
  color: white !important;
}

:deep(.multiselect-tag:hover) {
  background: var(--color-secondary-hover) !important; /* Темнее при hover */
}

/* Убираем все возможные зеленые цвета */
:deep(.multiselect-option.is-pointed) {
  background: #F7F9FA !important; /* Светло-серый при наведении */
  color: #222222 !important;
}

:deep(.multiselect) {
  --ms-option-color-selected: var(--color-secondary) !important;
  --ms-option-bg-selected: rgba(26, 60, 97, 0.1) !important;
  --ms-option-bg-selected-pointed: rgba(26, 60, 97, 0.2) !important;
  --ms-padding: 10px !important;
}

/* DatePicker overrides */
:deep(.dp__main) {
  width: 100% !important;
  font-family: var(--font-family) !important;
  position: relative;
  z-index: 50; /* Ниже чем multiselect */
}

:deep(.dp__input_wrap) {
  border: 1px solid #DDDDDD !important;
  border-radius: 4px !important;
  background: #FFFFFF !important;
  position: relative !important;
  min-height: 38px !important;
  height: 38px !important;
  display: flex !important;
  align-items: center !important;
  overflow: hidden !important;
}

:deep(.dp__input_wrap:focus-within) {
  border-color: var(--color-secondary) !important;
  box-shadow: 0 0 0 2px var(--color-secondary-muted) !important;
}

:deep(.dp__input) {
  border: none !important;
  padding: 4px 10px !important;
  font-size: 14px !important;
  font-weight: 400 !important;
  background: transparent !important;
  color: #222222 !important;
  font-family: var(--font-family) !important;
  height: 20px !important;
  line-height: 20px !important;
  box-sizing: border-box !important;
  width: 100% !important;
  text-overflow: ellipsis !important;
  overflow: hidden !important;
  white-space: nowrap !important;
}

:deep(.dp__input_icon) {
  display: none !important;
}

:deep(.dp__icon) {
  display: none !important;
}

:deep(.dp__calendar_icon) {
  display: none !important;
}

:deep(.dp__action_icon) {
  display: none !important;
}

:deep(.dp__input::placeholder) {
  color: #B0B0B0 !important;
}

:deep(.dp__menu) {
  border: 1px solid #DDDDDD !important;
  border-radius: 4px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
  margin-top: 2px !important;
  z-index: 500 !important; /* Ниже чем multiselect dropdown */
  position: absolute !important;
  background: white !important;
}

:deep(.dp__overlay_container) {
  z-index: 95 !important;
  position: fixed !important;
}

:deep(.dp__menu_wrapper) {
  z-index: 95 !important;
}

:deep(.dp__overlay) {
  z-index: 95 !important;
  position: fixed !important;
}

:deep(.dp__instance_calendar) {
  z-index: 95 !important;
}

/* Hide time picker and other unnecessary elements */
:deep(.dp__time_picker) {
  display: none !important;
}

:deep(.dp__action_buttons) {
  display: none !important;
}

:deep(.dp__select) {
  display: none !important;
}

:deep(.dp__today) {
  display: none !important;
}

:deep(.dp__clear_icon) {
  display: none !important;
}
</style>