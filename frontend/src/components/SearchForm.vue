<template>
  <div class="search-container">
    <div class="search-form">
      <!-- Loading Indicator -->
      <SearchFormLoading v-if="isLoading" />

      <!-- Form Fields -->
      <SearchFormFields 
        :search-form="searchForm"
        :selected-filters="selectedFilters"
        :active-selector="activeSelector"
        :is-loading="isLoading"
        :search-data="searchData"
        :filtered-nights2-options="filteredNights2Options"
        @update:search-form="searchForm = $event"
        @update:selected-filters="selectedFilters = $event"
        @update-nights2-min="updateNights2Min"
      />

      <!-- Filters Section -->
      <div :class="{ 'disabled-field': searchForm.children === null }">
        <SearchFilters
          :regions="searchData.regions.value"
          :categories="searchData.categories.value"
          :hotels="searchData.hotels.value"
          :meals="searchData.meals.value"
          :options="searchData.options.value"
          :selected-regions="selectedFilters.regions"
          :selected-categories="selectedFilters.categories"
          :selected-hotels="selectedFilters.hotels"
          :selected-meals="selectedFilters.meals"
          :selected-options="selectedFilters.options"
          :disabled="searchForm.children === null"
          @update:regions="selectedFilters.regions = $event"
          @update:categories="selectedFilters.categories = $event"
          @update:hotels="selectedFilters.hotels = $event"
          @update:meals="selectedFilters.meals = $event"
          @update:options="selectedFilters.options = $event"
        />
      </div>

      <!-- Action Buttons -->
      <SearchFormActions
        :has-results="!!(searchResults && Object.keys(searchResults).length > 0)"
        :total-results="totalResults"
        :is-loading="isLoading"
        @search="handleSearchWithEmit"
        @reset="handleReset"
      />
    </div>

    <!-- Результаты поиска -->
    <div v-if="searchResults && Object.keys(searchResults).length > 0" class="search-results-section">
      <SearchResults 
        :results="formattedResults" 
        :is-loading="isLoading"
        :current-page="currentPage"
        :total-pages="totalPages"
        :prev-page="currentPage > 1 ? currentPage - 1 : null"
        :next-page="currentPage < totalPages ? currentPage + 1 : null"
        @book="handleBook"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { defineAsyncComponent, onMounted } from 'vue'
  import { useSearchForm } from '../composables/useSearchForm'
  const SearchFilters = defineAsyncComponent(() => import('./search/SearchFilters.vue'))
  const SearchFormLoading = defineAsyncComponent(() => import('./search/SearchFormLoading.vue'))
  const SearchFormFields = defineAsyncComponent(() => import('./search/SearchFormFields.vue'))
  const SearchFormActions = defineAsyncComponent(() => import('./search/SearchFormActions.vue'))
  // Динамический импорт для обхода проблемы с TypeScript
  const SearchResults = defineAsyncComponent(() => import('./SearchResults.vue'))
  import '../styles/spinner.css'
  import '../styles/components/search-form.css'

  // Используем композабл для всей логики формы
  const {
    searchForm,
    selectedFilters,
    isLoading,
    searchResults,
    totalResults,
    currentPage,
    totalPages,
    formattedResults,
    activeSelector,
    filteredNights2Options,
    searchData,
    handleSearch,
    handleReset,
    updateNights2Min,
    handlePageChange,
    handleBook,
    initializeData,
  } = useSearchForm()

  // Emits
  const emit = defineEmits<{
    search: [params: Record<string, unknown>]
  }>()

  // Переопределяем handleSearch для эмита события
  const originalHandleSearch = handleSearch
  const handleSearchWithEmit = () => {
    originalHandleSearch()
    // Эмитим событие после успешного поиска
    if (searchResults.value && Object.keys(searchResults.value).length > 0) {
      emit('search', searchForm.value)
    }
  }

  // Инициализация данных при монтировании компонента
  onMounted(async () => {
    await initializeData()
  })
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

  /* Loading Overlay */
  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    border-radius: 8px;
  }


  /* Search Form */
  .search-form {
    background: #ffffff;
    border: 1px solid #dddddd;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 24px;
    position: relative;
  }

  /* Стили перенесены в search-form.css */
</style>
