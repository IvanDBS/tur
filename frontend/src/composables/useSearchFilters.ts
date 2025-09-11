import { computed } from 'vue'
import { logger } from '../utils/logger'
import type { SelectedFilters } from '../types/search'
import { useGlobalFilters } from './useGlobalFilters'

export const useSearchFilters = () => {
  const { selectedFilters, resetFilters: globalResetFilters } = useGlobalFilters()

  // Helper function to get hotels for search
  const getSelectedHotelsForSearch = (searchData: { hotels: { value: Array<{ id: number }> } }) => {
    logger.debug(`🏨 getSelectedHotelsForSearch called. Available hotels: ${searchData.hotels.value.length}`)
    logger.debug(`🏨 Selected hotel filters: ${selectedFilters.value.hotels.length}`)
    
    // Если пользователь выбрал отели вручную, используем их
    if (selectedFilters.value.hotels.length > 0) {
      // Если выбран ID=1 (все отели), возвращаем все доступные отели
      if (selectedFilters.value.hotels.includes(1)) {
        return searchData.hotels.value.map((hotel) => Number(hotel.id))
      }
      // Иначе возвращаем выбранные отели (исключая ID=1)
      return selectedFilters.value.hotels
        .filter(id => id !== 1)
        .map(id => Number(id))
    }
    
    // Если ничего не выбрано, возвращаем все доступные отели
    const allHotels = searchData.hotels.value.map((hotel) => Number(hotel.id))
    logger.debug(`🏨 Returning all hotels for search: ${allHotels.length} hotels`)
    return allHotels
  }

  // Сброс фильтров
  const resetFilters = () => {
    globalResetFilters()
  }

  // Функции для переключения "Любой" (ID=1)
  const toggleAllHotels = () => {
    const isAnySelected = selectedFilters.value.hotels.includes(1)
    
    if (isAnySelected) {
      // Если "Любой" выбран, снимаем выбор
      selectedFilters.value.hotels = []
    } else {
      // Если "Любой" не выбран, выбираем "Любой" и очищаем все остальные
      selectedFilters.value.hotels = [1]
    }
  }

  const toggleAllCategories = () => {
    const isAnySelected = selectedFilters.value.categories.includes(1)
    
    if (isAnySelected) {
      // Если "Любой" выбран, снимаем выбор
      selectedFilters.value.categories = []
    } else {
      // Если "Любой" не выбран, выбираем "Любой" и очищаем все остальные
      selectedFilters.value.categories = [1]
    }
  }

  const toggleAllRegions = () => {
    const isAnySelected = selectedFilters.value.regions.includes(1)
    
    if (isAnySelected) {
      // Если "Любой" выбран, снимаем выбор
      selectedFilters.value.regions = []
    } else {
      // Если "Любой" не выбран, выбираем "Любой" и очищаем все остальные
      selectedFilters.value.regions = [1]
    }
  }

  // Функции для переключения отдельных элементов
  const toggleRegion = (regionId: number) => {
    // Если выбран "Любой" (ID=1), сначала снимаем его
    if (selectedFilters.value.regions.includes(1)) {
      selectedFilters.value.regions = []
    }
    
    const index = selectedFilters.value.regions.indexOf(regionId)
    if (index > -1) {
      selectedFilters.value.regions.splice(index, 1)
    } else {
      selectedFilters.value.regions.push(regionId)
    }
  }

  const toggleCategory = (categoryId: number) => {
    // Если выбран "Любой" (ID=1), сначала снимаем его
    if (selectedFilters.value.categories.includes(1)) {
      selectedFilters.value.categories = []
    }
    
    const index = selectedFilters.value.categories.indexOf(categoryId)
    if (index > -1) {
      selectedFilters.value.categories.splice(index, 1)
    } else {
      selectedFilters.value.categories.push(categoryId)
    }
  }

  const toggleHotel = (hotelId: number) => {
    // Если выбран "Любой" (ID=1), сначала снимаем его
    if (selectedFilters.value.hotels.includes(1)) {
      selectedFilters.value.hotels = []
    }
    
    const index = selectedFilters.value.hotels.indexOf(hotelId)
    if (index > -1) {
      selectedFilters.value.hotels.splice(index, 1)
    } else {
      selectedFilters.value.hotels.push(hotelId)
    }
  }

  const toggleMeal = (mealId: number) => {
    const index = selectedFilters.value.meals.indexOf(mealId)
    if (index > -1) {
      selectedFilters.value.meals.splice(index, 1)
    } else {
      selectedFilters.value.meals.push(mealId)
    }
  }

  const toggleOption = (optionId: number) => {
    const index = selectedFilters.value.options.indexOf(optionId)
    if (index > -1) {
      selectedFilters.value.options.splice(index, 1)
    } else {
      selectedFilters.value.options.push(optionId)
    }
  }

  const toggleAllMeals = (meals: Array<{ id: number }>) => {
    const allMealIds = meals.map(meal => meal.id)
    const isAllSelected = allMealIds.every(id => selectedFilters.value.meals.includes(id))
    
    if (isAllSelected) {
      selectedFilters.value.meals = []
    } else {
      selectedFilters.value.meals = [...allMealIds]
    }
  }

  const toggleAllOptions = (options: Array<{ id: number }>) => {
    const allOptionIds = options.map(option => option.id)
    const isAllSelected = allOptionIds.every(id => selectedFilters.value.options.includes(id))
    
    if (isAllSelected) {
      selectedFilters.value.options = []
    } else {
      selectedFilters.value.options = [...allOptionIds]
    }
  }

  // Computed свойства для проверки состояния "Любой" выбран
  const allRegionsSelected = computed(() => {
    // Если выбран "Любой" (ID=1)
    return selectedFilters.value.regions.includes(1)
  })

  const allCategoriesSelected = computed(() => {
    // Если выбран "Любой" (ID=1)
    return selectedFilters.value.categories.includes(1)
  })

  const allHotelsSelected = computed(() => {
    // Если выбран "Любой" (ID=1)
    return selectedFilters.value.hotels.includes(1)
  })

  const allMealsSelected = computed(() => {
    // Если выбран "Любой" (ID=1)
    return selectedFilters.value.meals.includes(1)
  })

  const allOptionsSelected = computed(() => {
    // Если выбран "Любой" (ID=1)
    return selectedFilters.value.options.includes(1)
  })

  return {
    selectedFilters,
    getSelectedHotelsForSearch,
    resetFilters,
    toggleAllHotels,
    toggleAllCategories,
    toggleAllRegions,
    toggleRegion,
    toggleCategory,
    toggleHotel,
    toggleMeal,
    toggleOption,
    toggleAllMeals,
    toggleAllOptions,
    allRegionsSelected,
    allCategoriesSelected,
    allHotelsSelected,
    allMealsSelected,
    allOptionsSelected
  }
}