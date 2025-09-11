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
    // Проверяем обязательные поля
    if (!searchForm.departureCity?.id) {
      showError('Ошибка поиска', 'Выберите город отправления')
      return false
    }
    if (!searchForm.destination?.id) {
      showError('Ошибка поиска', 'Выберите страну назначения')
      return false
    }
    if (!searchForm.package?.id) {
      showError('Ошибка поиска', 'Выберите пакет тура')
      return false
    }
    // Проверяем город прилета только для пакетов с перелетом
    const isPackageWithoutFlight = !searchForm.package?.airports || searchForm.package.airports.length === 0
    if (!isPackageWithoutFlight && !searchForm.arrivalCity?.id) {
      showError('Ошибка поиска', 'Выберите город прилета')
      return false
    }
    if (!searchForm.checkInDate) {
      showError('Ошибка поиска', 'Выберите дату заезда')
      return false
    }
    if (!searchForm.checkOutDate) {
      showError('Ошибка поиска', 'Выберите максимальную дату заселения')
      return false
    }
    if (!searchForm.nights) {
      showError('Ошибка поиска', 'Выберите количество ночей')
      return false
    }
    if (!searchForm.nights2) {
      showError('Ошибка поиска', 'Выберите максимальное количество ночей')
      return false
    }
    if (searchForm.children === null) {
      showError('Ошибка поиска', 'Укажите количество детей (можно выбрать "Без детей")')
      return false
    }

    // Проверяем, что выбраны отели или опция "Любой"
    if (selectedFilters.hotels.length === 0) {
      showError('Ошибка поиска', 'Выберите отели или опцию "Любой" в фильтрах')
      return false
    }

    return true
  }

  const validateDates = (searchForm: SearchForm): boolean => {
    const { isDateAvailable, availableDates } = calendarHints

    if (!searchForm.checkInDate || !searchForm.checkOutDate) {
      return false
    }

    // Если нет доступных дат в календаре, пропускаем проверку
    if (availableDates.value.length === 0) {
      return true
    }

    if (!isDateAvailable(searchForm.checkInDate)) {
      showError('Ошибка поиска', 'Выбранная дата заезда недоступна для бронирования')
      return false
    }

    if (!isDateAvailable(searchForm.checkOutDate)) {
      showError('Ошибка поиска', 'Выбранная максимальная дата заселения недоступна для бронирования')
      return false
    }

    return true
  }

  return {
    validateSearchForm,
    validateDates
  }
}
