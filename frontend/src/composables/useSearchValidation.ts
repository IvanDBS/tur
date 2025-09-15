// Removed unused import: ref
import { useNotifications } from './useNotifications'
import { useCalendarHints } from './useCalendarHints'
import type { SearchForm, SelectedFilters } from '../types/search'

export const useSearchValidation = () => {
  const { showError } = useNotifications()
  const calendarHints = useCalendarHints()

  const validateSearchForm = (
    searchForm: SearchForm,
    selectedFilters: SelectedFilters
  ): boolean => {
    console.log('🔍 Validating search form fields:', {
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
      console.log('❌ Missing departure city')
      showError('Ошибка поиска', 'Выберите город отправления')
      return false
    }
    if (!searchForm.destination?.id) {
      console.log('❌ Missing destination')
      showError('Ошибка поиска', 'Выберите страну назначения')
      return false
    }
    if (!searchForm.package?.id) {
      console.log('❌ Missing package')
      showError('Ошибка поиска', 'Выберите пакет тура')
      return false
    }
    // Проверяем город прилета только для пакетов с перелетом
    const isPackageWithoutFlight = !searchForm.package?.airports || searchForm.package.airports.length === 0
    if (!isPackageWithoutFlight && !searchForm.arrivalCity?.id) {
      console.log('❌ Missing arrival city for flight package')
      showError('Ошибка поиска', 'Выберите город прилета')
      return false
    }
    if (!searchForm.checkInDate) {
      console.log('❌ Missing check-in date')
      showError('Ошибка поиска', 'Выберите дату заезда')
      return false
    }
    if (!searchForm.checkOutDate) {
      console.log('❌ Missing check-out date')
      showError('Ошибка поиска', 'Выберите максимальную дату заселения')
      return false
    }
    if (!searchForm.nights) {
      console.log('❌ Missing nights')
      showError('Ошибка поиска', 'Выберите количество ночей')
      return false
    }
    if (!searchForm.nights2) {
      console.log('❌ Missing nights2')
      showError('Ошибка поиска', 'Выберите максимальное количество ночей')
      return false
    }
    if (searchForm.children === null) {
      console.log('❌ Missing children count')
      showError('Ошибка поиска', 'Укажите количество детей (можно выбрать "Без детей")')
      return false
    }

    // Проверяем, что выбраны отели или опция "Любой"
    console.log('🔍 Checking hotels selection:', {
      selectedFiltersHotels: selectedFilters.hotels,
      selectedFiltersHotelsLength: selectedFilters.hotels.length,
      selectedFiltersHotelsType: typeof selectedFilters.hotels,
      selectedFiltersHotelsIsArray: Array.isArray(selectedFilters.hotels),
      selectedFiltersHotelsContent: selectedFilters.hotels
    })
    
    // Убираем обязательную проверку отелей - если не выбраны, будут использованы все доступные
    // if (selectedFilters.hotels.length === 0) {
    //   console.log('❌ No hotels selected')
    //   showError('Ошибка поиска', 'Выберите отели или опцию "Любой" в фильтрах')
    //   return false
    // }

    console.log('✅ All search form validations passed')
    return true
  }

  const validateDates = (searchForm: SearchForm): boolean => {
    const { isDateAvailable, availableDates, calendarHints: calendarHintsData } = calendarHints

    console.log('🔍 Validating dates:', {
      checkInDate: searchForm.checkInDate,
      checkOutDate: searchForm.checkOutDate,
      availableDatesCount: availableDates.value.length,
      calendarHintsKeys: Object.keys(calendarHintsData.value),
      calendarHintsLength: Object.keys(calendarHintsData.value).length
    })

    if (!searchForm.checkInDate || !searchForm.checkOutDate) {
      console.log('❌ Missing dates')
      return false
    }

    // Если нет доступных дат в календаре, пропускаем проверку
    const calendarHintsKeys = Object.keys(calendarHintsData.value)
    if (calendarHintsKeys.length === 0) {
      console.log('✅ No calendar hints, skipping date validation')
      return true
    }

    if (!isDateAvailable(searchForm.checkInDate)) {
      console.log('❌ Check-in date not available')
      showError('Ошибка поиска', 'Выбранная дата заезда недоступна для бронирования')
      return false
    }

    if (!isDateAvailable(searchForm.checkOutDate)) {
      console.log('❌ Check-out date not available')
      showError('Ошибка поиска', 'Выбранная максимальная дата заселения недоступна для бронирования')
      return false
    }

    console.log('✅ All date validations passed')
    return true
  }

  return {
    validateSearchForm,
    validateDates
  }
}
