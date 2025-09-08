import { ref, computed } from 'vue'
import { useObsApi } from './useObsApi'
import { logger } from '../utils/logger'

// Интерфейс для calendar hints
interface CalendarHint {
  departure_date: string
  days: string
  airport: string
  remain: number
}

interface CalendarHintsResponse {
  [date: string]: CalendarHint[]
}

export const useCalendarHints = () => {
  const obsApi = useObsApi()
  
  // State
  const calendarHints = ref<CalendarHintsResponse>({})
  const availableNights = ref<number[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // Computed properties
  const availableDates = computed(() => {
    return Object.keys(calendarHints.value).map(date => new Date(date))
  })
  
  const availableNightsOptions = computed(() => {
    return availableNights.value.map(nights => ({
      value: nights,
      label: nights.toString()
    }))
  })
  
  // Методы
  const clearError = () => {
    error.value = null
  }
  
  const setError = (message: string) => {
    error.value = message
    logger.error('Calendar hints error:', message)
  }
  
  // Загрузка calendar hints
  const loadCalendarHints = async (params: {
    date_from?: string
    date_to?: string
    city_from: number
    city_to: string
  }) => {
    try {
      isLoading.value = true
      clearError()
      
      logger.debug('Loading calendar hints with params:', params)
      
        const hints = await obsApi.fetchCalendarHints(params)
        calendarHints.value = hints

        logger.info(`Loaded calendar hints for ${Object.keys(hints).length} dates`)
        logger.info('Calendar hints data:', hints)
      
      // Извлекаем доступные ночи из hints
      const nightsSet = new Set<number>()
      Object.values(hints).forEach(dateHints => {
        // Проверяем, что dateHints является массивом
        if (Array.isArray(dateHints)) {
          dateHints.forEach(hint => {
            const days = hint.days.split(',').map(d => parseInt(d.trim()))
            days.forEach(day => {
              if (!isNaN(day) && day > 0) {
                nightsSet.add(day)
              }
            })
          })
        }
      })
      
      availableNights.value = Array.from(nightsSet).sort((a, b) => a - b)
      
      logger.info(`Extracted ${availableNights.value.length} available nights:`, availableNights.value)
      
      return hints
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load calendar hints'
      setError(message)
      return {}
    } finally {
      isLoading.value = false
    }
  }
  
  // Загрузка доступных ночей
  const loadAvailableNights = async (params: {
    date_from?: string
    date_to?: string
    city_from: number
    city_to: string
  }) => {
    try {
      isLoading.value = true
      clearError()
      
      logger.debug('Loading available nights with params:', params)
      
      const nights = await obsApi.fetchAvailableNights(params)
      availableNights.value = nights
      
      logger.info(`Loaded ${nights.length} available nights:`, nights)
      
      return nights
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load available nights'
      setError(message)
      return []
    } finally {
      isLoading.value = false
    }
  }
  
  // Проверка доступности даты
  const isDateAvailable = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    return dateString in calendarHints.value && Array.isArray(calendarHints.value[dateString])
  }
  
  // Получение доступных ночей для конкретной даты
  const getAvailableNightsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    const hints = calendarHints.value[dateString]
    
    if (!hints || !Array.isArray(hints)) return []
    
    const nightsSet = new Set<number>()
    hints.forEach(hint => {
      const days = hint.days.split(',').map(d => parseInt(d.trim()))
      days.forEach(day => {
        if (!isNaN(day) && day > 0) {
          nightsSet.add(day)
        }
      })
    })
    
    return Array.from(nightsSet).sort((a, b) => a - b)
  }
  
  // Очистка данных
  const clearData = () => {
    calendarHints.value = {}
    availableNights.value = []
    clearError()
  }
  
  return {
    // State
    calendarHints: computed(() => calendarHints.value),
    availableNights: computed(() => availableNights.value),
    availableDates,
    availableNightsOptions,
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    
    // Methods
    loadCalendarHints,
    loadAvailableNights,
    isDateAvailable,
    getAvailableNightsForDate,
    clearData,
    clearError
  }
}
