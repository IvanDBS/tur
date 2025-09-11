import { computed, watch, nextTick, ref } from 'vue'
import { useSearchData } from './useSearchData'
import { useCalendarHints } from './useCalendarHints'
import { useNotifications } from './useNotifications'
import { useSearchValidation } from './useSearchValidation'
import { useSearchPagination } from './useSearchPagination'
import { useSearchFilters } from './useSearchFilters'
import { useSearchState } from './useSearchState'
import { logger } from '../utils/logger'
import { getAirportIdByPackageName } from '../constants/airports'
import { debounce } from '../utils/debounce'
import type { GroupedSearchResult } from '../types/search'

// Интерфейс для результатов поиска от OBS API
interface ObsSearchResult {
  unique_key: string
  rid: string
  hotel_results_counter: number
  package_template: number
  operator: number
  additional_services: unknown[]
  dates: {
    check_in: string
    check_out: string
  }
  nights: {
    total: number
    on_the_way: number
  }
  accommodation: {
    hotel: {
      id: number
      name: string
      is_exclusive: boolean
      category: string
      city: string
      in_stop: boolean
    }
    room: {
      id: number
      name: string
    }
    placement: {
      id: number
      name: string
    }
    meal: {
      id: number
      name: string
      full_name: string
    }
  }
  tickets: {
    from: {
      id: number
      name: string
      airline: {
        iata_code: string
        color: string
        name: string
        airline: string
      }
      departure: {
        date: string
        time: string
      }
      arrival: {
        date: string
        time: string
      }
      airports: {
        from: {
          name: string
          prefix: string
        }
        to: {
          name: string
          prefix: string
        }
      }
      tickets: number | null
    }
    to: {
      id: number
      name: string
      airline: {
        iata_code: string
        color: string
        name: string
        airline: string
      }
      departure: {
        date: string
        time: string
      }
      arrival: {
        date: string
        time: string
      }
      airports: {
        from: {
          name: string
          prefix: string
        }
        to: {
          name: string
          prefix: string
        }
      }
      tickets: number | null
    }
    on_request: 'y' | 'n'
    has_tickets: boolean
  }
  price: {
    amount: number
    netto: number
    commission: number
    type: string
    currency: string
    currency_id: number
  }
  transfers: {
    to: number
    from: number
  }
  never_land_entrance: unknown[]
  gala_dinner: unknown[]
  aquapark_services: unknown[]
  tourists: {
    adults: number
    children_ages: number[]
  }
}

export const useSearchForm = () => {
  // Получаем данные из composables
  const searchData = useSearchData()
  const calendarHints = useCalendarHints()
  const { showError } = useNotifications()
  
  // Используем новые composables
  const { validateSearchForm, validateDates } = useSearchValidation()
  const {
    currentPage,
    serverPageSize,
    lastSearchParams,
    allLoadedResults,
    loadedPages,
    isLoadingMore,
    totalPages,
    paginatedResults,
    needsMoreData,
    handlePageChange,
    loadMoreData,
    groupResultsByHotel,
    resetPagination
  } = useSearchPagination()
  const { 
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
  } = useSearchFilters()
  const {
    searchForm,
    isLoading,
    searchResults,
    totalResults,
    saveSearchState,
    restoreSearchState,
    clearSearchState,
    resetSearchForm
  } = useSearchState()

  // Состояние для debounce
  const isSearchPending = ref(false)
  const searchRequestId = ref(0)

  // Определяем активный селектор для показа стрелки
  const activeSelector = computed((): string | null => {
    if (!searchForm.value.departureCity) return 'departureCity'
    if (!searchForm.value.destination) return 'destination'
    if (!searchForm.value.package) return 'package'
    if (!searchForm.value.arrivalCity) return 'arrivalCity'
    if (!searchForm.value.checkInDate) return 'checkInDate'
    if (!searchForm.value.checkOutDate) return 'checkOutDate'
    // После выбора даты заезда активируется поле "ночей от"
    if (searchForm.value.checkInDate && searchForm.value.nights === null) return 'nights'
    // После выбора ночей от активируется поле "взрослых"
    if (searchForm.value.nights !== null && searchForm.value.adults === null) return 'adults'
    // После выбора взрослых активируется поле "детей"
    if (searchForm.value.adults !== null && searchForm.value.children === null) return 'children'
    // После выбора детей (включая 0 - "Без детей") все поля активируются, стрелочка исчезает
    return null // Все селекторы заполнены
  })

  // Автоматическое заполнение полей значениями по умолчанию после выбора даты заезда
  watch(() => searchForm.value.checkInDate, (newDate) => {
    if (newDate) {
      // Сбрасываем выбранные поля при смене даты для пошагового заполнения
      searchForm.value.nights = null
      searchForm.value.nights2 = null
      searchForm.value.adults = null
      searchForm.value.children = null
      searchForm.value.childrenAges = []
      
      // Устанавливаем "Период заезда до" равным "Период заезда от" по умолчанию
      // Это означает, что можно заселиться только в выбранную дату
      searchForm.value.checkOutDate = new Date(newDate)
      logger.info('🔄 Set checkOutDate (max check-in date) equal to checkInDate (min check-in date):', newDate)
    }
  })

  // Убрали автоматический расчет checkOutDate, так как это не дата выезда,
  // а максимальная дата заселения в отеле
  // checkOutDate теперь устанавливается равным checkInDate по умолчанию
  // и пользователь может изменить его на более позднюю дату

  // Фильтрованные опции для второго селектора ночей
  const filteredNights2Options = computed(() => {
    if (!searchForm.value.nights) {
      return []
    }

    return searchData.nightsOptions.value.filter(
      (option: { value: number; label: string }) => option.value >= (searchForm.value.nights || 0)
    )
  })
  
  // Динамические опции ночей на основе calendar hints
  const dynamicNightsOptions = computed(() => {
    // Если есть доступные ночи из calendar hints, используем их
    if (calendarHints.availableNights.value.length > 0) {
      return calendarHints.availableNightsOptions.value
    }
    
    // Иначе используем стандартные опции
    return searchData.nightsOptions.value
  })

  // Форматированные результаты для отображения
  const formattedResults = computed(() => {
    if (!searchResults.value || typeof searchResults.value !== 'object') {
      return []
    }
    
    // Используем пагинированные результаты
    const formatted = paginatedResults.value.map((result: GroupedSearchResult) => ({
      unique_key: `${result.hotel.id}-${result.roomOptions[0]?.room.id || 0}-${result.roomOptions[0]?.meal.id || 0}`,
      rid: `${result.hotel.id}-${result.roomOptions[0]?.room.id || 0}-${result.roomOptions[0]?.meal.id || 0}`,
      accommodation: {
        hotel: {
          name: result.hotel?.name || 'Название отеля',
          category: result.hotel?.category || '',
          city: result.hotel?.city || ''
        },
        room: {
          name: result.roomOptions[0]?.room?.name || ''
        },
        meal: {
          full_name: result.roomOptions[0]?.meal?.full_name || result.roomOptions[0]?.meal?.name || ''
        }
      },
      dates: {
        check_in: result.dates?.check_in || '',
        check_out: result.dates?.check_out || ''
      },
      nights: {
        total: result.nights?.total || 0
      },
      price: {
        amount: result.minPrice || 0,
        currency: result.currency || 'EUR',
        type: result.roomOptions[0]?.price?.type || ''
      }
    }))
    
    return formatted
  })

  // Объединенный watcher для города отправления и страны
  watch(
    () => [searchForm.value.departureCity, searchForm.value.destination],
    async ([newCity, newCountry], [oldCity, oldCountry]) => {
      try {
        // Обработка изменения города отправления
        if (newCity && newCity.id && newCity.id !== oldCity?.id) {
          searchForm.value.destination = null
          searchForm.value.package = null
          await searchData.loadCountries(newCity.id)
        }
        
        // Обработка изменения страны
        if (newCountry && newCountry.id && newCountry.id !== oldCountry?.id && searchForm.value.departureCity?.id) {
          searchForm.value.package = null
          searchForm.value.arrivalCity = null
          await searchData.loadPackageTemplates(newCountry.id, searchForm.value.departureCity.id)
        }
      } catch (err) {
        logger.error('Search form cascade watch error:', err)
      }
    },
    { deep: true }
  )

  // Следим за изменениями пакета и загружаем связанные данные
  watch(() => searchForm.value.package, async (newPackage) => {
    try {
      if (newPackage && newPackage.id) {
        // Если у пакета есть аэропорты, устанавливаем город прилета
        if (newPackage.airports && newPackage.airports.length > 0) {
          const airport = newPackage.airports[0]
          
          // Создаем объект города прилета
          const arrivalCity = {
            id: airport.id,
            name: airport.label || airport.name || `Airport ${airport.id}`
          }
          
          // Принудительно обновляем реактивность
          searchForm.value.arrivalCity = { ...arrivalCity }
          
          // Ждем обновления DOM и принудительно обновляем Multiselect
          await nextTick()
        } else {
          // Если это пакет для конкретного направления, 
          // попробуем определить город по названию пакета
          const packageName = newPackage.label || newPackage.name || ''
          const airportId = getAirportIdByPackageName(packageName)
          
          if (airportId) {
            const arrivalCity = {
              id: airportId,
              name: packageName.toUpperCase()
            }
            
            // Принудительно обновляем реактивность
            searchForm.value.arrivalCity = { ...arrivalCity }
            
            // Ждем обновления DOM
            await nextTick()
          }
        }
        
        // Загружаем связанные данные для поиска отелей
        await Promise.all([
          searchData.loadHotelCategories(newPackage.id),
          searchData.loadLocations(newPackage.id),
          searchData.loadHotels(newPackage.id),
          searchData.loadMeals(newPackage.id)
        ])
        
        // Загружаем calendar hints для доступных дат и ночей
        if (searchForm.value.departureCity?.id && searchForm.value.arrivalCity?.id) {
          try {
            await calendarHints.loadCalendarHints({
              city_from: searchForm.value.departureCity.id,
              city_to: searchForm.value.arrivalCity.id.toString()
            })
            logger.info('Calendar hints loaded successfully')
          } catch (err) {
            logger.warn('Failed to load calendar hints:', err)
          }
        }
        
        // Автоматически выбираем все регионы, категории и отели
        if (searchData.regions.value.length > 0) {
          selectedFilters.value.regions = [1, ...searchData.regions.value.map(r => r.id)]
        }
        
        if (searchData.categories.value.length > 0) {
          selectedFilters.value.categories = [1, ...searchData.categories.value.map(c => c.id)]
        }
        
        if (searchData.hotels.value.length > 0) {
          selectedFilters.value.hotels = [1, ...searchData.hotels.value.map(h => h.id)]
        }
        
        if (searchData.meals.value.length > 0) {
          selectedFilters.value.meals = [1, ...searchData.meals.value.map(m => m.id)]
        }
      } else {
        // Очищаем город прилета при сбросе пакета
        searchForm.value.arrivalCity = null
      }
    } catch (err) {
      logger.error('Package watch error:', err)
    }
  })

  // Watcher для количества детей
  watch(() => searchForm.value.children, (newChildren, oldChildren) => {
    if (newChildren !== oldChildren) {
      if (newChildren === null || newChildren === 0) {
        searchForm.value.childrenAges = []
      } else {
        const currentAges = [...searchForm.value.childrenAges]
        searchForm.value.childrenAges = Array(newChildren)
          .fill(0)
          .map((_, index) => {
            return index < currentAges.length ? currentAges[index] : 0
          })
      }
    }
  }, { immediate: true })

  // Watcher для nights
  watch(() => searchForm.value.nights, (newNights, oldNights) => {
    if (newNights !== oldNights && newNights && (!searchForm.value.nights2 || searchForm.value.nights2 < newNights)) {
      searchForm.value.nights2 = newNights
    }
  }, { immediate: true })





  // Внутренняя функция поиска (без debounce)
  const performSearchInternal = () => {
    const currentRequestId = ++searchRequestId.value
    
    logger.info('🔍 Starting search with form data:', {
      departureCity: searchForm.value.departureCity?.id,
      destination: searchForm.value.destination?.id,
      package: searchForm.value.package?.id,
      checkInDate: searchForm.value.checkInDate,
      checkOutDate: searchForm.value.checkOutDate,
      nights: searchForm.value.nights,
      adults: searchForm.value.adults,
      children: searchForm.value.children
    })
    
    // Добавляем выбранные отели в форму поиска (используем правильную логику)
    searchForm.value.selectedHotels = getSelectedHotelsForSearch(searchData)

    // Проверяем обязательные поля
    if (!validateSearchForm(searchForm.value, selectedFilters.value)) {
      return
    }

    // Проверяем доступность выбранных дат
    if (!validateDates(searchForm.value)) {
      return
    }
    
    logger.info('✅ Validation passed, proceeding with search...')

    // Форматируем даты в формат DD.MM.YYYY для API (как требует документация)
    const formatDate = (date: Date | null) => {
      if (!date) return ''
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      return `${day}.${month}.${year}`
    }
    
    logger.info('📅 Formatted dates for API:', {
      checkIn: formatDate(searchForm.value.checkInDate),
      maxCheckIn: formatDate(searchForm.value.checkOutDate)
    })

    // Подготавливаем параметры для API
    const airportCityTo = searchForm.value.arrivalCity?.id ? [Number(searchForm.value.arrivalCity.id)] : []
    
    // Определяем диапазон дат заезда
    const dateFrom = searchForm.value.checkInDate ? formatDate(searchForm.value.checkInDate) : ''
    const dateTo = searchForm.value.checkOutDate ? formatDate(searchForm.value.checkOutDate) : dateFrom
    
    const searchParams = {
      country: Number(searchForm.value.destination?.id),
      package_template: Number(searchForm.value.package?.id),
      airport_city_from: Number(searchForm.value.departureCity?.id),
      airport_city_to: airportCityTo,
      date_from: dateFrom,
      date_to: dateTo, // Диапазон дат заезда для поиска
      nights_from: Number(searchForm.value.nights),
      nights_to: Number(searchForm.value.nights2),
      adults: Number(searchForm.value.adults),
      children: searchForm.value.children !== null ? Number(searchForm.value.children) : undefined,
      children_age: searchForm.value.children !== null && searchForm.value.children > 0 ? searchForm.value.childrenAges : undefined,
      selected_hotels: (() => {
        const hotels = getSelectedHotelsForSearch(searchData)
        logger.info(`🏨 Selected hotels for search: ${hotels.length} hotels`, hotels.slice(0, 5))
        return hotels
      })(),
      meals: selectedFilters.value.meals.length > 0 ? [...new Set(selectedFilters.value.meals)].map(mealId => {
        const meal = searchData.meals.value.find(m => m.id === mealId)
        return meal?.name || meal?.label || mealId.toString()
      }) : searchData.meals.value.map(meal => meal.name || meal.label || meal.id.toString()).filter(Boolean).filter((meal, index, arr) => arr.indexOf(meal) === index), // Убираем дубликаты
      options: selectedFilters.value.options.length > 0 ? selectedFilters.value.options.map(optionId => {
        return optionId.toString()
      }) : undefined
    }
    
    logger.info('🔍 Search parameters prepared:', {
      country: searchParams.country,
      package_template: searchParams.package_template,
      airport_city_from: searchParams.airport_city_from,
      airport_city_to: searchParams.airport_city_to,
      date_from: searchParams.date_from,
      date_to: searchParams.date_to,
      nights_from: searchParams.nights_from,
      nights_to: searchParams.nights_to,
      adults: searchParams.adults,
      children: searchParams.children,
      selected_hotels: searchParams.selected_hotels,
      meals: searchParams.meals,
      options: searchParams.options
    })

    isLoading.value = true
    isSearchPending.value = false // Сбрасываем флаг ожидания
    
    // Сбрасываем предыдущие результаты и пагинацию
    searchResults.value = null
    totalResults.value = 0
    currentPage.value = 1
    loadedPages.value.clear() // Очищаем отслеживание загруженных страниц
    
    // Добавляем параметры пагинации (загружаем все туры, per_page > 500)
    const searchParamsWithPagination = {
      ...searchParams,
      page: 1, // Всегда начинаем с первой страницы
      per_page: serverPageSize // Загружаем все туры (per_page > 500)
    }
    
    logger.debug(`Search params with pagination:`, searchParamsWithPagination)
    logger.debug(`Search params with pagination - page: ${searchParamsWithPagination.page}, per_page: ${searchParamsWithPagination.per_page}`)
    
    // Сохраняем параметры поиска для пагинации
    lastSearchParams.value = searchParams
    
    // Сбрасываем загруженные результаты
    allLoadedResults.value = null
    
    // Вызываем API поиска
    searchData.performSearch(searchParamsWithPagination)
      .then((result) => {
        // Проверяем, что это актуальный запрос
        if (currentRequestId !== searchRequestId.value) {
          logger.info('🚫 Search request outdated, ignoring result')
          return
        }
        
        // Используем nextTick для безопасного обновления реактивности
        nextTick(() => {
          isLoading.value = false
        })
        
        logger.debug('Raw search result:', result)
        logger.debug('Result type:', typeof result)
        logger.debug('Result keys:', result ? Object.keys(result) : 'null')
        
        // Обработка результатов поиска
        if (result) {
          logger.debug('Full search result structure:', result)
          logger.debug('Result keys:', Object.keys(result))
          
          // Проверяем разные возможные структуры ответа
          let resultsData: Record<string, ObsSearchResult> | null = null
          let totalCount = 0
          
          if (result.results && typeof result.results === 'object') {
            // Стандартная структура: { results: {...}, total_results: N }
            resultsData = result.results as Record<string, ObsSearchResult>
            totalCount = (result.total_results as number) || 0
            logger.debug('Using standard structure: result.results')
          } else if (typeof result === 'object' && !result.results) {
            // Прямая структура: результаты в корне объекта
            // Исключаем служебные поля
            const excludeKeys = ['search_id', 'total_results', 'page', 'per_page', 'total_pages', 'prev_page', 'next_page', 'message']
            const resultKeys = Object.keys(result).filter(key => !excludeKeys.includes(key))
            
            if (resultKeys.length > 0) {
              resultsData = {} as Record<string, ObsSearchResult>
              resultKeys.forEach(key => {
                if (resultsData && result[key]) {
                  resultsData[key] = result[key] as ObsSearchResult
                }
              })
              totalCount = resultKeys.length
              logger.debug('Using direct structure: results in root object')
            }
          }
          
          if (resultsData && Object.keys(resultsData).length > 0) {
            nextTick(() => {
              searchResults.value = resultsData
              totalResults.value = totalCount
              allLoadedResults.value = resultsData
              loadedPages.value.add(1)
            })
            
            logger.info(`✅ Search completed successfully: total_results = ${totalCount}`)
            logger.info(`✅ Results stored: allLoadedResults keys = ${resultsData ? Object.keys(resultsData).length : 0}`)
            logger.info(`✅ First few result keys = ${resultsData ? Object.keys(resultsData).slice(0, 5) : []}`)
            logger.info(`✅ searchResults.value = ${resultsData ? 'SET' : 'NULL'}`)
            logger.info(`✅ totalResults.value = ${totalCount}`)
          } else {
            logger.warn('❌ No valid results found in search response:', result)
            logger.warn('❌ resultsData =', resultsData)
            logger.warn('❌ resultKeys length =', result ? Object.keys(result).length : 'no result')
            nextTick(() => {
              searchResults.value = null
              allLoadedResults.value = null
              totalResults.value = 0
            })
          }
        } else {
          logger.warn('Empty search response')
          nextTick(() => {
            searchResults.value = null
            allLoadedResults.value = null
            totalResults.value = 0
          })
        }
      })
      .catch((error) => {
        // Проверяем, что это актуальный запрос
        if (currentRequestId !== searchRequestId.value) {
          logger.info('🚫 Search request outdated, ignoring error')
          return
        }
        
        logger.error('Search failed:', error)
        nextTick(() => {
          isLoading.value = false
        })
        
        // Показываем ошибку пользователю
        let errorMessage = 'Произошла ошибка при поиске туров'
        
        if (error.message && error.message.includes('Validation failed')) {
          errorMessage = 'Проверьте правильность заполнения формы'
        } else if (error.message && error.message.includes('NO_TICKETS')) {
          errorMessage = 'По выбранным параметрам туры не найдены. Попробуйте изменить даты или количество ночей'
        } else if (error.message) {
          errorMessage = error.message
        }
        
        showError('Ошибка поиска', errorMessage)
      })
  }

  // Создаем debounced версию поиска
  const debouncedSearch = debounce(performSearchInternal, 800)

  // Основная функция поиска с debounce
  const handleSearch = () => {
    // Показываем индикатор ожидания
    isSearchPending.value = true
    
    // Вызываем debounced поиск
    debouncedSearch()
  }

  const handleReset = async () => {
    try {
      // Используем новые composables для сброса
      await resetSearchForm()
      resetFilters()
      resetPagination()
    } catch (error) {
      logger.error('Error in handleReset:', error)
    }
  }

  // Метод для обновления минимального значения для nights2
  const updateNights2Min = () => {
    if (searchForm.value.nights && (!searchForm.value.nights2 || searchForm.value.nights2 < searchForm.value.nights)) {
      searchForm.value.nights2 = searchForm.value.nights
    }
  }

  // Метод для автоматического выбора доступной даты
  const selectAvailableDate = () => {
    const { availableDates } = calendarHints
    
    if (availableDates.value.length > 0) {
      // Выбираем первую доступную дату
      const firstAvailableDate = availableDates.value[0]
      searchForm.value.checkInDate = firstAvailableDate
      
      // Устанавливаем максимальную дату заселения равной минимальной дате заселения
      searchForm.value.checkOutDate = new Date(firstAvailableDate)
      
      logger.info(`Auto-selected available dates: ${firstAvailableDate.toLocaleDateString()} - ${searchForm.value.checkOutDate?.toLocaleDateString()}`)
    } else {
      // Если нет доступных дат, устанавливаем дату через неделю
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)
      searchForm.value.checkInDate = nextWeek
      
      // Устанавливаем максимальную дату заселения равной минимальной дате заселения
      searchForm.value.checkOutDate = new Date(nextWeek)
      
      logger.info(`No available dates found, using default: ${nextWeek.toLocaleDateString()} - ${searchForm.value.checkOutDate?.toLocaleDateString()}`)
    }
  }


  // Обработчик бронирования тура
  const handleBook = (result: GroupedSearchResult) => {
    // Сохраняем состояние поиска перед переходом на бронирование
    saveSearchState({
      searchForm: searchForm.value,
      selectedFilters: selectedFilters.value,
      searchResults: searchResults.value,
      allLoadedResults: allLoadedResults.value,
      totalResults: totalResults.value,
      currentPage: currentPage.value,
      lastSearchParams: lastSearchParams.value,
      loadedPages: Array.from(loadedPages.value)
    })
    
    // Здесь можно добавить логику бронирования
    alert(`Бронирование тура: ${result.hotel.name} от ${result.minPrice} ${result.currency}`)
  }


  // Метод инициализации данных
  const initializeData = async () => {
    try {
      logger.info('🔄 Initializing search data...')
      await searchData.initializeData()
      logger.info('✅ Search data initialized')
      logger.info(`🏙️ Departure cities loaded: ${searchData.departureCitiesOptions.value.length}`)
      
      // Пытаемся восстановить состояние поиска
      const restoredState = restoreSearchState()
      if (restoredState) {
        // Восстанавливаем состояние из сохраненных данных
        searchForm.value = restoredState.searchForm || searchForm.value
        selectedFilters.value = restoredState.selectedFilters || selectedFilters.value
        searchResults.value = restoredState.searchResults || null
        allLoadedResults.value = restoredState.allLoadedResults || null
        totalResults.value = restoredState.totalResults || 0
        currentPage.value = restoredState.currentPage || 1
        lastSearchParams.value = restoredState.lastSearchParams || null
        loadedPages.value = new Set(restoredState.loadedPages || [])
      }
    } catch (err) {
      logger.error('❌ Failed to initialize search data:', err)
    }
  }

  return {
    // State
    searchForm,
    selectedFilters,
    isLoading,
    isSearchPending,
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
    
    // Search data
    searchData,
    
    // Calendar hints
    calendarHints,
    
    // Methods
    handleSearch,
    handleReset,
    updateNights2Min,
    selectAvailableDate,
    handlePageChange,
    handleBook,
    initializeData,
    loadMoreData,
    groupResultsByHotel,
    
    // State management
    saveSearchState,
    restoreSearchState,
    clearSearchState,
    
    // Filter functions
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
    
    // Filter computed properties
    allRegionsSelected,
    allCategoriesSelected,
    allHotelsSelected,
    allMealsSelected,
    allOptionsSelected,
  }
}
