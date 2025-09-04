<template>
  <div class="search-container">
    <!-- Notifications -->
    <NotificationToast
      v-for="notification in notifications"
      :key="notification.id"
      :type="notification.type"
      :title="notification.title"
      :message="notification.message"
      :duration="notification.duration"
      @close="removeNotification(notification.id)"
    />
    
    <div class="search-form">
      <!-- Loading Indicator -->
      <div v-if="isLoading" class="loading-overlay">
        <div class="spinner-container">
          <div class="blue-spinner spinner-medium"></div>
          <p class="spinner-text">Загружаем данные для поиска...</p>
        </div>
      </div>

      <!-- Row 1 - Основные поля -->
      <BasicSearchFields
        v-model="searchForm"
        :active-selector="activeSelector"
        :is-loading="isLoading"
        :departure-cities-options="searchData.departureCitiesOptions.value"
        :countries-options="searchData.countriesOptions.value"
        :packages-options="searchData.packagesOptions.value"
      />

      <!-- Row 2 - Даты и ночи -->
      <DateSearchFields
        v-model="searchForm"
        :is-check-in-date-enabled="!!isCheckInDateEnabled"
        :is-check-out-date-enabled="!!isCheckOutDateEnabled"
        :are-nights-fields-enabled="!!areNightsFieldsEnabled"
        :show-date-indicator="!!showDateIndicator"
        :nights-options="searchData.nightsOptions.value"
      />

      <!-- Row 3 - Люди и цены -->
      <PeopleSearchFields
        v-model="searchForm"
        :are-people-fields-enabled="!!arePeopleFieldsEnabled"
        :are-children-fields-enabled="!!areChildrenFieldsEnabled"
        :are-price-and-filters-enabled="!!arePriceAndFiltersEnabled"
        :show-children-indicator="!!showChildrenIndicator"
        :adults-options="searchData.adultsOptions.value"
        :children-options="searchData.childrenOptions.value"
      />

      <!-- Filters Section -->
      <SearchFilters
        :regions="searchData.regions.value"
        :categories="searchData.categories.value"
        :hotels="searchData.hotels.value"
        :meals="searchData.meals.value"
        :options="searchData.options.value"
        :selected-regions="selectedFilters.regions"
        :selected-categories="selectedFilters.categories"
        :selected-hotels="selectedFilters.hotels"
        :selected-meals="selectedFilters.meals"
        :selected-options="selectedFilters.options"
        :disabled="!arePriceAndFiltersEnabled"
        @update:regions="selectedFilters.regions = $event"
        @update:categories="selectedFilters.categories = $event"
        @update:hotels="selectedFilters.hotels = $event"
        @update:meals="selectedFilters.meals = $event"
        @update:options="selectedFilters.options = $event"
      />


      <!-- Action Buttons -->
      <div class="action-buttons">
        <div class="results-info">
          <span v-if="searchResults !== null" class="results-count">
            Найдено туров: {{ totalResults }}
          </span>
        </div>
        <div class="buttons-group">
          <button type="button" @click="handleReset" class="reset-btn">
            Сбросить параметры
          </button>
          <button type="button" @click="handleSearch" class="search-btn">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            Поиск тура
          </button>
        </div>
      </div>
    </div>

    <!-- Результаты поиска -->
    <div v-if="searchResults !== null && totalResults > 0" class="search-results-section">
      <SearchResults 
        :results="formattedResults" 
        :is-loading="isLoading"
        :current-page="currentPage"
        :total-pages="totalPages"
        :prev-page="prevPage"
        :next-page="nextPage"
        @book="handleBook"
        @pageChanged="handlePageChange"
      />
    </div>
    
    <!-- Сообщение о том, что туры не найдены -->
    <div v-else-if="searchResults !== null && totalResults === 0" class="search-results-section">
      <div class="no-results-message">
        <p>Туры не найдены</p>
        <p>Попробуйте изменить параметры поиска</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed, defineAsyncComponent, watch } from 'vue'
  import { useNotifications } from '../composables/useNotifications'
  const NotificationToast = defineAsyncComponent(() => import('./NotificationToast.vue'))
  // Динамический импорт для обхода проблемы с TypeScript
  const SearchFilters = defineAsyncComponent(() => import('./search/SearchFilters.vue'))
  const SearchResults = defineAsyncComponent(() => import('./SearchResults.vue'))
  const BasicSearchFields = defineAsyncComponent(() => import('./search/BasicSearchFields.vue'))
  const DateSearchFields = defineAsyncComponent(() => import('./search/DateSearchFields.vue'))
  const PeopleSearchFields = defineAsyncComponent(() => import('./search/PeopleSearchFields.vue'))
  import { useSearchData } from '../composables/useSearchData'
  import type { SearchForm, SelectedFilters } from '../types/search'
  
  // Notifications
  const { notifications, removeNotification, showError } = useNotifications()

  // Интерфейс для результатов поиска от OBS API
  interface ObsSearchResult {
    unique_key: string
    rid: string
    accommodation: {
      hotel: {
        name: string
        category: string
        city: string
      }
      room: {
        name: string
      }
      meal: {
        full_name: string
      }
    }
    dates: {
      check_in: string
      check_out: string
    }
    nights: {
      total: number
    }
    price: {
      amount: number
      currency: string
      type: string
    }
  }

  // Reactive data
  const searchForm = ref<SearchForm>({
    departureCity: null,
    destination: null,
    package: null,
    arrivalCity: null,
    date: null,
    checkInDate: new Date(), // Сегодня
    checkOutDate: new Date(), // Сегодняшняя дата по умолчанию
    nights: 6,
    nights2: 6,
    adults: 2,
    children: null,
    childrenAges: [],
    priceFrom: null,
    priceTo: null,
    selectedHotels: [],
  })

  const selectedFilters = ref<SelectedFilters>({
    regions: [],
    categories: [],
    hotels: [],
    meals: [],
    options: [],
  })

  const isLoading = ref(false)
  const searchResults = ref<Record<string, ObsSearchResult> | null>(null)
  const totalResults = ref(0)
  
  
  // Состояние пагинации
  const currentPage = ref(1)
  const totalPages = ref(1)
  const perPage = ref(20)
  const prevPage = ref<number | null>(null)
  const nextPage = ref<number | null>(null)

  // Получаем данные из composable
  const searchData = useSearchData()

  // Определяем активный селектор для показа стрелки
  const activeSelector = computed(() => {
    if (!searchForm.value.departureCity) return 'departureCity'
    if (!searchForm.value.destination) return 'destination'
    if (!searchForm.value.package) return 'package'
    if (!searchForm.value.arrivalCity) return 'arrivalCity'
    return null // Все селекторы заполнены
  })

  // Отладка activeSelector
  watch(activeSelector, (newValue) => {
    console.log('activeSelector changed:', newValue)
  }, { immediate: true })


  // Флаги для отслеживания реального выбора пользователем
  const userSelectedCheckInDate = ref(false)
  const userSelectedCheckOutDate = ref(false)
  const userSelectedNights = ref(false)
  const userSelectedAdults = ref(false)
  
  // Флаг для показа мигающей стрелочки на поле детей
  const showChildrenIndicator = ref(false)
  
  // Флаг для показа мигающей стрелочки на поле "Период поиска от"
  const showDateIndicator = ref(false)

  // Определяем, когда поле "Период От" должно быть активным
  const isCheckInDateEnabled = computed(() => {
    return searchForm.value.departureCity && 
           searchForm.value.destination && 
           searchForm.value.package
  })

  // Определяем, когда поле "Период До" должно быть активным
  const isCheckOutDateEnabled = computed(() => {
    return isCheckInDateEnabled.value && userSelectedCheckInDate.value
  })

  // Определяем, когда поля ночей должны быть активными
  const areNightsFieldsEnabled = computed(() => {
    return isCheckInDateEnabled.value && userSelectedCheckInDate.value
  })

  // Определяем, когда поля людей должны быть активными
  const arePeopleFieldsEnabled = computed(() => {
    return isCheckInDateEnabled.value && userSelectedCheckInDate.value
  })

  // Определяем, когда поля цен и фильтров должны быть активными
  const arePriceAndFiltersEnabled = computed(() => {
    return arePeopleFieldsEnabled.value && (userSelectedAdults.value || searchForm.value.children !== null)
  })

  // Определяем, когда поля детей должны быть активными (только после выбора даты)
  const areChildrenFieldsEnabled = computed(() => {
    return isCheckInDateEnabled.value && userSelectedCheckInDate.value
  })


  // Форматированные результаты для отображения (с клиентской пагинацией)
  const formattedResults = computed(() => {
    if (!searchResults.value || typeof searchResults.value !== 'object') {
      return []
    }
    
    // Преобразуем объект результатов в массив
    console.log('🔥 formattedResults - searchResults.value:', searchResults.value)
    console.log('🔥 formattedResults - Object.keys length:', Object.keys(searchResults.value).length)
    console.log('🔥 formattedResults - Object.values length:', Object.values(searchResults.value).length)
    
    const allResults = Object.values(searchResults.value).map((result: ObsSearchResult) => ({
      unique_key: result.unique_key || '',
      rid: result.rid || '',
      accommodation: {
        hotel: {
          name: result.accommodation?.hotel?.name || 'Название отеля',
          category: result.accommodation?.hotel?.category || '',
          city: result.accommodation?.hotel?.city || ''
        },
        room: {
          name: result.accommodation?.room?.name || ''
        },
        meal: {
          full_name: result.accommodation?.meal?.full_name || ''
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
        amount: result.price?.amount || 0,
        currency: result.price?.currency || 'EUR',
        type: result.price?.type || ''
      }
    }))
    
    // Клиентская пагинация - показываем только результаты для текущей страницы
    const startIndex = (currentPage.value - 1) * perPage.value
    const endIndex = startIndex + perPage.value
    console.log('🔥 Slice calculation:', {
      currentPage: currentPage.value,
      perPage: perPage.value,
      startIndex,
      endIndex,
      allResultsLength: allResults.length
    })
    console.log('🔥 perPage.value in formattedResults:', perPage.value)
    const pageResults = allResults.slice(startIndex, endIndex)
    console.log('🔥 Slice result length:', pageResults.length)
    console.log('🔥 First few pageResults:', pageResults.slice(0, 3))
    
    console.log('🔥 Client pagination:', {
      totalResults: allResults.length,
      currentPage: currentPage.value,
      perPage: perPage.value,
      startIndex,
      endIndex,
      pageResults: pageResults.length,
      totalPages: totalPages.value
    })
    
    // Проверяем, что возвращаем
    if (pageResults.length === 0) {
      console.log('🔥 WARNING: pageResults is empty!')
      console.log('🔥 allResults length:', allResults.length)
      console.log('🔥 startIndex:', startIndex, 'endIndex:', endIndex)
      console.log('🔥 allResults slice test:', allResults.slice(0, 5))
    }
    
    return pageResults
  })

  // Инициализация данных при монтировании
  onMounted(async () => {
    try {
      await searchData.initializeData()
      console.log('Search data initialized')
    } catch (err) {
      console.error('Failed to initialize search data:', err)
    }
  })

  // Следим за изменениями города отправления и загружаем страны
  watch(() => searchForm.value.departureCity, async (newCity) => {
    console.log('Departure city watch triggered:', newCity)
    try {
      if (newCity && newCity.id) {
        console.log(`Loading countries for city ${newCity.id}`)
        searchForm.value.destination = null
        searchForm.value.package = null
        // Загружаем страны для выбранного города через useSearchData
        await searchData.loadCountries(newCity.id)
        console.log(`Loaded countries for departure city: ${newCity.label || newCity.name}`)
      } else {
        console.log('Departure city watch: missing city data', newCity)
      }
    } catch (err) {
      console.error('Departure city watch error:', err)
      console.error('Error details:', {
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        city: newCity
      })
    }
  })

  // Следим за изменениями страны и загружаем пакеты
  watch(() => searchForm.value.destination, async (newCountry) => {
    console.log('Destination watch triggered:', newCountry)
    try {
      if (newCountry && newCountry.id && searchForm.value.departureCity?.id) {
        console.log(`Loading packages for country ${newCountry.id} and city ${searchForm.value.departureCity.id}`)
        // Очищаем предыдущий выбор
        searchForm.value.package = null
        searchForm.value.arrivalCity = null
        
        // Загружаем пакеты для выбранной страны через useSearchData
        await searchData.loadPackageTemplates(newCountry.id, searchForm.value.departureCity.id)
        
        console.log(`Loaded packages for country: ${newCountry.label || newCountry.name}`)
      } else {
        console.log('Destination watch: missing required data', {
          newCountry,
          departureCity: searchForm.value.departureCity
        })
      }
    } catch (err) {
      console.error('Destination watch error:', err)
      console.error('Error details:', {
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        country: newCountry,
        departureCity: searchForm.value.departureCity
      })
    }
  })

  // Следим за изменениями пакета и загружаем связанные данные
  watch(() => searchForm.value.package, async (newPackage) => {
    console.log('Package watch triggered:', newPackage?.id, newPackage?.label)
    try {
      if (newPackage && newPackage.id) {
        console.log(`Loading data for package ${newPackage.id}`)
        
        // Устанавливаем город прилета
        if (newPackage.airports && newPackage.airports.length > 0) {
          const airport = newPackage.airports[0]
          searchForm.value.arrivalCity = {
            id: airport.id,
            name: airport.label || airport.name || `Airport ${airport.id}`
          }
          console.log('Set arrival city:', searchForm.value.arrivalCity)
        } else {
          // Устанавливаем город по умолчанию
          searchForm.value.arrivalCity = {
            id: 50004,
            name: 'ANTALYA'
          }
          console.log('Set default arrival city: ANTALYA')
        }
        
        // Загружаем связанные данные для поиска отелей (кроме отелей - они загружаются при выборе детей)
        console.log('Loading hotel-related data...')
        await Promise.all([
          searchData.loadHotelCategories(newPackage.id),
          searchData.loadLocations(newPackage.id),
          searchData.loadMeals(newPackage.id)
        ])
        
        console.log('Hotel-related data loaded successfully')
        
        // Загружаем отели после выбора пакета
        try {
          console.log('Loading hotels after package selection...')
          await searchData.loadHotels(newPackage.id)
          console.log('Hotels loaded:', searchData.hotels.value.length)
        } catch (error) {
          console.error('Error loading hotels:', error)
        }
        
        // Автоматически выбираем все регионы, категории и питания
        if (searchData.regions.value.length > 0) {
          selectedFilters.value.regions = [1, ...searchData.regions.value.map(r => r.id)]
        }
        
        if (searchData.categories.value.length > 0) {
          selectedFilters.value.categories = [1, ...searchData.categories.value.map(c => c.id)]
        }
        
        if (searchData.meals.value.length > 0) {
          selectedFilters.value.meals = searchData.meals.value.map(m => m.id)
        }
      } else {
        console.log('Package watch: missing package data', newPackage)
        // Очищаем город прилета при сбросе пакета
        searchForm.value.arrivalCity = null
      }
    } catch (err) {
      console.error('Package watch error:', err)
    }
  })
  
  // Сбрасываем флаги выбора для всех последующих полей при изменении пакета
  watch(() => searchForm.value.package, () => {
    userSelectedCheckInDate.value = false
    userSelectedCheckOutDate.value = false
    userSelectedNights.value = false
    userSelectedAdults.value = false
    showChildrenIndicator.value = false
    showDateIndicator.value = false
  })
  
  // Показываем стрелочку у поля "Период поиска от" после выбора пакета
  watch(() => searchForm.value.package, (newPackage) => {
    if (newPackage && newPackage.id) {
      showDateIndicator.value = true
    }
  })


  // Следим за изменениями nights и обновляем nights2
  watch(() => searchForm.value.nights, (newValue) => {
    if (newValue && (!searchForm.value.nights2 || searchForm.value.nights2 < newValue)) {
      searchForm.value.nights2 = newValue
    }
    // Устанавливаем флаг, что пользователь выбрал ночи
    if (newValue) {
      userSelectedNights.value = true
    }
  }, { immediate: true })

  // Следим за изменениями adults и устанавливаем флаг
  watch(() => searchForm.value.adults, (newValue) => {
    if (newValue) {
      userSelectedAdults.value = true
    }
  }, { immediate: true })

  // Следим за изменениями children
  watch(() => searchForm.value.children, (newValue) => {
    if (newValue !== null && newValue !== undefined) {
      // Скрываем мигающую стрелочку
      showChildrenIndicator.value = false
      console.log('Children selected, hotels should now be enabled')
    }
  }, { immediate: true })

  // Следим за изменениями даты начала периода и устанавливаем дату конца периода
  watch(() => searchForm.value.checkInDate, (newValue, oldValue) => {
    if (newValue) {
      // Убеждаемся, что дата начала >= сегодня
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (newValue < today) {
        // Если дата в прошлом, устанавливаем сегодня (только если это не тот же день)
        if (!oldValue || oldValue.getTime() !== today.getTime()) {
          searchForm.value.checkInDate = today
        }
        return
      }
      
      // Устанавливаем дату конца периода равной дате начала (сегодняшняя дата)
      if (!searchForm.value.checkOutDate || searchForm.value.checkOutDate <= newValue) {
        searchForm.value.checkOutDate = new Date(newValue)
      }
      
      // Устанавливаем флаг, что пользователь выбрал дату начала
      userSelectedCheckInDate.value = true
      
      // Скрываем стрелочку у поля даты и показываем у поля детей
      showDateIndicator.value = false
      showChildrenIndicator.value = true
    }
  }, { immediate: true })

  // Следим за изменениями даты конца периода и устанавливаем флаг
  watch(() => searchForm.value.checkOutDate, (newValue) => {
    if (newValue) {
      userSelectedCheckOutDate.value = true
    }
  }, { immediate: true })

  // Форматируем даты в формат YYYY-MM-DD для Calendar Hints API
  const formatDateForApi = (date: Date) => {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Загружаем Calendar Hints при изменении основных параметров
  let calendarHintsTimeout: number | null = null
  const loadCalendarHints = async () => {
    if (!searchForm.value.departureCity?.id || !searchForm.value.arrivalCity?.id) {
      return
    }

    // Debounce запросы, чтобы избежать бесконечных циклов
    if (calendarHintsTimeout) {
      clearTimeout(calendarHintsTimeout)
    }
    
    calendarHintsTimeout = setTimeout(async () => {
      try {
        const params = {
          city_from: searchForm.value.departureCity!.id,
          city_to: searchForm.value.arrivalCity!.id.toString(),
          date_from: searchForm.value.checkInDate ? formatDateForApi(searchForm.value.checkInDate) : undefined,
          date_to: searchForm.value.checkOutDate ? formatDateForApi(searchForm.value.checkOutDate) : undefined
        }
        
        console.log('Loading calendar hints with params:', params)
        const hints = await searchData.loadCalendarHints(params)
        console.log('Calendar hints loaded:', hints)
      } catch (err) {
        console.warn('Failed to load calendar hints:', err)
      }
    }, 500) // 500ms debounce
  }

  // Следим за изменениями для загрузки Calendar Hints
  watch([() => searchForm.value.departureCity, () => searchForm.value.arrivalCity], 
    (newValues, oldValues) => {
      // Проверяем, что значения действительно изменились, чтобы избежать бесконечного цикла
      if (newValues[0]?.id !== oldValues?.[0]?.id || newValues[1]?.id !== oldValues?.[1]?.id) {
        loadCalendarHints()
      }
    }, 
    { deep: true }
  )

  // Emits
  const emit = defineEmits<{
    search: [params: Record<string, unknown>]
  }>()

  // Methods
  const handleSearch = () => {
    // Сбрасываем предыдущие результаты поиска
    searchResults.value = null
    totalResults.value = 0
    
    // Добавляем выбранные отели в форму поиска
    searchForm.value.selectedHotels = [...selectedFilters.value.hotels]

    console.log('Searching with params:', searchForm.value)
    console.log('Selected filters:', selectedFilters.value)
    console.log('Children ages:', searchForm.value.childrenAges)

    // Проверяем обязательные поля
    if (!searchForm.value.departureCity?.id) {
      showError('Выберите город отправления', 'Пожалуйста, выберите город отправления в поле "Откуда"')
      return
    }
    if (!searchForm.value.destination?.id) {
      showError('Выберите страну назначения', 'Пожалуйста, выберите страну назначения в поле "Куда"')
      return
    }
    if (!searchForm.value.package?.id) {
      showError('Выберите пакет', 'Пожалуйста, выберите пакет тура')
      return
    }
    if (!searchForm.value.arrivalCity?.id) {
      showError('Выберите город прилета', 'Пожалуйста, выберите город прилета')
      return
    }
    if (!searchForm.value.checkInDate) {
      showError('Выберите дату заезда', 'Пожалуйста, выберите дату заезда в поле "Период поиска от"')
      return
    }
    if (!searchForm.value.checkOutDate) {
      showError('Выберите дату выезда', 'Пожалуйста, выберите дату выезда в поле "Период поиска до"')
      return
    }
    if (selectedFilters.value.hotels.length === 0) {
      showError('Выберите отель', 'Пожалуйста, выберите хотя бы один отель для поиска туров')
      return
    }

    // Форматируем даты в формат YYYY-MM-DD для OBS API
    const formatDateForSearch = (date: Date) => {
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    // Подготавливаем параметры для API
    console.log('arrivalCity before formatting:', searchForm.value.arrivalCity)
    console.log('arrivalCity.id type:', typeof searchForm.value.arrivalCity?.id)
    console.log('arrivalCity.id value:', searchForm.value.arrivalCity?.id)
    
    const airportCityTo = searchForm.value.arrivalCity?.id ? [Number(searchForm.value.arrivalCity.id)] : []
    console.log('airportCityTo array:', airportCityTo)
    console.log('airportCityTo type:', typeof airportCityTo)
    console.log('airportCityTo isArray:', Array.isArray(airportCityTo))
    

    const searchParams = {
      country: Number(searchForm.value.destination.id), // Используем ID страны как number
      package_template: Number(searchForm.value.package.id),
      airport_city_from: Number(searchForm.value.departureCity.id),
      airport_city_to: airportCityTo, // Используем подготовленный массив
      date_from: formatDateForSearch(searchForm.value.checkInDate),
      date_to: formatDateForSearch(searchForm.value.checkOutDate),
      nights_from: Number(searchForm.value.nights),
      nights_to: Number(searchForm.value.nights2),
      adults: Number(searchForm.value.adults),
      children: searchForm.value.children && searchForm.value.children > 0 ? Number(searchForm.value.children) : undefined,
      children_age: searchForm.value.children && searchForm.value.children > 0 ? searchForm.value.childrenAges : undefined,
      price_from: searchForm.value.priceFrom ? Number(searchForm.value.priceFrom) : undefined,
      price_to: searchForm.value.priceTo ? Number(searchForm.value.priceTo) : undefined,
      selected_hotels: selectedFilters.value.hotels.length > 0 ? selectedFilters.value.hotels.map(id => Number(id)) : [1], // Добавляем selected_hotels, если не выбраны отели, используем [1] как fallback
      meals: selectedFilters.value.meals.length > 0 ? selectedFilters.value.meals.map(mealId => {
        const meal = searchData.meals.value.find(m => m.id === mealId)
        return meal?.name || meal?.label || mealId.toString()
      }) : undefined,
      options: selectedFilters.value.options.length > 0 ? selectedFilters.value.options.map(optionId => {
        return optionId.toString()
      }) : undefined,
      // Pagination parameters - загружаем все результаты для клиентской пагинации
      page: 1,
      per_page: 1000  // Загружаем много результатов сразу
    }

    console.log('Formatted search params for API:', searchParams)
    console.log('🔥 Pagination params:', { page: searchParams.page, per_page: searchParams.per_page })
    console.log('🔥 Requesting all results with per_page=1000')
    console.log('🔥 perPage.value:', perPage.value)
    console.log('airport_city_to before API call:', searchParams.airport_city_to)
    console.log('airport_city_to type before API call:', typeof searchParams.airport_city_to)
    console.log('airport_city_to isArray before API call:', Array.isArray(searchParams.airport_city_to))

    isLoading.value = true
    
    // Вызываем API поиска
    searchData.performSearch(searchParams)
      .then((result) => {
        console.log('Search result:', result)
        isLoading.value = false
        
                  // Сохраняем результаты поиска и данные пагинации
          if (result) {
            console.log('🔥 API result structure:', result)
            console.log('🔥 API result.results type:', typeof result.results)
            console.log('🔥 API result.results isArray:', Array.isArray(result.results))
            console.log('🔥 API result.results length:', result.results ? Object.keys(result.results).length : 0)
            
            searchResults.value = result.results || {}
            totalResults.value = result.total_results || 0
            
            // При клиентской пагинации рассчитываем totalPages на основе общего количества результатов
            const allResultsCount = Object.keys(result.results || {}).length
            console.log('🔥 All results count from API:', allResultsCount)
            console.log('🔥 Total results from API:', result.total_results)
            console.log('🔥 Per page before API response:', perPage.value)
            console.log('🔥 API returned per_page:', result.per_page)
            console.log('🔥 API returned total_pages:', result.total_pages)
            
            // НЕ перезаписываем perPage.value из API - используем наш фиксированный размер страницы
            // perPage.value = result.per_page || 10  // УБРАЛИ ЭТУ СТРОКУ
            
            // Если API вернул все результаты (total_pages = 1), используем их для клиентской пагинации
            if (result.total_pages === 1 && result.per_page > 500) {
              console.log('🔥 API returned all results, using client-side pagination')
              totalPages.value = Math.ceil(allResultsCount / perPage.value)
            } else {
              console.log('🔥 API returned paginated results, using server pagination')
              totalPages.value = result.total_pages || 1
            }
            
            console.log('🔥 Final totalPages:', totalPages.value)
            console.log('🔥 Final perPage:', perPage.value)
            
            // Обновляем prevPage и nextPage для клиентской пагинации
            prevPage.value = currentPage.value > 1 ? currentPage.value - 1 : null
            nextPage.value = currentPage.value < totalPages.value ? currentPage.value + 1 : null
          console.log('Results saved:', searchResults.value)
          console.log('Total results:', totalResults.value)
          console.log('🔥 API returned page:', result.page)
          console.log('🔥 Our currentPage:', currentPage.value)
          console.log('Pagination data:', { 
            currentPage: currentPage.value, 
            totalPages: totalPages.value, 
            perPage: perPage.value,
            prevPage: prevPage.value,
            nextPage: nextPage.value
          })
        }
        
        emit('search', searchParams)
      })
      .catch((error) => {
        console.error('Search failed:', error)
        isLoading.value = false
        // Здесь можно показать ошибку пользователю
      })
  }

  const handleReset = () => {
    searchForm.value = {
      departureCity: null,
      destination: null,
      package: null,
      arrivalCity: null,
      date: null,
      checkInDate: new Date(), // Сегодня
      checkOutDate: new Date(), // Сегодняшняя дата по умолчанию
      nights: 6,
      nights2: 6,
      adults: 2,
      children: null,
      childrenAges: [],
      priceFrom: null,
      priceTo: null,
      selectedHotels: [],
    }
    selectedFilters.value = {
      regions: [],
      categories: [],
      hotels: [],
      meals: [],
      options: [],
    }
    
    // Сбрасываем результаты поиска
    searchResults.value = null
    totalResults.value = 0
    
    // Сбрасываем пагинацию
    currentPage.value = 1
    totalPages.value = 1
    perPage.value = 20  // Устанавливаем правильный размер страницы
    prevPage.value = null
    nextPage.value = null
    
    // Сбрасываем флаги выбора пользователем
    userSelectedCheckInDate.value = false
    userSelectedCheckOutDate.value = false
    userSelectedNights.value = false
    userSelectedAdults.value = false
    showChildrenIndicator.value = false
    showDateIndicator.value = false
  }


  // Обработчик смены страницы (клиентская пагинация)
  const handlePageChange = (page: number) => {
    console.log('🔥 handlePageChange called with page:', page)
    console.log('🔥 Current page before change:', currentPage.value)
    console.log('🔥 Total pages:', totalPages.value)
    console.log('🔥 searchResults.value before change:', searchResults.value)
    console.log('🔥 searchResults.value keys length:', searchResults.value ? Object.keys(searchResults.value).length : 0)
    
    currentPage.value = page
    
    // Обновляем prevPage и nextPage для клиентской пагинации
    prevPage.value = currentPage.value > 1 ? currentPage.value - 1 : null
    nextPage.value = currentPage.value < totalPages.value ? currentPage.value + 1 : null
    
    console.log('🔥 Current page after change:', currentPage.value)
    console.log('🔥 Updated prevPage:', prevPage.value, 'nextPage:', nextPage.value)
    console.log('🔥 searchResults.value after change:', searchResults.value)
    // При клиентской пагинации не нужно вызывать API - просто меняем страницу
    console.log('🔥 Client-side pagination - no API call needed')
    
    // Прокручиваем к началу списка отелей
    scrollToResults()
  }
  
  // Функция для прокрутки к секции результатов
  const scrollToResults = () => {
    // Ищем секцию результатов
    const resultsSection = document.querySelector('.search-results-section')
    
    if (resultsSection) {
      // Прокручиваем с отступом сверху, чтобы секция была лучше видна
      const elementRect = resultsSection.getBoundingClientRect()
      const absoluteElementTop = elementRect.top + window.pageYOffset
      const offset = 100 // Отступ сверху в пикселях
      
      window.scrollTo({
        top: absoluteElementTop - offset,
        behavior: 'smooth'
      })
    }
  }

  // Обработчик бронирования тура
  const handleBook = (result: ObsSearchResult) => {
    console.log('Booking tour:', result)
    // Здесь можно добавить логику бронирования
    alert(`Бронирование тура: ${result.accommodation.hotel.name} за ${result.price.amount} ${result.price.currency}`)
  }

  // Явный экспорт для TypeScript
  defineExpose({})
</script>

<style scoped>
  /* Search Form Container */
  .search-container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 12px 0;
    box-sizing: border-box;
  }

  /* Loading Overlay */
  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    border-radius: 8px;
  }

  .loading-spinner {
    text-align: center;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Search Form */
  .search-form {
    background: #ffffff;
    border: 1px solid #dddddd;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 24px;
    position: relative;
  }

  .form-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 12px;
    align-items: end;
  }

  .field-group {
    flex: 1;
    min-width: 100px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .field-group label {
    font-size: 11px;
    font-weight: 600;
    color: #222222;
  }

  /* Стили для неактивных полей */
  .field-group.disabled-field label {
    color: #999999 !important;
  }

  .field-group.disabled-field :deep(.multiselect) {
    opacity: 0.6;
    background-color: #f5f5f5;
    border-color: #e0e0e0;
  }

  .field-group.disabled-field :deep(.multiselect .multiselect__placeholder) {
    color: #999999;
  }

  .field-group.disabled-field :deep(.dp__input) {
    opacity: 0.6;
    background-color: #f5f5f5;
    border-color: #e0e0e0;
    color: #999999;
  }

  .field-group.disabled-field :deep(.dp__input::placeholder) {
    color: #999999;
  }

  .field-hint {
    font-size: 10px;
    color: #666666;
    margin-top: 2px;
    font-style: italic;
  }

  /* Стили для календаря */
  :deep(.dp__active_date) {
    background: transparent !important;
    border: 2px solid var(--color-primary) !important;
    color: var(--color-primary) !important;
  }

  :deep(.dp__input) {
    min-height: 38px !important;
    height: 38px !important;
    box-sizing: border-box !important;
  }

  /* Стили для input полей */
  .field-group input[type='number'] {
    border: 1px solid #dddddd !important;
    border-radius: 4px !important;
    padding: 4px 8px !important;
    font-size: 14px !important;
    color: #222222 !important;
    background: #ffffff !important;
    font-family: var(--font-family) !important;
    min-height: 38px !important;
    height: 38px !important;
    box-sizing: border-box !important;
  }

  .field-group input[type='number']:hover,
  .field-group input[type='number']:focus {
    border-color: #1d3557 !important;
    box-shadow: 0 0 0 2px rgba(29, 53, 87, 0.2) !important;
    outline: none !important;
  }

  /* Убираем стрелочки у number input */
  .field-group input[type='number']::-webkit-outer-spin-button,
  .field-group input[type='number']::-webkit-inner-spin-button {
    -webkit-appearance: none !important;
    margin: 0 !important;
  }

  .field-group input[type='number'] {
    appearance: textfield !important;
    -moz-appearance: textfield !important;
  }

  /* Стили для селекторов возраста детей */
  .children-ages {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  /* Action Buttons */
  .action-buttons {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid #ebebeb;
  }

  .results-info {
    flex: 1;
  }

  .results-count {
    font-size: 12px;
    color: #666666;
    font-weight: 400;
  }

  .buttons-group {
    display: flex;
    gap: 12px;
  }

  .reset-btn {
    background: white;
    border: 1px solid var(--color-dark-gray);
    color: var(--color-dark-gray);
    border-radius: 6px;
    padding: 10px 20px;
    cursor: pointer;
    font-family: var(--font-family);
    font-weight: 500;
    transition: all 0.2s ease;
    min-width: 180px;
  }

  .reset-btn:hover {
    background: var(--color-dark-gray-muted);
  }

  .search-btn {
    background: white;
    border: 1px solid var(--color-primary);
    color: var(--color-primary);
    border-radius: 6px;
    padding: 10px 24px;
    cursor: pointer;
    font-family: var(--font-family);
    font-weight: 600;
    transition: all 0.2s ease;
    min-width: 140px;
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: center;
  }

  .search-btn:hover {
    background: var(--color-primary);
    color: white;
  }

  .search-btn svg {
    transition: transform 0.2s;
  }

  .search-btn:hover svg {
    transform: scale(1.1);
  }

  /* Search Results Section */
  .search-results-section {
    margin-top: 2rem;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    border: 1px solid var(--color-border);
  }

  .results-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 1rem;
    text-align: center;
  }


  .no-results-message {
    text-align: center;
    padding: 2rem;
    color: #666666;
  }

  .no-results-message p {
    margin: 0.5rem 0;
    font-size: 1.1rem;
  }

  .no-results-message p:first-child {
    font-weight: 600;
    color: #333333;
  }

  /* Test Checkbox Section */

  /* Mobile Responsive */
  @media (max-width: 768px) {
    .search-form {
      padding: 16px;
    }

    .form-row {
      grid-template-columns: 1fr;
    }

    .field-group {
      min-width: 80px;
    }

    .action-buttons {
      flex-direction: column;
      gap: 12px;
    }

    .results-info {
      order: 2;
      text-align: center;
    }

    .buttons-group {
      order: 1;
      flex-direction: column;
      width: 100%;
    }

    .reset-btn,
    .search-btn {
      min-width: auto;
      width: 100%;
    }

  }
</style>
