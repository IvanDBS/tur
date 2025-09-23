import { ref, nextTick } from 'vue'
import { logger } from '../utils/logger'
import type { SearchForm, SelectedFilters } from '../types/search'

export const useSearchState = () => {
  // Reactive data
  const searchForm = ref<SearchForm>({
    departureCity: null,
    destination: null,
    package: null,
    arrivalCity: null,
    date: null,
    checkInDate: null,
    checkOutDate: null,
    nights: null,
    nights2: null,
    adults: null,
    children: null,
    childrenAges: [],
    priceFrom: null,
    priceTo: null,
    selectedHotels: [],
  })

  const isLoading = ref(false)
  const searchResults = ref<Record<string, unknown> | null>(null)
  const totalResults = ref(0)

  // Сохранение состояния поиска
  const saveSearchState = (state: {
    searchForm: SearchForm
    selectedFilters: SelectedFilters
    searchResults: Record<string, unknown> | null
    allLoadedResults: Record<string, unknown> | null
    totalResults: number
    currentPage: number
    lastSearchParams: Record<string, unknown> | null
    loadedPages: number[]
  }) => {
    try {
      const searchState = {
        ...state,
        timestamp: Date.now()
      }
      
      console.log('🔍 Saving to sessionStorage:', {
        hasLastSearchParams: !!state?.lastSearchParams,
        lastSearchParams: state?.lastSearchParams,
        keys: Object.keys(searchState)
      })
      
      sessionStorage.setItem('searchState', JSON.stringify(searchState))
      logger.info('💾 Search state saved to sessionStorage')
    } catch (error) {
      logger.warn('Failed to save search state:', error)
    }
  }

  // Восстановление состояния поиска
  const restoreSearchState = () => {
    try {
      const savedState = sessionStorage.getItem('searchState')
      if (!savedState) {
        logger.info('No saved search state found')
        return null
      }

      const searchState = JSON.parse(savedState)
      
      // Проверяем, что состояние не слишком старое (например, не старше 1 часа)
      const maxAge = 60 * 60 * 1000 // 1 час
      if (Date.now() - searchState.timestamp > maxAge) {
        logger.info('Saved search state is too old, ignoring')
        sessionStorage.removeItem('searchState')
        return null
      }

      logger.info('🔄 Search state restored from sessionStorage')
      return searchState
    } catch (error) {
      logger.warn('Failed to restore search state:', error)
      sessionStorage.removeItem('searchState')
      return null
    }
  }

  // Очистка сохраненного состояния
  const clearSearchState = () => {
    try {
      sessionStorage.removeItem('searchState')
      logger.info('🗑️ Search state cleared from sessionStorage')
    } catch (error) {
      logger.warn('Failed to clear search state:', error)
    }
  }

  // Сброс формы поиска
  const resetSearchForm = async () => {
    try {
      // Используем nextTick для безопасного обновления компонентов
      await nextTick()
      
      searchForm.value = {
        departureCity: null,
        destination: null,
        package: null,
        arrivalCity: null,
        date: null,
        checkInDate: null,
        checkOutDate: null,
        nights: null,
        nights2: null,
        adults: null,
        children: null,
        childrenAges: [],
        priceFrom: null,
        priceTo: null,
        selectedHotels: [],
      }
      
      // Очищаем результаты поиска
      searchResults.value = null
      totalResults.value = 0
      
      // Очищаем сохраненное состояние
      clearSearchState()
    } catch (error) {
      logger.error('Error in resetSearchForm:', error)
    }
  }

  return {
    // State
    searchForm,
    isLoading,
    searchResults,
    totalResults,
    
    // Methods
    saveSearchState,
    restoreSearchState,
    clearSearchState,
    resetSearchForm
  }
}
