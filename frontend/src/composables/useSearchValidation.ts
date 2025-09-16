// Removed unused import: ref
import { useNotifications } from './useNotifications'
import { useCalendarHints } from './useCalendarHints'
import { logger } from '../utils/logger'
import type { SearchForm, SelectedFilters } from '../types/search'

export const useSearchValidation = () => {
  const { showError } = useNotifications()
  const calendarHints = useCalendarHints()

  const validateSearchForm = (
    searchForm: SearchForm,
    selectedFilters: SelectedFilters
  ): boolean => {
    logger.debug('🔍 Validating search form fields:', {
      departureCity: searchForm.departureCity?.id,
      destination: searchForm.destination?.id,
      package: searchForm.package?.id,
      arrivalCity: searchForm.arrivalCity?.id,
      checkInDate: searchForm.checkInDate,
      checkOutDate: searchForm.checkOutDate,
      nights: searchForm.nights,
      nights2: searchForm.nights2,
      children: searchForm.children,
      selectedHotels: selectedFilters.hotels.length,
      selectedHotelsArray: selectedFilters.hotels
    })

    // Проверяем обязательные поля
    if (!searchForm.departureCity?.id) {
      logger.debug('❌ Missing departure city')
      showError('Ошибка поиска', 'Выберите город отправления')
      return false
    }
    if (!searchForm.destination?.id) {
      logger.debug('❌ Missing destination')
      showError('Ошибка поиска', 'Выберите страну назначения')
      return false
    }
    if (!searchForm.package?.id) {
      logger.debug('❌ Missing package')
      showError('Ошибка поиска', 'Выберите пакет тура')
      return false
    }
    // Проверяем город прилета только для пакетов с перелетом
    const isPackageWithoutFlight = !searchForm.package?.airports || searchForm.package.airports.length === 0
    if (!isPackageWithoutFlight && !searchForm.arrivalCity?.id) {
      logger.debug('❌ Missing arrival city for flight package')
      showError('Ошибка поиска', 'Выберите город прилета')
      return false
    }
    if (!searchForm.checkInDate) {
      logger.debug('❌ Missing check-in date')
      showError('Ошибка поиска', 'Выберите дату заезда')
      return false
    }
    if (!searchForm.checkOutDate) {
      logger.debug('❌ Missing check-out date')
      showError('Ошибка поиска', 'Выберите максимальную дату заселения')
      return false
    }
    if (!searchForm.nights) {
      logger.debug('❌ Missing nights')
      showError('Ошибка поиска', 'Выберите количество ночей')
      return false
    }
    if (!searchForm.nights2) {
      logger.debug('❌ Missing nights2')
      showError('Ошибка поиска', 'Выберите максимальное количество ночей')
      return false
    }
    if (searchForm.children === null) {
      logger.debug('❌ Missing children count')
      showError('Ошибка поиска', 'Укажите количество детей (можно выбрать "Без детей")')
      return false
    }

    // Проверяем, что выбраны отели или опция "Любой"
    logger.debug('🔍 Checking hotels selection:', {
      selectedFiltersHotels: selectedFilters.hotels,
      selectedFiltersHotelsLength: selectedFilters.hotels.length,
      selectedFiltersHotelsType: typeof selectedFilters.hotels,
      selectedFiltersHotelsIsArray: Array.isArray(selectedFilters.hotels),
      selectedFiltersHotelsContent: selectedFilters.hotels
    })
    
    // Убираем обязательную проверку отелей - если не выбраны, будут использованы все доступные
    // if (selectedFilters.hotels.length === 0) {
    //   logger.debug('❌ No hotels selected')
    //   showError('Ошибка поиска', 'Выберите отели или опцию "Любой" в фильтрах')
    //   return false
    // }

    logger.debug('✅ All search form validations passed')
    return true
  }

  const validateDates = (searchForm: SearchForm): boolean => {
    const { isDateAvailable, availableDates, calendarHints: calendarHintsData } = calendarHints

    logger.debug('🔍 Validating dates:', {
      checkInDate: searchForm.checkInDate,
      checkOutDate: searchForm.checkOutDate,
      availableDatesCount: availableDates.value.length,
      calendarHintsKeys: Object.keys(calendarHintsData.value),
      calendarHintsLength: Object.keys(calendarHintsData.value).length
    })

    if (!searchForm.checkInDate || !searchForm.checkOutDate) {
      logger.debug('❌ Missing dates')
      return false
    }

    // Если нет доступных дат в календаре, пропускаем проверку
    const calendarHintsKeys = Object.keys(calendarHintsData.value)
    if (calendarHintsKeys.length === 0) {
      logger.debug('✅ No calendar hints, skipping date validation')
      return true
    }

    if (!isDateAvailable(searchForm.checkInDate)) {
      logger.debug('❌ Check-in date not available')
      showError('Ошибка поиска', 'Выбранная дата заезда недоступна для бронирования')
      return false
    }

    if (!isDateAvailable(searchForm.checkOutDate)) {
      logger.debug('❌ Check-out date not available')
      showError('Ошибка поиска', 'Выбранная максимальная дата заселения недоступна для бронирования')
      return false
    }

    logger.debug('✅ All date validations passed')
    return true
  }

  return {
    validateSearchForm,
    validateDates
  }
}
