<template>
  <div class="search-container">
    <!-- Compact Search Form -->
    <div v-if="!isExpanded" class="search-compact">
      <div class="search-row">
        <!-- Откуда -->
        <div class="field-group">
          <label>Откуда:</label>
                  <Multiselect
          v-model="searchForm.departureCity"
          :options="departureCities"
          :searchable="true"
          :canClear="false"
          :canDeselect="false"
          placeholder="Кишинёв"
          label="name"
          valueProp="id"
        />
        </div>

        <!-- Куда -->
        <div class="field-group">
          <label>Куда:</label>
          <Multiselect
            v-model="searchForm.destination"
            :options="countries"
            :searchable="true"
            :canClear="false"
            :canDeselect="false"
            placeholder="Турция"
            label="name"
            valueProp="id"
          />
        </div>

        <!-- Дата вылета -->
        <div class="field-group">
          <label>Дата вылета:</label>
          <VueDatePicker
            v-model="searchForm.date"
            :min-date="new Date()"
            format="dd.MM.yyyy"
            placeholder="29.08.2025"
            :month-change-on-scroll="false"
            :auto-apply="true"
            :enable-time-picker="false"
          />
        </div>

        <!-- Ночей в отеле -->
        <div class="field-group">
          <label>Ночей в отеле:</label>
          <Multiselect
            v-model="searchForm.nights"
            :options="nightsOptions"
            :searchable="false"
            :canClear="false"
            :canDeselect="false"
            placeholder="6"
            label="label"
            valueProp="value"
          />
        </div>

        <!-- Взрослых -->
        <div class="field-group">
          <label>Взрослых:</label>
          <Multiselect
            v-model="searchForm.adults"
            :options="adultsOptions"
            :searchable="false"
            :canClear="false"
            :canDeselect="false"
            placeholder="2"
            label="label"
            valueProp="value"
          />
        </div>

        <!-- Детей -->
        <div class="field-group">
          <label>Детей (0-17.99):</label>
          <Multiselect
            v-model="searchForm.children"
            :options="childrenOptions"
            :searchable="false"
            :canClear="false"
            :canDeselect="false"
            placeholder="0"
            label="label"
            valueProp="value"
          />
        </div>

        <!-- Search Button -->
        <button type="button" @click="search" class="search-btn-compact">
          Поиск тура
        </button>
      </div>
      
      <!-- Expand Link -->
      <div class="expand-link-row">
        <button type="button" @click="toggleExpanded" class="expand-link">
          Расширенные параметры
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="expand-icon">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>
    </div>

    <!-- Expanded Search Form -->
    <div v-else class="search-expanded">
      <!-- Row 1 -->
      <div class="form-row">
        <div class="field-group">
          <label>Откуда:</label>
          <Multiselect
            v-model="searchForm.departureCity"
            :options="departureCities"
            :searchable="true"
            :canClear="false"
            :canDeselect="false"
            placeholder="CHISINAU"
            label="name"
            valueProp="id"
          />
        </div>

        <div class="field-group">
          <label>Куда:</label>
          <Multiselect
            v-model="searchForm.destination"
            :options="countries"
            :searchable="true"
            :canClear="false"
            :canDeselect="false"
            placeholder="TÜRKIYE"
            label="name"
            valueProp="id"
          />
        </div>

        <div class="field-group">
          <label>Пакет:</label>
          <Multiselect
            v-model="searchForm.package"
            :options="packages"
            :searchable="true"
            :canClear="false"
            :canDeselect="false"
            placeholder="ANTALYA FULL"
            label="name"
            valueProp="id"
          />
        </div>

        <div class="field-group">
          <label>Город прилета:</label>
          <Multiselect
            v-model="searchForm.arrivalCity"
            :options="arrivalCities"
            :searchable="true"
            :canClear="false"
            :canDeselect="false"
            placeholder="ANTALYA"
            label="name"
            valueProp="id"
          />
        </div>
      </div>

      <!-- Row 2 -->
      <div class="form-row">
        <div class="field-group">
          <label>Период заезда:</label>
          <VueDatePicker
            v-model="searchForm.checkInDate"
            :min-date="new Date()"
            format="dd.MM.yyyy"
            placeholder="29.08.2025"
            :month-change-on-scroll="false"
            :auto-apply="true"
            :enable-time-picker="false"
          />
        </div>

        <div class="field-group">
          <label></label>
          <VueDatePicker
            v-model="searchForm.checkOutDate"
            :min-date="searchForm.checkInDate || new Date()"
            format="dd.MM.yyyy"
            placeholder="29.08.2025"
            :month-change-on-scroll="false"
            :auto-apply="true"
            :enable-time-picker="false"
          />
        </div>

                        <div class="field-group">
                  <label>Ночей в отеле от:</label>
                  <Multiselect
                    v-model="searchForm.nights"
                    :options="nightsOptions"
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

              <!-- Row 3 -->
              <div class="form-row">
                <div class="field-group">
                  <label>Взрослых:</label>
                  <Multiselect
                    v-model="searchForm.adults"
                    :options="adultsOptions"
                    :searchable="false"
                    :canClear="false"
                    :canDeselect="false"
                    placeholder="2"
                    label="label"
                    valueProp="value"
                  />
                </div>

                <div class="field-group">
                  <label>Детей (0-17.99):</label>
                  <Multiselect
                    v-model="searchForm.children"
                    :options="childrenOptions"
                    :searchable="false"
                    :canClear="false"
                    :canDeselect="false"
                    placeholder="0"
                    label="label"
                    valueProp="value"
                  />
                </div>

        <div class="field-group">
          <label>Цена € от:</label>
          <input type="number" v-model="searchForm.priceFrom" placeholder="От">
        </div>

        <div class="field-group">
          <label>Цена € до:</label>
          <input type="number" v-model="searchForm.priceTo" placeholder="До">
        </div>
      </div>

      <!-- Filters Section -->
      <div class="filters-section">
        <div class="filters-row">
          <!-- Регион - 12.5% -->
          <div class="filters-column extra-small">
            <!-- Region -->
            <div class="filter-group">
              <label>Регион:</label>
              <div class="filter-options vertical">
                <button 
                  v-for="region in regions" 
                  :key="region.id"
                  :class="{ active: selectedRegions.includes(region.id), 'all-button': region.id === 1 }"
                  @click="toggleRegion(region.id)"
                >
                  {{ region.name }}
                </button>
              </div>
            </div>
          </div>

          <!-- Категория - 12.5% -->
          <div class="filters-column extra-small">
            <!-- Category -->
            <div class="filter-group">
              <label>Категория:</label>
              <div class="filter-options vertical">
                <button 
                  v-for="category in categories" 
                  :key="category.id"
                  :class="{ active: selectedCategories.includes(category.id), 'all-button': category.id === 1 }"
                  @click="toggleCategory(category.id)"
                >
                  {{ category.name }}
                </button>
              </div>
            </div>
          </div>

          <!-- Отели - 50% -->
          <div class="filters-column medium">
            <!-- Hotels -->
            <div class="filter-group">
              <label>Отели:</label>
              <div class="filter-options vertical hotel-list">
                <div class="hotel-item all-item" @click="toggleAllHotels" :class="{ active: allHotelsSelected }">
                  <span>Любой</span>
                </div>
                <div class="hotel-item hotel-search-item">
                  <div class="search-input-container">
                    <div class="search-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                    </div>
                    <input type="text" placeholder="Поиск отеля" class="hotel-search-input" v-model="hotelSearchQuery" @input="filterHotels" />
                  </div>
                </div>
                <div class="hotel-item" v-for="hotel in filteredHotels" :key="hotel.id" @click="toggleHotel(hotel.id)" :class="{ active: selectedHotels.includes(hotel.id) }">
                  <span>{{ hotel.name }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Питание - 10% -->
          <div class="filters-column meals">
            <!-- Meals -->
            <div class="filter-group">
              <label>Питание:</label>
              <div class="filter-options vertical">
                <button 
                  v-for="meal in meals" 
                  :key="meal.id"
                  :class="{ active: selectedMeals.includes(meal.id), 'all-button': meal.id === 1 }"
                  @click="toggleMeal(meal.id)"
                >
                  {{ meal.name }}
                </button>
              </div>
            </div>
          </div>

          <!-- Опции - 15% -->
          <div class="filters-column options">
            <!-- Options -->
            <div class="filter-group">
              <label>Опции:</label>
              <div class="filter-options vertical">
                <button 
                  v-for="option in options" 
                  :key="option.id"
                  :class="{ active: selectedOptions.includes(option.id), 'all-button': option.id === 1 }"
                  @click="toggleOption(option.id)"
                >
                  {{ option.name }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button type="button" @click="reset" class="reset-btn">Сбросить параметры</button>
        <button type="button" @click="search" class="search-btn">Поиск тура</button>
      </div>

      <!-- Collapse Button -->
      <div class="collapse-link-row">
        <button type="button" @click="toggleExpanded" class="collapse-link">
          Скрыть расширенные параметры
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="collapse-icon">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css' // ВЕРНУЛ - без них не работает!

// Reactive data
const searchForm = ref({
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
  priceFrom: null,
  priceTo: null,
  selectedHotels: [] as number[]
})

const isExpanded = ref(false)
const isLoading = ref(false)

const departureCities = ref([
  { id: 1, name: 'CHISINAU' },
  { id: 2, name: 'BUCHAREST' },
  { id: 3, name: 'ODESSA' }
])

const countries = ref([
  { id: 1, name: 'TÜRKIYE' },
  { id: 2, name: 'EGYPT' },
  { id: 3, name: 'GREECE' },
  { id: 4, name: 'BULGARIA' },
  { id: 5, name: 'SPAIN' }
])

const packages = ref([
  { id: 1, name: 'ANTALYA FULL' },
  { id: 2, name: 'ANTALYA HOTEL ONLY' },
  { id: 3, name: 'KEMER FULL' }
])

const arrivalCities = ref([
  { id: 1, name: 'ANTALYA' },
  { id: 2, name: 'ISTANBUL' },
  { id: 3, name: 'BODRUM' }
])

const regions = ref([
  { id: 1, name: 'Любой' },
  { id: 2, name: 'ALANYA' },
  { id: 3, name: 'ANTALYA' },
  { id: 4, name: 'BELEK' },
  { id: 5, name: 'FETHIYE' },
  { id: 6, name: 'KEMER' },
  { id: 7, name: 'SIDE' }
])

const categories = ref([
  { id: 1, name: 'Любая' },
  { id: 2, name: 'Special' },
  { id: 3, name: '2⭐' },
  { id: 4, name: '3⭐' },
  { id: 5, name: '4⭐' },
  { id: 6, name: '5⭐' },
  { id: 7, name: 'BOUTIQUE' }
])

// Список отелей
const hotels = ref([
  { id: 1, name: 'ALBATROS AQUA BLU RESORT SHARM EL SHEKH' },
  { id: 2, name: 'ALBATROS AQUA PARK' },
  { id: 3, name: 'ALBATROS LAGUNA VISTA BEACH' },
  { id: 4, name: 'ALBATROS PALACE' },
  { id: 5, name: 'ALBATROS ROYAL GRAND SHARM RESORT (ADULT ONLY)' },
  { id: 6, name: 'ALBATROS SHARM RESORT (EX.BEACH ALBATROS SHARM EL SHEIKH)' }
])

// Поиск отелей
const hotelSearchQuery = ref('')
const selectedHotels = ref<number[]>([])
const allHotelsSelected = ref(false)

// Фильтрация отелей по поисковому запросу
const filteredHotels = computed(() => {
  if (!hotelSearchQuery.value) {
    return hotels.value
  }
  
  const query = hotelSearchQuery.value.toLowerCase()
  return hotels.value.filter(hotel => hotel.name.toLowerCase().includes(query))
})

// Выбор/отмена выбора всех отелей
const toggleAllHotels = () => {
  if (allHotelsSelected.value) {
    selectedHotels.value = []
    allHotelsSelected.value = false
  } else {
    selectedHotels.value = hotels.value.map(hotel => hotel.id)
    allHotelsSelected.value = true
  }
}

// Выбор/отмена выбора отдельного отеля
const toggleHotel = (hotelId: number) => {
  const index = selectedHotels.value.indexOf(hotelId)
  if (index > -1) {
    selectedHotels.value.splice(index, 1)
    allHotelsSelected.value = false
  } else {
    selectedHotels.value.push(hotelId)
    // Проверяем, все ли отели выбраны
    if (selectedHotels.value.length === hotels.value.length) {
      allHotelsSelected.value = true
    }
  }
}

// Фильтрация отелей
const filterHotels = () => {
  // Функция вызывается при вводе в поле поиска
  // Фильтрация происходит автоматически через computed свойство filteredHotels
}

const meals = ref([
  { id: 1, name: 'Любое' },
  { id: 2, name: 'AI и лучше' },
  { id: 3, name: 'BB' },
  { id: 4, name: 'FB' },
  { id: 5, name: 'HB' },
  { id: 6, name: 'RO' }
])

const options = ref([
  { id: 1, name: 'Выбрать все' },
  { id: 2, name: 'Есть места на рейсе' },
  { id: 3, name: 'Бизнесс класс $' },
  { id: 4, name: 'Доступные туры' },
  { id: 5, name: 'Ночной рейс' },
  { id: 6, name: 'Дневной рейс' }
])



// Опции для Multiselect
const nightsOptions = ref([
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
  { value: 6, label: '6' },
  { value: 7, label: '7' },
  { value: 8, label: '8' },
  { value: 9, label: '9' },
  { value: 10, label: '10' },
  { value: 11, label: '11' },
  { value: 12, label: '12' },
  { value: 13, label: '13' },
  { value: 14, label: '14' },
  { value: 15, label: '15' },
  { value: 16, label: '16' },
  { value: 17, label: '17' },
  { value: 18, label: '18' },
  { value: 19, label: '19' },
  { value: 20, label: '20' },
  { value: 21, label: '21' },
  { value: 22, label: '22' },
  { value: 23, label: '23' },
  { value: 24, label: '24' },
  { value: 25, label: '25' },
  { value: 26, label: '26' },
  { value: 27, label: '27' },
  { value: 28, label: '28' },
  { value: 29, label: '29' },
  { value: 30, label: '30' }
])

// Фильтрованные опции для второго селектора ночей
const filteredNights2Options = computed(() => {
  if (!searchForm.value.nights) {
    return nightsOptions.value
  }
  
  return nightsOptions.value.filter(option => option.value >= searchForm.value.nights)
})

// Следим за изменениями nights и обновляем nights2
watch(() => searchForm.value.nights, (newValue) => {
  if (newValue && (!searchForm.value.nights2 || searchForm.value.nights2 < newValue)) {
    searchForm.value.nights2 = newValue
  }
}, { immediate: true })

const adultsOptions = ref([
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
  { value: 6, label: '6' },
  { value: 7, label: '7' },
  { value: 8, label: '8' },
  { value: 9, label: '9' },
  { value: 10, label: '10' }
])

const childrenOptions = ref([
  { value: 0, label: '0' },
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
  { value: 6, label: '6' },
  { value: 7, label: '7' },
  { value: 8, label: '8' },
  { value: 9, label: '9' },
  { value: 10, label: '10' }
])

// Selected filters
const selectedRegions = ref<number[]>([])
const selectedCategories = ref<number[]>([])
const selectedMeals = ref<number[]>([])
const selectedOptions = ref<number[]>([])



// Emits
const emit = defineEmits<{
  search: [params: Record<string, unknown>]
}>()

// Метод для обновления минимального значения для nights2
const updateNights2Min = () => {
  // Всегда обновляем nights2, чтобы оно было не меньше nights
  if (!searchForm.value.nights2 || searchForm.value.nights2 < searchForm.value.nights) {
    searchForm.value.nights2 = searchForm.value.nights
  }
}

// Methods
const search = () => {
  // Добавляем выбранные отели в форму поиска
  searchForm.value.selectedHotels = [...selectedHotels.value]
  
  console.log('Searching with params:', searchForm.value)
  console.log('Selected filters:', {
    regions: selectedRegions.value,
    categories: selectedCategories.value,
    meals: selectedMeals.value,
    options: selectedOptions.value,
    hotels: selectedHotels.value
  })
  
  // После поиска всегда показываем компактную форму
  isExpanded.value = false
  
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
    emit('search', {
      ...searchForm.value,
      selectedRegions: selectedRegions.value,
      selectedCategories: selectedCategories.value,
      selectedMeals: selectedMeals.value,
      selectedOptions: selectedOptions.value
    })
  }, 1000)
}

const reset = () => {
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
    priceFrom: null,
    priceTo: null,
    selectedHotels: []
  }
  selectedRegions.value = []
  selectedCategories.value = []
  selectedMeals.value = []
  selectedOptions.value = []
}

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

// Filter toggle methods
const toggleRegion = (regionId: number) => {
  // Если нажата кнопка "Все" (id: 1)
  if (regionId === 1) {
    // Если "Все" уже выбрано, снимаем все выделения
    if (selectedRegions.value.includes(1)) {
      selectedRegions.value = []
    } else {
      // Иначе выбираем все регионы
      selectedRegions.value = regions.value.map(region => region.id)
    }
    return
  }

  // Обычная логика переключения для других кнопок
  const index = selectedRegions.value.indexOf(regionId)
  if (index > -1) {
    selectedRegions.value.splice(index, 1)
    // Если убрали какой-то регион, то убираем и "Все"
    if (selectedRegions.value.includes(1)) {
      const allIndex = selectedRegions.value.indexOf(1)
      selectedRegions.value.splice(allIndex, 1)
    }
  } else {
    selectedRegions.value.push(regionId)
    // Если выбраны все регионы кроме "Все", добавляем и "Все"
    const allRegionsSelected = regions.value
      .filter(region => region.id !== 1)
      .every(region => selectedRegions.value.includes(region.id))
    
    if (allRegionsSelected && !selectedRegions.value.includes(1)) {
      selectedRegions.value.push(1)
    }
  }
}

const toggleCategory = (categoryId: number) => {
  // Если нажата кнопка "Все" (id: 1)
  if (categoryId === 1) {
    // Если "Все" уже выбрано, снимаем все выделения
    if (selectedCategories.value.includes(1)) {
      selectedCategories.value = []
    } else {
      // Иначе выбираем все категории
      selectedCategories.value = categories.value.map(category => category.id)
    }
    return
  }

  // Обычная логика переключения для других кнопок
  const index = selectedCategories.value.indexOf(categoryId)
  if (index > -1) {
    selectedCategories.value.splice(index, 1)
    // Если убрали какую-то категорию, то убираем и "Все"
    if (selectedCategories.value.includes(1)) {
      const allIndex = selectedCategories.value.indexOf(1)
      selectedCategories.value.splice(allIndex, 1)
    }
  } else {
    selectedCategories.value.push(categoryId)
    // Если выбраны все категории кроме "Все", добавляем и "Все"
    const allCategoriesSelected = categories.value
      .filter(category => category.id !== 1)
      .every(category => selectedCategories.value.includes(category.id))
    
    if (allCategoriesSelected && !selectedCategories.value.includes(1)) {
      selectedCategories.value.push(1)
    }
  }
}

const toggleMeal = (mealId: number) => {
  // Если нажата кнопка "Все" (id: 1)
  if (mealId === 1) {
    // Если "Все" уже выбрано, снимаем все выделения
    if (selectedMeals.value.includes(1)) {
      selectedMeals.value = []
    } else {
      // Иначе выбираем все типы питания
      selectedMeals.value = meals.value.map(meal => meal.id)
    }
    return
  }

  // Обычная логика переключения для других кнопок
  const index = selectedMeals.value.indexOf(mealId)
  if (index > -1) {
    selectedMeals.value.splice(index, 1)
    // Если убрали какой-то тип питания, то убираем и "Все"
    if (selectedMeals.value.includes(1)) {
      const allIndex = selectedMeals.value.indexOf(1)
      selectedMeals.value.splice(allIndex, 1)
    }
  } else {
    selectedMeals.value.push(mealId)
    // Если выбраны все типы питания кроме "Все", добавляем и "Все"
    const allMealsSelected = meals.value
      .filter(meal => meal.id !== 1)
      .every(meal => selectedMeals.value.includes(meal.id))
    
    if (allMealsSelected && !selectedMeals.value.includes(1)) {
      selectedMeals.value.push(1)
    }
  }
}

const toggleOption = (optionId: number) => {
  // Если нажата кнопка "Все" (id: 1)
  if (optionId === 1) {
    // Если "Все" уже выбрано, снимаем все выделения
    if (selectedOptions.value.includes(1)) {
      selectedOptions.value = []
    } else {
      // Иначе выбираем все опции
      selectedOptions.value = options.value.map(option => option.id)
    }
    return
  }

  // Обычная логика переключения для других кнопок
  const index = selectedOptions.value.indexOf(optionId)
  if (index > -1) {
    selectedOptions.value.splice(index, 1)
    // Если убрали какую-то опцию, то убираем и "Все"
    if (selectedOptions.value.includes(1)) {
      const allIndex = selectedOptions.value.indexOf(1)
      selectedOptions.value.splice(allIndex, 1)
    }
  } else {
    selectedOptions.value.push(optionId)
    // Если выбраны все опции кроме "Все", добавляем и "Все"
    const allOptionsSelected = options.value
      .filter(option => option.id !== 1)
      .every(option => selectedOptions.value.includes(option.id))
    
    if (allOptionsSelected && !selectedOptions.value.includes(1)) {
      selectedOptions.value.push(1)
    }
  }
}
</script>

<style scoped>
/* Search Form Container */
.search-container {
  width: 100%;
  max-width: 1154px;
  margin: 0 auto;
  padding: 12px 0;
  box-sizing: border-box;
}

/* Compact Form */
.search-compact {
  background: #FFFFFF;
  border: 1px solid #DDDDDD;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
  position: relative;
  overflow: visible;
}

.search-row {
  display: flex;
  align-items: end;
  gap: 12px;
  flex-wrap: wrap;
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

/* Стили ТОЛЬКО для обычных input полей (НЕ multiselect) */
.field-group input[type="text"],
.field-group input[type="number"],
.field-group input:not(.multiselect):not([class*="multiselect"]) {
  border: 1px solid #DDDDDD !important;
  border-radius: 4px !important;
  padding: 4px 8px !important;
  font-size: 14px !important;
  color: #222222 !important;
  background: #FFFFFF !important;
  font-family: var(--font-family) !important;
  min-height: 38px !important;
  height: 38px !important;
  box-sizing: border-box !important;
}

/* Убираем стрелочки у number input */
.field-group input[type="number"]::-webkit-outer-spin-button,
.field-group input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none !important;
  margin: 0 !important;
}

.field-group input[type="number"] {
  appearance: textfield !important; 
  -moz-appearance: textfield !important; /* Firefox */
}

.field-group input[type="text"]:focus,
.field-group input[type="number"]:focus,
.field-group input:not(.multiselect):not([class*="multiselect"]):focus {
  outline: none !important;
  border-color: var(--color-secondary) !important;
  box-shadow: 0 0 0 2px var(--color-secondary-muted) !important;
}

.search-btn-compact {
  background: white;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: 4px;
  padding: 0 14px;
  height: 38px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  font-family: var(--font-family);
  transition: all 0.2s ease;
  white-space: nowrap;
  margin-left: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-btn-compact:hover {
  background: var(--color-primary-muted);
}

.expand-link-row {
  text-align: center;
  margin-top: 12px;
}

.expand-link {
  background: none;
  border: none;
  color: var(--color-secondary);
  font-size: 12px;
  cursor: pointer;
  text-decoration: none;
  font-family: var(--font-family);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 auto;
}

.expand-link:hover {
  color: var(--color-secondary-hover);
}

.expand-icon {
  margin-top: 2px;
}

/* Expanded Form */
.search-expanded {
  background: #FFFFFF;
  border: 1px solid #DDDDDD;
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

.filters-section {
  border-top: 1px solid #EBEBEB;
  padding-top: 16px;
  margin-top: 16px;
  max-width: 100%;
}

.filters-row {
  display: flex;
  gap: 12px;
  width: 100%;
  flex-wrap: nowrap;
}

.filters-column {
  display: flex;
  flex-direction: column;
}

.filters-column.extra-small {
  flex: 1;
  width: 12.5%; /* Ширина для блоков "Регион" и "Категория" */
}

.filters-column.medium {
  flex: 4;
  width: 50%; /* Ширина для блока "Отели" */
}

.filters-column.meals {
  flex: 0.8;
  width: 10%; /* Ширина для блока "Питание" */
}

.filters-column.options {
  flex: 1.2;
  width: 15%; /* Ширина для блока "Опции" */
}

.filter-group {
  margin-bottom: 0;
}

.filter-group label {
  font-size: 12px;
  font-weight: 600;
  color: #222222;
  display: block;
  margin-bottom: 6px;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.filter-options.vertical {
  display: flex;
  flex-direction: column;
  gap: 0;
  flex-wrap: nowrap;
  height: 210px; /* Увеличено на 1 строку */
  max-height: 210px;
  overflow-y: auto;
  border: 1px solid #DDDDDD;
  border-radius: 4px;
  padding: 0;
  overflow-x: hidden;
}

.filter-options button {
  background: transparent;
  border: none;
  padding: 6px 10px;
  font-size: 14px;
  color: #222222;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: var(--font-family);
  white-space: nowrap;
}

.hotel-search-item {
  padding: 0 !important;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.search-input-container {
  display: flex;
  align-items: center;
  width: 100%;
  padding-left: 10px;
}

.search-icon {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 5px 0 0;
  color: #888888;
  width: 10%;
  flex: 0 0 10%;
  max-width: 25px;
}

.hotel-search-input {
  flex: 1 1 90%;
  width: 90%;
  padding: 6px 0 6px 0;
  margin: 0;
  border: none;
  font-size: 14px;
  font-family: var(--font-family);
  background: transparent;
  height: 32px;
  outline: none;
  text-align: left;
  text-indent: 0;
}

.hotel-list {
  margin-top: 0;
}

.hotel-item {
  display: flex;
  align-items: center;
  padding: 6px 10px;
  border-bottom: 1px solid #F0F0F0;
  cursor: pointer;
  height: 32px;
  box-sizing: border-box;
}

.all-button {
  border-bottom: 1px solid #DDDDDD;
}

.all-item {
  border-bottom: 1px solid #DDDDDD;
}

.hotel-item:hover {
  background-color: var(--color-secondary-muted);
}

.hotel-item.active {
  background-color: var(--color-secondary-muted);
  color: var(--color-secondary);
}

.hotel-item span {
  flex: 1;
  font-size: 14px;
  font-weight: normal;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #222222;
  text-align: left;
}

.filter-options.vertical button {
  text-align: left;
  width: 100%;
  border-radius: 0;
  height: 32px;
  box-sizing: border-box;
}

.filter-options.vertical button:first-child {
  border-bottom: 1px solid #DDDDDD;
}

.filter-options button:hover {
  background: var(--color-secondary-muted);
  color: var(--color-secondary);
}

.filter-options button.active {
  background: var(--color-secondary-muted);
  color: var(--color-secondary);
}

/* Фильтры в темно-синем цвете */

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #EBEBEB;
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
}

.search-btn:hover {
  background: var(--color-primary-muted);
}

.collapse-link-row {
  text-align: center;
  margin-top: 24px;
}

.collapse-link {
  background: none;
  border: none;
  color: var(--color-secondary);
  font-size: 12px;
  cursor: pointer;
  text-decoration: none;
  font-family: var(--font-family);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 auto;
}

.collapse-link:hover {
  color: var(--color-secondary-hover);
}

.collapse-icon {
  margin-top: -2px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .search-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .field-group {
    min-width: auto;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .filters-row {
    flex-direction: column;
    gap: 16px;
  }
  
  .filters-column.extra-small,
  .filters-column.medium {
    width: 100%;
  }
  
  .filter-group {
    margin-bottom: 12px;
  }
  
  .search-btn-compact {
    margin-top: 16px;
    margin-left: 0;
    width: 100%;
  }
  
  .expand-link-row {
    margin-top: 8px;
  }
}

/* ПРОСТЫЕ Multiselect overrides - только отступы! */
:deep(.multiselect) {
  border: 1px solid #DDDDDD !important;
  border-radius: 4px !important;
  font-family: var(--font-family) !important;
  min-height: 38px !important;
  height: 38px !important;
  position: relative !important;
  z-index: 10 !important;
}

:deep(.multiselect-wrapper) {
  padding-left: 8px !important; /* ОТСТУП СЛЕВА! */
  padding-right: 25px !important;
  padding-top: 9px !important;
  padding-bottom: 9px !important;
  min-height: 20px !important;
  height: 20px !important;
  line-height: 20px !important;
}

:deep(.multiselect-single-label),
:deep(.multiselect-placeholder) {
  font-size: 14px !important;
  line-height: 20px !important;
  height: 20px !important;
  margin: 0 !important;
  display: flex !important;
  align-items: center !important;
}

:deep(.multiselect:focus-within) {
  border-color: var(--color-secondary) !important;
  box-shadow: 0 0 0 2px var(--color-secondary-muted) !important;
  z-index: 100 !important; /* Активный селектор поверх остальных */
}

:deep(.multiselect.is-open) {
  z-index: 100 !important; /* Открытый селектор поверх остальных */
}

/* Специфичные стили для multiselect в компактной форме */
.search-compact :deep(.multiselect) {
  z-index: 20 !important;
}

.search-compact :deep(.multiselect:focus-within),
.search-compact :deep(.multiselect.is-open) {
  z-index: 200 !important; /* Выше чем в расширенной форме */
}

.search-compact :deep(.multiselect-dropdown) {
  z-index: 2000 !important; /* Выше чем в расширенной форме */
}

:deep(.multiselect-dropdown) {
  z-index: 1000 !important;
  position: absolute !important;
}

/* Меняем зеленый цвет выбранного элемента на теплый серо-голубой */
:deep(.multiselect-option.is-selected) {
  background: rgba(26, 60, 97, 0.1) !important; /* Светлый темно-синий */
  color: var(--color-secondary) !important; /* Темно-синий для текста */
}

:deep(.multiselect-option.is-selected:hover) {
  background: rgba(26, 60, 97, 0.2) !important; /* Чуть темнее при hover */
}

:deep(.multiselect-option:hover) {
  background: #F7F9FA !important; /* Светло-серый при hover */
}

/* Меняем цвет тегов если используется multiple */
:deep(.multiselect-tag) {
  background: var(--color-secondary) !important; /* Темно-синий */
  color: white !important;
}

:deep(.multiselect-tag:hover) {
  background: var(--color-secondary-hover) !important; /* Темнее при hover */
}

/* Убираем все возможные зеленые цвета */
:deep(.multiselect-option.is-pointed) {
  background: #F7F9FA !important; /* Светло-серый при наведении */
  color: #222222 !important;
}

:deep(.multiselect) {
  --ms-option-color-selected: var(--color-secondary) !important;
  --ms-option-bg-selected: rgba(26, 60, 97, 0.1) !important;
  --ms-option-bg-selected-pointed: rgba(26, 60, 97, 0.2) !important;
}

/* DatePicker overrides */
:deep(.dp__main) {
  width: 100% !important;
  font-family: var(--font-family) !important;
  position: relative;
  z-index: 50; /* Ниже чем multiselect */
}

:deep(.dp__input_wrap) {
  border: 1px solid #DDDDDD !important;
  border-radius: 4px !important;
  background: #FFFFFF !important;
  position: relative !important;
  min-height: 38px !important;
  height: 38px !important;
  display: flex !important;
  align-items: center !important;
  overflow: hidden !important;
}

:deep(.dp__input_wrap:focus-within) {
  border-color: var(--color-secondary) !important;
  box-shadow: 0 0 0 2px var(--color-secondary-muted) !important;
}

:deep(.dp__input) {
  border: none !important;
  padding: 4px 8px !important;
  font-size: 14px !important;
  font-weight: 400 !important;
  background: transparent !important;
  color: #222222 !important;
  font-family: var(--font-family) !important;
  height: 20px !important;
  line-height: 20px !important;
  box-sizing: border-box !important;
  width: 100% !important;
  text-overflow: ellipsis !important;
  overflow: hidden !important;
  white-space: nowrap !important;
}

:deep(.dp__input_icon) {
  display: none !important;
}

:deep(.dp__icon) {
  display: none !important;
}

:deep(.dp__calendar_icon) {
  display: none !important;
}

:deep(.dp__action_icon) {
  display: none !important;
}

:deep(.dp__input::placeholder) {
  color: #B0B0B0 !important;
}

:deep(.dp__menu) {
  border: 1px solid #DDDDDD !important;
  border-radius: 4px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
  margin-top: 2px !important;
  z-index: 500 !important; /* Ниже чем multiselect dropdown */
  position: absolute !important;
  background: white !important;
}

:deep(.dp__overlay_container) {
  z-index: 95 !important;
  position: fixed !important;
}

:deep(.dp__menu_wrapper) {
  z-index: 95 !important;
}

:deep(.dp__overlay) {
  z-index: 95 !important;
  position: fixed !important;
}

:deep(.dp__instance_calendar) {
  z-index: 95 !important;
}

/* Hide time picker and other unnecessary elements */
:deep(.dp__time_picker) {
  display: none !important;
}

:deep(.dp__action_buttons) {
  display: none !important;
}

:deep(.dp__select) {
  display: none !important;
}

:deep(.dp__today) {
  display: none !important;
}

:deep(.dp__clear_icon) {
  display: none !important;
}


</style>