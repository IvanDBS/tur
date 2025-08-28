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
            placeholder="4"
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
            :min-date="searchForm.checkInDate"
            format="dd.MM.yyyy"
            placeholder="29.08.2025"
            :month-change-on-scroll="false"
            :auto-apply="true"
            :enable-time-picker="false"
          />
        </div>

                        <div class="field-group">
                  <label>Ночей в отеле:</label>
                  <Multiselect
                    v-model="searchForm.nights"
                    :options="nightsOptions"
                    :searchable="false"
                    :canClear="false"
                    :canDeselect="false"
                    placeholder="4"
                    label="label"
                    valueProp="value"
                  />
                </div>

                <div class="field-group">
                  <label></label>
                  <Multiselect
                    v-model="searchForm.nights2"
                    :options="nightsOptions"
                    :searchable="false"
                    :canClear="false"
                    :canDeselect="false"
                    placeholder="4"
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
          <label>Диапазон цен:</label>
          <input type="number" v-model="searchForm.priceFrom" placeholder="От">
        </div>

        <div class="field-group">
          <label></label>
          <input type="number" v-model="searchForm.priceTo" placeholder="До">
        </div>
      </div>

      <!-- Filters Section -->
      <div class="filters-section">
        <!-- Region -->
        <div class="filter-group">
          <label>Регион:</label>
          <div class="filter-options">
            <button 
              v-for="region in regions" 
              :key="region.id"
              :class="{ active: selectedRegions.includes(region.id) }"
              @click="toggleRegion(region.id)"
            >
              {{ region.name }}
            </button>
          </div>
        </div>

        <!-- Category -->
        <div class="filter-group">
          <label>Категория:</label>
          <div class="filter-options">
            <button 
              v-for="category in categories" 
              :key="category.id"
              :class="{ active: selectedCategories.includes(category.id) }"
              @click="toggleCategory(category.id)"
            >
              {{ category.name }}
            </button>
          </div>
        </div>

        <!-- Hotels -->
        <div class="filter-group">
          <label>Отели:</label>
          <Multiselect
            v-model="searchForm.selectedHotels"
            :options="hotels"
            mode="multiple"
            :searchable="true"
            :canClear="false"
            :canDeselect="false"
            placeholder="Выберите отели"
            label="name"
            valueProp="id"
          />
        </div>

        <!-- Meals -->
        <div class="filter-group">
          <label>Питание:</label>
          <div class="filter-options">
            <button 
              v-for="meal in meals" 
              :key="meal.id"
              :class="{ active: selectedMeals.includes(meal.id) }"
              @click="toggleMeal(meal.id)"
            >
              {{ meal.name }}
            </button>
          </div>
        </div>

        <!-- Options -->
        <div class="filter-group">
          <label>Опции:</label>
          <div class="filter-options">
            <button 
              v-for="option in options" 
              :key="option.id"
              :class="{ active: selectedOptions.includes(option.id) }"
              @click="toggleOption(option.id)"
            >
              {{ option.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button type="button" @click="reset" class="reset-btn">Reset</button>
        <button type="button" @click="search" class="search-btn">Search</button>
      </div>

      <!-- Collapse Button -->
      <button type="button" @click="toggleExpanded" class="collapse-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
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
  nights: 4,
  nights2: 4,
  adults: 2,
  children: 0,
  priceFrom: null,
  priceTo: null,
  selectedHotels: []
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
  { id: 1, name: 'Все' },
  { id: 2, name: 'ALANYA' },
  { id: 3, name: 'ANTALYA' },
  { id: 4, name: 'BELEK' },
  { id: 5, name: 'FETHIYE' },
  { id: 6, name: 'KEMER' },
  { id: 7, name: 'SIDE' }
])

const categories = ref([
  { id: 1, name: 'Все' },
  { id: 2, name: 'Special' },
  { id: 3, name: '2⭐' },
  { id: 4, name: '3⭐' },
  { id: 5, name: '4⭐' },
  { id: 6, name: '5⭐' },
  { id: 7, name: 'BOUTIQUE' }
])

const hotels = ref([
  { id: 1, name: 'A GOOD LIFE UTOPIA FAMILY RESORT' },
  { id: 2, name: 'ACAR HOTEL' },
  { id: 3, name: 'ADALIN HOTEL' },
  { id: 4, name: 'ADALYA ARTSIDE HOTEL' },
  { id: 5, name: 'ADALYA ELITE LARA' },
  { id: 6, name: 'ADALYA OCEAN DELUXE' }
])

const meals = ref([
  { id: 1, name: 'Все' },
  { id: 2, name: 'AI и лучше' },
  { id: 3, name: 'BB' },
  { id: 4, name: 'FB' },
  { id: 5, name: 'HB' },
  { id: 6, name: 'RO' }
])

const options = ref([
  { id: 1, name: 'Все' },
  { id: 2, name: 'Есть места на рейсе' },
  { id: 3, name: 'Есть бизнес класс 🔥' },
  { id: 4, name: 'Только доступные результаты' },
  { id: 5, name: 'Ночной рейс' },
  { id: 6, name: 'Дневной рейс' },
  { id: 7, name: 'Группировка по отелям' }
])

const availableNights = ref([3, 4, 7, 10, 14, 21])

// Опции для Multiselect
const nightsOptions = ref([
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 7, label: '7' },
  { value: 10, label: '10' },
  { value: 14, label: '14' },
  { value: 21, label: '21' }
])

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
const selectedRegions = ref([1])
const selectedCategories = ref([1])
const selectedMeals = ref([1])
const selectedOptions = ref([1])

// Computed
const maxDate = computed(() => {
  const date = new Date()
  date.setFullYear(date.getFullYear() + 1)
  return date
})

// Emits
const emit = defineEmits<{
  search: [params: any]
}>()

// Methods
const search = () => {
  console.log('Searching with params:', searchForm.value)
  console.log('Selected filters:', {
    regions: selectedRegions.value,
    categories: selectedCategories.value,
    meals: selectedMeals.value,
    options: selectedOptions.value
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
    nights: 4,
    nights2: 4,
    adults: 2,
    children: 0,
    priceFrom: null,
    priceTo: null,
    selectedHotels: []
  }
  selectedRegions.value = [1]
  selectedCategories.value = [1]
  selectedMeals.value = [1]
  selectedOptions.value = [1]
}

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

// Filter toggle methods
const toggleRegion = (regionId: number) => {
  const index = selectedRegions.value.indexOf(regionId)
  if (index > -1) {
    selectedRegions.value.splice(index, 1)
  } else {
    selectedRegions.value.push(regionId)
  }
}

const toggleCategory = (categoryId: number) => {
  const index = selectedCategories.value.indexOf(categoryId)
  if (index > -1) {
    selectedCategories.value.splice(index, 1)
  } else {
    selectedCategories.value.push(categoryId)
  }
}

const toggleMeal = (mealId: number) => {
  const index = selectedMeals.value.indexOf(mealId)
  if (index > -1) {
    selectedMeals.value.splice(index, 1)
  } else {
    selectedMeals.value.push(mealId)
  }
}

const toggleOption = (optionId: number) => {
  const index = selectedOptions.value.indexOf(optionId)
  if (index > -1) {
    selectedOptions.value.splice(index, 1)
  } else {
    selectedOptions.value.push(optionId)
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
  padding: 12px;
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
  font-size: 12px !important;
  color: #222222 !important;
  background: #FFFFFF !important;
  font-family: var(--font-family) !important;
  min-height: 28px !important;
  height: 28px !important;
  box-sizing: border-box !important;
}

/* Убираем стрелочки у number input */
.field-group input[type="number"]::-webkit-outer-spin-button,
.field-group input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none !important;
  margin: 0 !important;
}

.field-group input[type="number"] {
  -moz-appearance: textfield !important; /* Firefox */
}

.field-group input[type="text"]:focus,
.field-group input[type="number"]:focus,
.field-group input:not(.multiselect):not([class*="multiselect"]):focus {
  outline: none !important;
  border-color: #6B9FEE !important; /* Синий как у multiselect */
  box-shadow: 0 0 0 2px rgba(107, 159, 238, 0.1) !important;
}

.search-btn-compact {
  background: #FF385C;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0 14px;
  height: 28px;
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
  background: #E31C3D;
}

.expand-link-row {
  text-align: center;
  margin-top: 12px;
}

.expand-link {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
  font-family: var(--font-family);
  transition: all 0.2s ease;
}

.expand-link:hover {
  color: var(--color-primary-hover);
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
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 2fr 2fr;
  gap: 12px;
  align-items: start;
  max-width: 100%;
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

.filter-options button {
  background: #F7F7F7;
  border: 1px solid #DDDDDD;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 11px;
  color: #717171;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: var(--font-family);
  white-space: nowrap;
}

.filter-options button:hover {
  border-color: var(--color-accent-blue);
  background: var(--color-accent-blue-light);
  color: var(--color-accent-blue);
}

.filter-options button.active {
  background: var(--color-accent-blue);
  color: white;
  border-color: var(--color-accent-blue);
}

/* Все фильтры одного голубого цвета */

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #EBEBEB;
}

.reset-btn {
  background: #F7F7F7;
  border: 1px solid #DDDDDD;
  color: #717171;
  border-radius: 6px;
  padding: 10px 20px;
  cursor: pointer;
  font-family: var(--font-family);
  font-weight: 500;
  transition: all 0.2s ease;
}

.reset-btn:hover {
  background: #EBEBEB;
}

.search-btn {
  background: #FF385C;
  border: none;
  color: white;
  border-radius: 6px;
  padding: 10px 24px;
  cursor: pointer;
  font-family: var(--font-family);
  font-weight: 600;
  transition: all 0.2s ease;
}

.search-btn:hover {
  background: #E31C3D;
}

.collapse-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #F7F7F7;
  border: 1px solid #DDDDDD;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.collapse-btn:hover {
  background: #EBEBEB;
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
  
  .filters-section {
    grid-template-columns: 1fr;
    gap: 12px;
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
  min-height: 28px !important;
  height: 28px !important;
  position: relative !important;
  z-index: 10 !important;
}

:deep(.multiselect-wrapper) {
  padding-left: 8px !important; /* ОТСТУП СЛЕВА! */
  padding-right: 25px !important;
  padding-top: 4px !important;
  padding-bottom: 4px !important;
  min-height: 20px !important;
  height: 20px !important;
  line-height: 20px !important;
}

:deep(.multiselect-single-label),
:deep(.multiselect-placeholder) {
  font-size: 12px !important;
  line-height: 20px !important;
  height: 20px !important;
  margin: 0 !important;
  display: flex !important;
  align-items: center !important;
}

:deep(.multiselect:focus-within) {
  border-color: #6B9FEE !important; /* Голубой как в футере */
  box-shadow: 0 0 0 2px rgba(107, 159, 238, 0.1) !important;
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
  background: #E8F4F8 !important; /* Светло серо-голубой */
  color: #4A90A4 !important; /* Темнее для текста */
}

:deep(.multiselect-option.is-selected:hover) {
  background: #D1E7ED !important; /* Чуть темнее при hover */
}

:deep(.multiselect-option:hover) {
  background: #F7F9FA !important; /* Светло-серый при hover */
}

/* Меняем цвет тегов если используется multiple */
:deep(.multiselect-tag) {
  background: #4A90A4 !important; /* Серо-голубой вместо зеленого */
  color: white !important;
}

:deep(.multiselect-tag:hover) {
  background: #3A7A8E !important; /* Темнее при hover */
}

/* Убираем все возможные зеленые цвета */
:deep(.multiselect-option.is-pointed) {
  background: #F7F9FA !important; /* Светло-серый при наведении */
  color: #222222 !important;
}

:deep(.multiselect) {
  --ms-option-color-selected: #4A90A4 !important;
  --ms-option-bg-selected: #E8F4F8 !important;
  --ms-option-bg-selected-pointed: #D1E7ED !important;
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
  min-height: 28px !important;
  height: 28px !important;
  display: flex !important;
  align-items: center !important;
  overflow: hidden !important;
}

:deep(.dp__input_wrap:focus-within) {
  border-color: #6B9FEE !important; /* Синий как у multiselect */
  box-shadow: 0 0 0 2px rgba(107, 159, 238, 0.1) !important;
}

:deep(.dp__input) {
  border: none !important;
  padding: 4px 8px !important;
  font-size: 12px !important;
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