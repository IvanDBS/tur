import { ref } from 'vue'
import { logger } from '../utils/logger'
import type { SelectedFilters } from '../types/search'

// Глобальное состояние фильтров
const globalSelectedFilters = ref<SelectedFilters>({
  regions: [],
  categories: [],
  hotels: [],
  meals: [],
  options: [],
})

export const useGlobalFilters = () => {
  // Сброс фильтров
  const resetFilters = () => {
    logger.warn('🔄 resetFilters called - this will clear all selected filters!')
    globalSelectedFilters.value = {
      regions: [],
      categories: [],
      hotels: [],
      meals: [],
      options: [],
    }
  }

  return {
    selectedFilters: globalSelectedFilters,
    resetFilters
  }
}
