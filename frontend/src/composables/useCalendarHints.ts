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
    const keys = Object.keys(calendarHints.value)
    const dates = keys.map(date => new Date(date))
    // Available dates computed
    logger.info('📅 availableDates computed:', {
      totalDates: dates.length,
      firstFewDates: dates.slice(0, 3).map(d => d.toISOString().split('T')[0]),
      calendarHintsKeys: keys.slice(0, 5),
      calendarHintsLength: keys.length,
      calendarHintsValue: calendarHints.value,
      keysArray: keys,
      datesArray: dates.map(d => d.toISOString().split('T')[0]),
      calendarHintsType: typeof calendarHints.value,
      calendarHintsIsObject: calendarHints.value && typeof calendarHints.value === 'object'
    })
    
    // Дополнительная проверка для отладки
    if (keys.length === 0) {
      logger.warn('⚠️ No calendar hints keys found!', {
        calendarHintsValue: calendarHints.value,
        calendarHintsType: typeof calendarHints.value,
        calendarHintsKeys: Object.keys(calendarHints.value)
      })
    }
    
    return dates
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
        logger.info('🔍 Raw hints from API:', hints)
        logger.info('🔍 Hints type:', typeof hints)
        logger.info('🔍 Hints keys:', Object.keys(hints))
        
        calendarHints.value = hints
        logger.info('🔍 calendarHints.value after assignment:', calendarHints.value)
        logger.info('🔍 calendarHints.value keys:', Object.keys(calendarHints.value))
        logger.info('🔍 calendarHints.value type:', typeof calendarHints.value)
        logger.info('🔍 calendarHints.value is object:', calendarHints.value && typeof calendarHints.value === 'object')
        logger.info('🔍 calendarHints.value keys length:', Object.keys(calendarHints.value).length)

        logger.info(`Loaded calendar hints for ${Object.keys(hints).length} dates`)
        logger.info('Calendar hints data:', hints)
      
      // Извлекаем доступные ночи из hints
      const nightsSet = new Set<number>()
      Object.values(hints).forEach(dateHints => {
        // Проверяем, что dateHints является массивом
        if (Array.isArray(dateHints)) {
          dateHints.forEach(hint => {
            if (hint.days && typeof hint.days === 'string') {
              const days = hint.days.split(',').map(d => parseInt(d.trim()))
              days.forEach(day => {
                if (!isNaN(day) && day > 0) {
                  nightsSet.add(day)
                }
              })
            }
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
  const isDateAvailable = (date: Date | string | null) => {
    if (!date) return false
    
    // Если это строка, преобразуем в Date
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    // Проверяем, что это валидная дата
    if (isNaN(dateObj.getTime())) {
      logger.warn('❌ Invalid date passed to isDateAvailable:', date)
      return false
    }
    
    const dateString = dateObj.toISOString().split('T')[0]
    const isAvailable = dateString in calendarHints.value && Array.isArray(calendarHints.value[dateString])
    
    logger.info('🔍 isDateAvailable check:', {
      date: date,
      dateString: dateString,
      isAvailable: isAvailable,
      calendarHintsKeys: Object.keys(calendarHints.value).slice(0, 10), // первые 10 ключей
      totalHints: Object.keys(calendarHints.value).length,
      hasDateInHints: dateString in calendarHints.value,
      dateValue: calendarHints.value[dateString],
      calendarHintsValue: calendarHints.value,
      calendarHintsType: typeof calendarHints.value
    })
    
    return isAvailable
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
