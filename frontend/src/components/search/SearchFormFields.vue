<template>
  <div class="search-form-fields">
    <!-- Row 1 - Основные поля -->
    <div class="form-row">
      <!-- Откуда -->
      <SearchFieldDeparture
        :model-value="searchForm.departureCity"
        @update:model-value="updateField('departureCity', $event)"
        :options="searchData.departureCitiesOptions.value"
        :active-selector="activeSelector"
        :disabled="isLoading"
      />

      <!-- Куда -->
      <SearchFieldDestination
        :model-value="searchForm.destination"
        @update:model-value="updateField('destination', $event)"
        :options="searchData.countriesOptions.value"
        :active-selector="activeSelector"
        :disabled="isLoading || !searchForm.departureCity"
      />

      <!-- Пакет -->
      <SearchFieldPackage
        :model-value="searchForm.package"
        @update:model-value="updateField('package', $event)"
        :options="searchData.packagesOptions.value"
        :active-selector="activeSelector"
        :disabled="isLoading || !searchForm.destination"
      />

      <!-- Город прилета -->
      <SearchFieldArrival
        :model-value="searchForm.arrivalCity"
        :active-selector="activeSelector"
        :disabled="!searchForm.package || isPackageWithoutFlight"
      />
    </div>

    <!-- Row 2 - Даты и ночи -->
    <div class="form-row">
      <!-- Период заезда от -->
      <div class="field-group" :class="{ 'disabled-field': !searchForm.package || (!isPackageWithoutFlight && !searchForm.arrivalCity) }">
        <label class="field-label">
          <span v-if="activeSelector === 'checkInDate'" class="field-arrow"></span>
          Период заезда от:
        </label>
        <VueDatePicker
          :model-value="searchForm.checkInDate"
          @update:model-value="updateField('checkInDate', $event)"
          :min-date="new Date()"
          :max-date="new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)"
          :disabled-dates="getDisabledDates"
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
          :disabled="!searchForm.package || (!isPackageWithoutFlight && !searchForm.arrivalCity)"
        />
      </div>

      <!-- Период заезда до -->
      <div class="field-group" :class="{ 'disabled-field': !searchForm.checkInDate }">
        <label class="field-label">
          <span v-if="activeSelector === 'checkOutDate'" class="field-arrow"></span>
          Период заезда до:
        </label>
        <VueDatePicker
          :model-value="searchForm.checkOutDate"
          @update:model-value="updateField('checkOutDate', $event)"
          :min-date="searchForm.checkInDate || new Date()"
          :max-date="new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)"
          :disabled-dates="getDisabledDates"
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
          :disabled="!searchForm.checkInDate"
        />
      </div>

      <!-- Ночей в отеле от -->
      <div class="field-group" :class="{ 'disabled-field': !searchForm.checkInDate }">
        <label class="field-label">
          <span v-if="activeSelector === 'nights'" class="field-arrow"></span>
          Ночей в отеле от:
        </label>
        <Multiselect
          :model-value="searchForm.nights"
          @update:model-value="updateField('nights', $event)"
          :options="filteredNightsOptions"
          :searchable="false"
          :canClear="false"
          :canDeselect="false"
          placeholder="Выберите количество ночей"
          label="label"
          valueProp="value"
          :disabled="!searchForm.checkInDate"
          @change="$emit('update-nights2-min')"
        />
      </div>

      <!-- Ночей в отеле до -->
      <div class="field-group" :class="{ 'disabled-field': !searchForm.checkInDate }">
        <label class="field-label">
          <span v-if="activeSelector === 'nights2'" class="field-arrow"></span>
          Ночей в отеле до:
        </label>
        <Multiselect
          :model-value="searchForm.nights2"
          @update:model-value="updateField('nights2', $event)"
          :options="filteredNights2Options"
          :searchable="false"
          :canClear="false"
          :canDeselect="false"
          placeholder="Выберите количество ночей"
          label="label"
          valueProp="value"
          :disabled="!searchForm.checkInDate"
        />
      </div>
    </div>

    <!-- Row 3 - Люди и цены -->
    <div class="form-row">
      <SearchFieldPeople
        :adults="searchForm.adults"
        :children="searchForm.children"
        :children-ages="searchForm.childrenAges"
        :adults-options="searchData.adultsOptions.value"
        :children-options="searchData.childrenOptions.value"
        :active-selector="activeSelector"
        :disabled="!searchForm.checkInDate || searchForm.nights === null"
        @update:adults="updateField('adults', $event)"
        @update:children="updateField('children', $event)"
        @update:children-age="updateChildrenAge($event.index, $event.value)"
      />

      <SearchFieldPrice
        :price-from="searchForm.priceFrom"
        :price-to="searchForm.priceTo"
        :active-selector="activeSelector"
        :disabled="searchForm.children === null"
        @update:price-from="updateField('priceFrom', $event)"
        @update:price-to="updateField('priceTo', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, computed } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'
import type { SearchFormFieldsProps, SearchFormFieldsEmits } from '../../types/searchForm'

const SearchFieldDeparture = defineAsyncComponent(() => import('./fields/SearchFieldDeparture.vue'))
const SearchFieldDestination = defineAsyncComponent(() => import('./fields/SearchFieldDestination.vue'))
const SearchFieldPackage = defineAsyncComponent(() => import('./fields/SearchFieldPackage.vue'))
const SearchFieldArrival = defineAsyncComponent(() => import('./fields/SearchFieldArrival.vue'))
const SearchFieldPeople = defineAsyncComponent(() => import('./fields/SearchFieldPeople.vue'))
const SearchFieldPrice = defineAsyncComponent(() => import('./fields/SearchFieldPrice.vue'))

// Props
const props = defineProps<SearchFormFieldsProps>()

// Emits
const emit = defineEmits<SearchFormFieldsEmits>()

// Computed
// Функция для определения пакетов без перелета
const isPackageWithoutFlight = computed((): boolean => {
  const pkg = props.searchForm.package
  if (!pkg) return false
  return !pkg.airports || pkg.airports.length === 0
})
const getDisabledDates = computed(() => {
  // Для пакетов без перелета не блокируем даты на основе calendar hints
  if (isPackageWithoutFlight.value) {
    return []
  }
  
  // Если нет calendar hints, не блокируем даты
  if (!props.calendarHints || !(props.calendarHints as any).calendarHints?.value) {
    return []
  }
  
  const availableDates = Object.keys((props.calendarHints as any).calendarHints.value)
  const disabledDates = []
  
  // Блокируем все даты, кроме доступных
  const today = new Date()
  const oneYearFromNow = new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000)
  
  for (let date = new Date(today); date <= oneYearFromNow; date.setDate(date.getDate() + 1)) {
    const dateString = date.toISOString().split('T')[0]
    if (!availableDates.includes(dateString)) {
      disabledDates.push(new Date(date))
    }
  }
  
  return disabledDates
})

// Фильтруем ночи по выбранной дате
const filteredNightsOptions = computed(() => {
  // Для пакетов без перелета показываем все варианты ночей
  if (isPackageWithoutFlight.value) {
    return props.dynamicNightsOptions
  }
  
  // Если нет выбранной даты или calendar hints, показываем все варианты
  if (!props.searchForm.checkInDate || !props.calendarHints || !(props.calendarHints as any).calendarHints?.value) {
    return props.dynamicNightsOptions
  }
  
  const checkInDate = props.searchForm.checkInDate
  if (!checkInDate || typeof checkInDate.toISOString !== 'function') {
    return props.dynamicNightsOptions
  }
  
  const dateString = checkInDate.toISOString().split('T')[0]
  const dateHints = (props.calendarHints as any).calendarHints.value[dateString]
  
  if (!dateHints || !Array.isArray(dateHints)) {
    return props.dynamicNightsOptions
  }
  
  // Извлекаем доступные ночи для выбранной даты
  const availableNights = new Set<number>()
  dateHints.forEach(hint => {
    const days = hint.days.split(',').map(d => parseInt(d.trim()))
    days.forEach(day => {
      if (!isNaN(day) && day > 0) {
        availableNights.add(day)
      }
    })
  })
  
  // Фильтруем опции по доступным ночам
  const filteredOptions = props.dynamicNightsOptions.filter(option => 
    availableNights.has(option.value)
  )
  
  return filteredOptions.length > 0 ? filteredOptions : props.dynamicNightsOptions
})

// Methods
const updateField = (field: keyof typeof props.searchForm, value: unknown) => {
  const updatedForm = { ...props.searchForm, [field]: value }
  emit('update:searchForm', updatedForm)
}

const updateChildrenAge = (index: number, value: unknown) => {
  const updatedAges = [...props.searchForm.childrenAges]
  updatedAges[index] = value as number
  const updatedForm = { ...props.searchForm, childrenAges: updatedAges }
  emit('update:searchForm', updatedForm)
}

</script>

<style scoped>
.search-form-fields {
  width: 100%;
}

/* Базовые стили для строк форм */
.form-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 12px;
  align-items: center;
}

/* Базовые стили для групп полей */
.field-group {
  flex: 1;
  min-width: 100px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* Стили для лейблов полей */
.field-group label,
.field-label {
  font-size: 11px;
  font-weight: 600;
  color: #222222;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
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

/* Стили для неактивных полей */
.disabled-field .field-label {
  color: #999999 !important;
}

.disabled-field input,
.disabled-field .multiselect,
.disabled-field .dp__input {
  background-color: #f5f5f5 !important;
  color: #999 !important;
  cursor: not-allowed !important;
  border-color: #ddd !important;
  opacity: 0.6;
}

/* Стили для отключенных VueDatePicker */
.disabled-field :deep(.dp__input) {
  background-color: #f5f5f5 !important;
  color: #999 !important;
  cursor: not-allowed !important;
  border-color: #ddd !important;
  opacity: 0.6;
}

.disabled-field :deep(.dp__input_wrap) {
  opacity: 0.6;
}

/* Анимированная стрелка для селекторов */
@keyframes downarrow {
  0% { 
    transform: translateY(0); 
    opacity: 0.4; 
  }
  100% { 
    transform: translateY(0.4em); 
    opacity: 1; 
  }
}

/* Стрелка рядом с названием поля */
.field-arrow {
  display: inline-block;
  margin-right: 0.5rem;
  vertical-align: top;
  margin-top: -0.4em;
}

.field-arrow::before {
  content: '';
  display: inline-block;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 6px solid #2ECC71; /* Зеленая стрелка */
  animation: downarrow 0.8s infinite alternate ease-in-out;
  margin-right: 0.25rem;
}

/* Стили для селекторов возраста детей */
.children-ages {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .field-group {
    min-width: 80px;
  }
}
</style>
