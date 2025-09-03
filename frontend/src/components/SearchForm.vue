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
          <Multiselect
            v-model="searchForm.arrivalCity"
            :options="searchData.arrivalCities.value"
            :searchable="true"
            :canClear="false"
            :canDeselect="false"
            placeholder="Выберите город"
            label="name"
            valueProp="id"
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
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed, defineAsyncComponent } from 'vue'
  import VueDatePicker from '@vuepic/vue-datepicker'
  import '@vuepic/vue-datepicker/dist/main.css'
  import Multiselect from '@vueform/multiselect'
  import '@vueform/multiselect/themes/default.css'
  // Динамический импорт для обхода проблемы с TypeScript
  const SearchFilters = defineAsyncComponent(() => import('./search/SearchFilters.vue'))
  import { useSearchData } from '../composables/useSearchData'
  import type { SearchForm, SelectedFilters } from '../types/search'

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

  // Инициализация данных при монтировании
  onMounted(async () => {
    try {
      await searchData.initializeData()
      console.log('Search data initialized')
    } catch (err) {
      console.error('Failed to initialize search data:', err)
    }
  })

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

    isLoading.value = true
    setTimeout(() => {
      isLoading.value = false
      emit('search', {
        ...searchForm.value,
        selectedRegions: selectedFilters.value.regions,
        selectedCategories: selectedFilters.value.categories,
        selectedMeals: selectedFilters.value.meals,
        selectedOptions: selectedFilters.value.options,
        childrenAges: searchForm.value.childrenAges,
      })
    }, 1000)
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
