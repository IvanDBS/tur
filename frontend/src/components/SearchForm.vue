<template>
  <div class="search-container">
    <div class="search-form">
      <!-- Loading Indicator -->
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>Загружаем данные...</p>
        </div>
      </div>

      <!-- Row 1 - Основные поля -->
      <div class="form-row">
        <!-- Откуда -->
        <div class="field-group">
          <label>Откуда:</label>
          <Multiselect
            v-model="searchForm.departureCity"
            :options="searchData.departureCitiesOptions.value"
            :searchable="true"
            :canClear="false"
            :canDeselect="false"
            placeholder="Выберите город"
            label="label"
            valueProp="value"
            :disabled="isLoading"
          />
        </div>

        <!-- Куда -->
        <div class="field-group">
          <label>Куда:</label>
          <Multiselect
            v-model="searchForm.destination"
            :options="searchData.countriesOptions.value"
            :searchable="true"
            :canClear="false"
            :canDeselect="false"
            placeholder="Выберите страну"
            label="label"
            valueProp="value"
            :disabled="isLoading || !searchForm.departureCity"
          />
        </div>

        <!-- Пакет -->
        <div class="field-group">
          <label>Пакет:</label>
          <Multiselect
            v-model="searchForm.package"
            :options="searchData.packagesOptions.value"
            :searchable="true"
            :canClear="false"
            :canDeselect="false"
            placeholder="Выберите пакет"
            label="label"
            valueProp="value"
            :disabled="isLoading || !searchForm.destination"
          />
        </div>

        <!-- Город прилета -->
        <div class="field-group">
          <label>Город прилета:</label>
          <input 
            type="text" 
            :value="searchForm.arrivalCity ? searchForm.arrivalCity.name : 'Город будет выбран автоматически'"
            :disabled="true"
            style="min-height: 38px; height: 38px; border: 1px solid #dddddd; border-radius: 4px; padding: 4px 8px; font-size: 14px; color: #222222; background: #f5f5f5; font-family: inherit; box-sizing: border-box;"
            title="Автоматически устанавливается на основе выбранного пакета"
          />
        </div>
      </div>

      <!-- Row 2 - Даты и ночи -->
      <div class="form-row">
        <div class="field-group">
          <label>Период заезда от:</label>
          <VueDatePicker
            v-model="searchForm.checkInDate"
            :min-date="new Date()"
            format="dd.MM.yyyy"
            placeholder="Выберите дату"
            :month-change-on-scroll="false"
            :auto-apply="true"
            :enable-time-picker="false"
            :week-start="1"
            weekday-format="long"
            month-format="long"
            locale="ru"
            :title-format="{ month: 'long', year: 'numeric' }"
            month-name-format="long"
          />
        </div>

        <div class="field-group">
          <label>Период заезда до:</label>
          <VueDatePicker
            v-model="searchForm.checkOutDate"
            :min-date="searchForm.checkInDate || new Date()"
            format="dd.MM.yyyy"
            placeholder="Выберите дату"
            :month-change-on-scroll="false"
            :auto-apply="true"
            :enable-time-picker="false"
            :week-start="1"
            weekday-format="long"
            month-format="long"
            locale="ru"
            :title-format="{ month: 'long', year: 'numeric' }"
            month-name-format="long"
          />
        </div>

        <div class="field-group">
          <label>Ночей в отеле от:</label>
          <Multiselect
            v-model="searchForm.nights"
            :options="searchData.nightsOptions.value"
            :searchable="false"
            :canClear="false"
            :canDeselect="false"
            placeholder="6"
            label="label"
            valueProp="value"
            @change="updateNights2Min"
          />
        </div>

        <div class="field-group">
          <label>Ночей в отеле до:</label>
          <Multiselect
            v-model="searchForm.nights2"
            :options="filteredNights2Options"
            :searchable="false"
            :canClear="false"
            :canDeselect="false"
            placeholder="6"
            label="label"
            valueProp="value"
          />
        </div>
      </div>

      <!-- Row 3 - Люди и цены -->
      <div class="form-row">
        <!-- Взрослые -->
        <div class="field-group">
          <label>Взрослых:</label>
          <Multiselect
            v-model="searchForm.adults"
            :options="searchData.adultsOptions.value"
            :searchable="false"
            :canClear="false"
            :canDeselect="false"
            placeholder="2"
            label="label"
            valueProp="value"
          />
        </div>

        <!-- Дети -->
        <div class="field-group">
          <label>Детей:</label>
          <Multiselect
            v-model="searchForm.children"
            :options="searchData.childrenOptions.value"
            :searchable="false"
            :canClear="false"
            :canDeselect="false"
            placeholder="0"
            label="label"
            valueProp="value"
          />
        </div>

        <!-- Возраст детей -->
        <div v-if="searchForm.children > 0" class="field-group">
          <label>Возраст детей:</label>
          <div class="children-ages">
            <Multiselect
              v-for="(age, index) in searchForm.childrenAges"
              :key="index"
              v-model="searchForm.childrenAges[index]"
              :options="[
                { label: '0-2 года', value: 0 },
                { label: '3-12 лет', value: 3 },
                { label: '13-17 лет', value: 13 }
              ]"
              :searchable="false"
              :canClear="false"
              :canDeselect="false"
              placeholder="Возраст"
              label="label"
              valueProp="value"
            />
          </div>
        </div>

        <!-- Цена -->
        <div class="field-group">
          <label>Цена € от:</label>
          <input type="number" v-model="searchForm.priceFrom" placeholder="От" />
        </div>

        <div class="field-group">
          <label>Цена € до:</label>
          <input type="number" v-model="searchForm.priceTo" placeholder="До" />
        </div>
      </div>

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
        @update:regions="selectedFilters.regions = $event"
        @update:categories="selectedFilters.categories = $event"
        @update:hotels="selectedFilters.hotels = $event"
        @update:meals="selectedFilters.meals = $event"
        @update:options="selectedFilters.options = $event"
      />

      <!-- Action Buttons -->
      <div class="action-buttons">
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

    <!-- Результаты поиска -->
    <div v-if="searchResults && Object.keys(searchResults).length > 0" class="search-results-section">
      <h2 class="results-title">Найдено туров: {{ totalResults }}</h2>
      <SearchResults 
        :results="formattedResults" 
        :is-loading="isLoading"
        @book="handleBook"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed, defineAsyncComponent, watch, nextTick } from 'vue'
  import VueDatePicker from '@vuepic/vue-datepicker'
  import '@vuepic/vue-datepicker/dist/main.css'
  import Multiselect from '@vueform/multiselect'
  import '@vueform/multiselect/themes/default.css'
  // Динамический импорт для обхода проблемы с TypeScript
  const SearchFilters = defineAsyncComponent(() => import('./search/SearchFilters.vue'))
  const SearchResults = defineAsyncComponent(() => import('./SearchResults.vue'))
  import { useSearchData } from '../composables/useSearchData'
  import type { SearchForm, SelectedFilters } from '../types/search'

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
    checkInDate: null,
    checkOutDate: null,
    nights: 6,
    nights2: 6,
    adults: 2,
    children: 0,
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

  // Получаем данные из composable
  const searchData = useSearchData()

  // Фильтрованные опции для второго селектора ночей
  const filteredNights2Options = computed(() => {
    if (!searchForm.value.nights) {
      return searchData.nightsOptions.value
    }

    return searchData.nightsOptions.value.filter(
      (option: { value: number; label: string }) => option.value >= searchForm.value.nights
    )
  })

  // Форматированные результаты для отображения
  const formattedResults = computed(() => {
    if (!searchResults.value || typeof searchResults.value !== 'object') {
      return []
    }
    
    // Преобразуем объект результатов в массив
    return Object.values(searchResults.value).map((result: ObsSearchResult) => ({
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
    console.log('Package watch triggered:', newPackage)
    try {
      if (newPackage && newPackage.id) {
        console.log(`Loading data for package ${newPackage.id}: ${newPackage.label || newPackage.name}`)
        console.log('Package full data:', JSON.stringify(newPackage, null, 2))
        
        // Если у пакета есть аэропорты, устанавливаем город прилета
        if (newPackage.airports && newPackage.airports.length > 0) {
          const airport = newPackage.airports[0]
          console.log('Found airport in package:', airport)
          
          // Создаем объект города прилета
          const arrivalCity = {
            id: airport.id,
            name: airport.label || airport.name || `Airport ${airport.id}`
          }
          
          // Принудительно обновляем реактивность
          searchForm.value.arrivalCity = { ...arrivalCity }
          console.log(`Set arrival city to:`, arrivalCity)
          console.log('searchForm.arrivalCity after set:', searchForm.value.arrivalCity)
          
          // Ждем обновления DOM и принудительно обновляем Multiselect
          await nextTick()
          console.log('DOM updated, arrival city should now be visible')
        } else {
          console.log('No airports found in package, checking if it\'s a specific destination package')
          
          // Если это пакет для конкретного направления, 
          // попробуем определить город по названию пакета
          const packageName = (newPackage.label || newPackage.name || '').toLowerCase()
          let arrivalCity = null
          
          if (packageName.includes('antalya')) {
            arrivalCity = {
              id: 50004, // ID аэропорта ANTALYA из документации
              name: 'ANTALYA'
            }
          } else if (packageName.includes('istanbul')) {
            arrivalCity = {
              id: 50005, // ID аэропорта ISTANBUL
              name: 'ISTANBUL'
            }
          } else if (packageName.includes('bodrum')) {
            arrivalCity = {
              id: 50006, // ID аэропорта BODRUM
              name: 'BODRUM'
            }
          } else if (packageName.includes('kemer')) {
            arrivalCity = {
              id: 50007, // ID аэропорта KEMER
              name: 'KEMER'
            }
          } else if (packageName.includes('alanya')) {
            arrivalCity = {
              id: 50008, // ID аэропорта ALANYA
              name: 'ALANYA'
            }
          }
          
          if (arrivalCity) {
            // Принудительно обновляем реактивность
            searchForm.value.arrivalCity = { ...arrivalCity }
            console.log(`Set arrival city based on package name:`, arrivalCity)
            console.log('searchForm.arrivalCity after fallback set:', searchForm.value.arrivalCity)
            
            // Ждем обновления DOM
            await nextTick()
            console.log('DOM updated for fallback city')
          } else {
            console.log('Could not determine arrival city from package name')
          }
        }
        
        // Загружаем связанные данные для поиска отелей
        console.log('Starting to load hotel-related data...')
        await Promise.all([
          searchData.loadHotelCategories(newPackage.id),
          searchData.loadLocations(newPackage.id),
          searchData.loadHotels(newPackage.id),
          searchData.loadMeals(newPackage.id)
        ])
        
        console.log(`Loaded all data for package: ${newPackage.label || newPackage.name}`)
        console.log('Hotels loaded:', searchData.hotels.value.length)
        console.log('Categories loaded:', searchData.categories.value.length)
        console.log('Regions loaded:', searchData.regions.value.length)
        console.log('Meals loaded:', searchData.meals.value.length)
        
        // Автоматически выбираем все регионы и категории
        if (searchData.regions.value.length > 0) {
          selectedFilters.value.regions = [1, ...searchData.regions.value.map(r => r.id)]
          console.log('Auto-selected all regions:', selectedFilters.value.regions)
        }
        
        if (searchData.categories.value.length > 0) {
          selectedFilters.value.categories = [1, ...searchData.categories.value.map(c => c.id)]
          console.log('Auto-selected all categories:', selectedFilters.value.categories)
        }
      } else {
        console.log('Package watch: missing package data', newPackage)
        // Очищаем город прилета при сбросе пакета
        searchForm.value.arrivalCity = null
      }
    } catch (err) {
      console.error('Package watch error:', err)
      console.error('Error details:', {
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        package: newPackage
      })
    }
  })

  // Следим за изменениями количества детей и обновляем массив возрастов
  watch(() => searchForm.value.children, (newValue) => {
    if (newValue === 0) {
      searchForm.value.childrenAges = []
    } else {
      const currentAges = [...searchForm.value.childrenAges]
      searchForm.value.childrenAges = Array(newValue)
        .fill(0)
        .map((_, index) => {
          return index < currentAges.length ? currentAges[index] : 0
        })
    }
  }, { immediate: true })

  // Следим за изменениями nights и обновляем nights2
  watch(() => searchForm.value.nights, (newValue) => {
    if (newValue && (!searchForm.value.nights2 || searchForm.value.nights2 < newValue)) {
      searchForm.value.nights2 = newValue
    }
  }, { immediate: true })

  // Следим за изменениями даты заезда и устанавливаем дату выезда
  watch(() => searchForm.value.checkInDate, (newValue) => {
    if (
      newValue &&
      (!searchForm.value.checkOutDate || searchForm.value.checkOutDate < newValue)
    ) {
      searchForm.value.checkOutDate = newValue
    }
  }, { immediate: true })

  // Emits
  const emit = defineEmits<{
    search: [params: Record<string, unknown>]
  }>()

  // Methods
  const handleSearch = () => {
    // Добавляем выбранные отели в форму поиска
    searchForm.value.selectedHotels = [...selectedFilters.value.hotels]

    console.log('Searching with params:', searchForm.value)
    console.log('Selected filters:', selectedFilters.value)
    console.log('Children ages:', searchForm.value.childrenAges)

    // Проверяем обязательные поля
    if (!searchForm.value.departureCity?.id) {
      console.error('Departure city is required')
      return
    }
    if (!searchForm.value.destination?.id) {
      console.error('Destination country is required')
      return
    }
    if (!searchForm.value.package?.id) {
      console.error('Package is required')
      return
    }
    if (!searchForm.value.arrivalCity?.id) {
      console.error('Arrival city is required')
      return
    }
    if (!searchForm.value.checkInDate) {
      console.error('Check-in date is required')
      return
    }
    if (!searchForm.value.checkOutDate) {
      console.error('Check-out date is required')
      return
    }

    // Форматируем даты в формат DD.MM.YYYY для API
    const formatDate = (date: Date) => {
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      return `${day}.${month}.${year}`
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
      country: Number(searchForm.value.destination.id),
      package_template: Number(searchForm.value.package.id),
      airport_city_from: Number(searchForm.value.departureCity.id),
      airport_city_to: airportCityTo, // Используем подготовленный массив
      date_from: formatDate(searchForm.value.checkInDate),
      date_to: formatDate(searchForm.value.checkOutDate),
      nights_from: Number(searchForm.value.nights),
      nights_to: Number(searchForm.value.nights2),
      adults: Number(searchForm.value.adults),
      children: searchForm.value.children > 0 ? Number(searchForm.value.children) : undefined,
      children_age: searchForm.value.children > 0 ? searchForm.value.childrenAges : undefined,
      selected_hotels: selectedFilters.value.hotels.length > 0 ? selectedFilters.value.hotels.map(id => Number(id)) : [1], // Добавляем selected_hotels, если не выбраны отели, используем [1] как fallback
      meals: selectedFilters.value.meals.length > 0 ? selectedFilters.value.meals.map(mealId => {
        const meal = searchData.meals.value.find(m => m.id === mealId)
        return meal?.name || meal?.label || mealId.toString()
      }) : undefined,
      options: selectedFilters.value.options.length > 0 ? selectedFilters.value.options.map(optionId => {
        return optionId.toString()
      }) : undefined
    }

    console.log('Formatted search params for API:', searchParams)
    console.log('airport_city_to before API call:', searchParams.airport_city_to)
    console.log('airport_city_to type before API call:', typeof searchParams.airport_city_to)
    console.log('airport_city_to isArray before API call:', Array.isArray(searchParams.airport_city_to))

    isLoading.value = true
    
    // Вызываем API поиска
    searchData.performSearch(searchParams)
      .then((result) => {
        console.log('Search result:', result)
        isLoading.value = false
        
        // Сохраняем результаты поиска
        if (result && result.results) {
          searchResults.value = result.results
          totalResults.value = result.total_results || 0
          console.log('Results saved:', searchResults.value)
          console.log('Total results:', totalResults.value)
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
      checkInDate: null,
      checkOutDate: null,
      nights: 6,
      nights2: 6,
      adults: 2,
      children: 0,
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
  }

  // Метод для обновления минимального значения для nights2
  const updateNights2Min = () => {
    if (!searchForm.value.nights2 || searchForm.value.nights2 < searchForm.value.nights) {
      searchForm.value.nights2 = searchForm.value.nights
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
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid #ebebeb;
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
    }

    .reset-btn,
    .search-btn {
      min-width: auto;
      width: 100%;
    }
  }
</style>
