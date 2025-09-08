<template>
  <div class="search-container">
    <div class="search-form">
      <!-- Loading Indicator -->
      <Suspense>
        <template #default>
          <SearchFormLoading v-if="isLoading" />
        </template>
        <template #fallback>
          <div class="loading-placeholder">Загрузка...</div>
        </template>
      </Suspense>

      <!-- Form Fields -->
      <Suspense>
        <template #default>
          <SearchFormFields 
            :search-form="searchForm"
            :selected-filters="selectedFilters"
            :active-selector="activeSelector"
            :is-loading="isLoading"
            :search-data="searchData"
            :filtered-nights2-options="filteredNights2Options"
            :dynamic-nights-options="dynamicNightsOptions"
            :calendar-hints="calendarHints"
            @update:search-form="searchForm = $event"
            @update:selected-filters="selectedFilters = $event"
            @update-nights2-min="updateNights2Min"
          />
        </template>
        <template #fallback>
          <div class="loading-placeholder">Загрузка полей формы...</div>
        </template>
      </Suspense>

      <!-- Filters Section -->
      <div :class="{ 'disabled-field': searchForm.children === null }">
        <Suspense>
          <template #default>
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
          </template>
          <template #fallback>
            <div class="loading-placeholder">Загрузка фильтров...</div>
          </template>
        </Suspense>
      </div>

      <!-- Action Buttons -->
      <Suspense>
        <template #default>
          <SearchFormActions
            :has-results="!!(searchResults && Object.keys(searchResults).length > 0)"
            :total-results="totalResults"
            :is-loading="isLoading"
            @search="handleSearchWithEmit"
            @reset="handleReset"
          />
        </template>
        <template #fallback>
          <div class="loading-placeholder">Загрузка кнопок...</div>
        </template>
      </Suspense>
    </div>

    <!-- Результаты поиска -->
    <div v-if="searchResults && Object.keys(searchResults).length > 0" class="search-results-section">
      <Suspense>
        <template #default>
          <SearchResults 
            :results="paginatedResults" 
            :is-loading="isLoading"
            :is-loading-more="isLoadingMore"
            :current-page="currentPage"
            :total-pages="totalPages"
            :prev-page="currentPage > 1 ? currentPage - 1 : null"
            :next-page="currentPage < totalPages ? currentPage + 1 : null"
            @book="handleBook"
            @page-change="handlePageChange"
            @save-search-state="saveSearchState"
          />
        </template>
        <template #fallback>
          <div class="loading-placeholder">Загрузка результатов...</div>
        </template>
      </Suspense>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { defineAsyncComponent, onMounted } from 'vue'
  import { useSearchForm } from '../composables/useSearchForm'
  
  // Используем defineAsyncComponent с правильной конфигурацией
  const SearchFilters = defineAsyncComponent(() => import('./search/SearchFilters.vue'))
  const SearchFormLoading = defineAsyncComponent(() => import('./search/SearchFormLoading.vue'))
  const SearchFormFields = defineAsyncComponent(() => import('./search/SearchFormFields.vue'))
  const SearchFormActions = defineAsyncComponent(() => import('./search/SearchFormActions.vue'))
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
    dynamicNightsOptions,
    paginatedResults,
    isLoadingMore,
    needsMoreData,
    searchData,
    calendarHints,
    handleSearch,
    handleReset,
    updateNights2Min,
    handlePageChange,
    handleBook,
    initializeData,
    loadMoreData,
    saveSearchState,
  } = useSearchForm()

  // Emits
  const emit = defineEmits<{
    search: [params: Record<string, unknown>]
  }>()

  // Переопределяем handleSearch для эмита события
  const originalHandleSearch = handleSearch
  const handleSearchWithEmit = async () => {
    console.log('🔍 Search button clicked, starting search...')
    try {
      await originalHandleSearch()
      console.log('✅ Search completed, emitting search event')
      // Эмитим событие после поиска (независимо от результатов)
      emit('search', searchForm.value)
    } catch (error) {
      console.error('❌ Search failed:', error)
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
  
  .loading-placeholder {
    padding: 20px;
    text-align: center;
    color: #666;
    font-size: 14px;
    background: #f9f9f9;
    border-radius: 8px;
    margin: 10px 0;
  }
</style>
