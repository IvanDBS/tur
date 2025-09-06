import { ref, computed, watch } from 'vue'
import { arraysEqual } from '../utils/objectUtils'
import type { SelectedFilters, Region, Hotel } from '../types/search'

/**
 * Composable для управления фильтрами поиска
 * Централизует логику работы с фильтрами
 */
export function useSearchFilters(initialFilters: SelectedFilters, availableData?: {
  regions?: Region[]
  categories?: any[]
  hotels?: Hotel[]
  meals?: any[]
  options?: any[]
}) {
  const selectedFilters = ref<SelectedFilters>({ ...initialFilters })

  // Синхронизируем с внешними изменениями (оптимизированно)
  watch(() => initialFilters, (newFilters) => {
    // Проверяем, действительно ли изменились фильтры
    if (!arraysEqual(selectedFilters.value.regions, newFilters.regions) ||
        !arraysEqual(selectedFilters.value.categories, newFilters.categories) ||
        !arraysEqual(selectedFilters.value.hotels, newFilters.hotels) ||
        !arraysEqual(selectedFilters.value.meals, newFilters.meals) ||
        !arraysEqual(selectedFilters.value.options, newFilters.options)) {
      selectedFilters.value = { ...newFilters }
    }
  })

  // Computed для проверки "все выбрано"
  const allRegionsSelected = computed(() => {
    if (!availableData?.regions) return selectedFilters.value.regions.length > 0
    
    const hasAllRegions = selectedFilters.value.regions.includes(1) || 
                         selectedFilters.value.regions.length === availableData.regions.length
    
    // console.log('allRegionsSelected computed:', {
    //   selectedRegions: selectedFilters.value.regions,
    //   availableRegions: availableData.regions.length,
    //   hasId1: selectedFilters.value.regions.includes(1),
    //   allSelected: selectedFilters.value.regions.length === availableData.regions.length,
    //   result: hasAllRegions
    // })
    
    return hasAllRegions
  })

  const allCategoriesSelected = computed(() => {
    if (!availableData?.categories) return selectedFilters.value.categories.length > 0
    // Проверяем, выбраны ли все категории (включая ID=1 "все категории" или все доступные категории)
    return selectedFilters.value.categories.includes(1) || 
           selectedFilters.value.categories.length === availableData.categories.length
  })

  const allHotelsSelected = computed(() => {
    if (!availableData?.hotels) return selectedFilters.value.hotels.length > 0
    // Проверяем, выбраны ли все отели (включая ID=1 "все отели" или все доступные отели)
    return selectedFilters.value.hotels.includes(1) || 
           selectedFilters.value.hotels.length === availableData.hotels.length
  })

  const allMealsSelected = computed(() => {
    if (!availableData?.meals) return selectedFilters.value.meals.length > 0
    // Проверяем, выбраны ли все типы питания (включая ID=1 "все типы питания" или все доступные типы питания)
    return selectedFilters.value.meals.includes(1) || 
           selectedFilters.value.meals.length === availableData.meals.length
  })

  const allOptionsSelected = computed(() => {
    if (!availableData?.options) return selectedFilters.value.options.length > 0
    return selectedFilters.value.options.length === availableData.options.length
  })

  // Методы для работы с регионами
  const toggleRegion = (regionId: number) => {
    const currentRegions = [...selectedFilters.value.regions]
    const index = currentRegions.indexOf(regionId)
    
    if (index > -1) {
      currentRegions.splice(index, 1)
    } else {
      currentRegions.push(regionId)
    }
    
    selectedFilters.value.regions = currentRegions
  }

  const toggleAllRegions = (regions: Region[]) => {
    // console.log('toggleAllRegions called:', {
    //   allRegionsSelected: allRegionsSelected.value,
    //   currentRegions: selectedFilters.value.regions,
    //   availableRegions: regions.map(r => ({ id: r.id, name: r.label || r.name }))
    // })
    
    if (allRegionsSelected.value) {
      selectedFilters.value.regions = []
      // console.log('Cleared all regions')
    } else {
      // Выбираем все регионы включая ID=1 "все регионы"
      selectedFilters.value.regions = [1, ...regions.map(r => r.id)]
      // console.log('Selected all regions:', selectedFilters.value.regions)
    }
  }

  // Методы для работы с категориями
  const toggleCategory = (categoryId: number) => {
    const currentCategories = [...selectedFilters.value.categories]
    const index = currentCategories.indexOf(categoryId)
    
    if (index > -1) {
      currentCategories.splice(index, 1)
    } else {
      currentCategories.push(categoryId)
    }
    
    selectedFilters.value.categories = currentCategories
  }

  const toggleAllCategories = (categories: any[]) => {
    if (allCategoriesSelected.value) {
      selectedFilters.value.categories = []
    } else {
      // Выбираем все категории включая ID=1 "все категории"
      selectedFilters.value.categories = [1, ...categories.map(c => c.id)]
    }
  }

  // Методы для работы с отелями
  const toggleHotel = (hotelId: number) => {
    const currentHotels = [...selectedFilters.value.hotels]
    const index = currentHotels.indexOf(hotelId)
    
    if (index > -1) {
      currentHotels.splice(index, 1)
    } else {
      currentHotels.push(hotelId)
    }
    
    selectedFilters.value.hotels = currentHotels
  }

  const toggleAllHotels = (hotels: Hotel[]) => {
    if (allHotelsSelected.value) {
      selectedFilters.value.hotels = []
    } else {
      // Выбираем все отели включая ID=1 "все отели"
      selectedFilters.value.hotels = [1, ...hotels.map(h => h.id)]
    }
  }

  // Методы для работы с питанием
  const toggleMeal = (mealId: number) => {
    const currentMeals = [...selectedFilters.value.meals]
    const index = currentMeals.indexOf(mealId)
    const hasAllSelected = currentMeals.includes(1)
    
    if (index > -1) {
      // Убираем конкретный тип питания
      currentMeals.splice(index, 1)
      // Если был выбран "Любой" (ID=1), убираем его тоже
      if (hasAllSelected) {
        const allIndex = currentMeals.indexOf(1)
        if (allIndex > -1) {
          currentMeals.splice(allIndex, 1)
        }
      }
    } else {
      // Добавляем конкретный тип питания
      currentMeals.push(mealId)
      // Если теперь выбраны все доступные типы питания, добавляем "Любой" (ID=1)
      if (availableData?.meals && currentMeals.length === availableData.meals.length) {
        currentMeals.push(1)
      }
    }
    
    selectedFilters.value.meals = currentMeals
  }

  const toggleAllMeals = (meals: any[]) => {
    if (allMealsSelected.value) {
      selectedFilters.value.meals = []
    } else {
      // Выбираем все типы питания включая ID=1 "все типы питания"
      selectedFilters.value.meals = [1, ...meals.map(m => m.id)]
    }
  }

  // Методы для работы с опциями
  const toggleOption = (optionId: number) => {
    const currentOptions = [...selectedFilters.value.options]
    const index = currentOptions.indexOf(optionId)
    
    if (index > -1) {
      currentOptions.splice(index, 1)
    } else {
      currentOptions.push(optionId)
    }
    
    selectedFilters.value.options = currentOptions
  }

  const toggleAllOptions = (options: any[]) => {
    if (allOptionsSelected.value) {
      selectedFilters.value.options = []
    } else {
      selectedFilters.value.options = options.map(o => o.id)
    }
  }

  // Сброс всех фильтров
  const resetFilters = () => {
    selectedFilters.value = {
      regions: [],
      categories: [],
      hotels: [],
      meals: [],
      options: []
    }
  }

  // Установка фильтров по умолчанию
  const setDefaultFilters = (regions: Region[], categories: any[], meals: any[], hotels?: Hotel[]) => {
    selectedFilters.value.regions = [1, ...regions.map(r => r.id)]
    selectedFilters.value.categories = [1, ...categories.map(c => c.id)]
    selectedFilters.value.meals = [1, ...meals.map(m => m.id)] // Добавляем ID=1 для "все типы питания"
    if (hotels) {
      selectedFilters.value.hotels = [1, ...hotels.map(h => h.id)]
    }
  }

  return {
    selectedFilters,
    allRegionsSelected,
    allCategoriesSelected,
    allHotelsSelected,
    allMealsSelected,
    allOptionsSelected,
    toggleRegion,
    toggleAllRegions,
    toggleCategory,
    toggleAllCategories,
    toggleHotel,
    toggleAllHotels,
    toggleMeal,
    toggleAllMeals,
    toggleOption,
    toggleAllOptions,
    resetFilters,
    setDefaultFilters
  }
}
