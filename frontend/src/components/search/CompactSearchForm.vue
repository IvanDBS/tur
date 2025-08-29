<template>
  <div class="search-compact">
    <div class="search-row">
      <!-- Откуда -->
      <div class="field-group">
        <label>Откуда:</label>
        <Multiselect
          v-model="form.departureCity"
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
          v-model="form.destination"
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
          v-model="form.date"
          :min-date="new Date()"
          format="dd.MM.yyyy"
          placeholder="29.08.2025"
          :month-change-on-scroll="false"
          :auto-apply="true"
          :enable-time-picker="false"
          :week-start="1"
          weekday-format="short"
        />
      </div>

      <!-- Ночей в отеле -->
      <div class="field-group">
        <label>Ночей в отеле:</label>
        <Multiselect
          v-model="form.nights"
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
          v-model="form.adults"
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
          v-model="form.children"
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
      <button type="button" @click="handleSearch" class="search-btn-compact">
        Поиск тура
      </button>
    </div>
    
    <!-- Селекторы возраста детей -->
    <div v-if="form.children > 0" class="children-ages-row">
      <div 
        v-for="(age, index) in form.childrenAges" 
        :key="index"
        class="field-group children-age"
      >
        <label>Возраст ребенка {{ index + 1 }}:</label>
        <Multiselect
          v-model="form.childrenAges[index]"
          :options="childrenAgeOptions"
          :searchable="false"
          :canClear="false"
          :canDeselect="false"
          placeholder="0"
          label="label"
          valueProp="value"
        />
      </div>
    </div>
    
    <!-- Expand Link -->
    <div class="expand-link-row">
      <button type="button" @click="$emit('expand')" class="expand-link">
        Расширенные параметры
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="expand-icon">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'

interface SearchForm {
  departureCity: any
  destination: any
  date: any
  nights: number
  adults: number
  children: number
  childrenAges: number[]
}

interface Props {
  modelValue: SearchForm
  departureCities: any[]
  countries: any[]
  nightsOptions: any[]
  adultsOptions: any[]
  childrenOptions: any[]
  childrenAgeOptions: any[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: SearchForm]
  search: [form: SearchForm]
  expand: []
}>()

const form = ref<SearchForm>({ ...props.modelValue })

// Следим за изменениями количества детей и обновляем массив возрастов
watch(() => form.value.children, (newValue) => {
  if (newValue === 0) {
    form.value.childrenAges = []
  } else {
    const currentAges = [...form.value.childrenAges]
    form.value.childrenAges = Array(newValue).fill(0).map((_, index) => {
      return index < currentAges.length ? currentAges[index] : 0
    })
  }
}, { immediate: true })

// Синхронизируем с родительским компонентом
watch(form, (newValue) => {
  emit('update:modelValue', newValue)
}, { deep: true })

const handleSearch = () => {
  emit('search', { ...form.value })
}
</script>

<style scoped>
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

/* DatePicker custom styles */
:deep(.dp__main) {
  width: 100% !important;
  font-family: var(--font-family) !important;
  position: relative;
  z-index: 50;
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
  padding: 4px 10px !important;
  padding-left: 10px !important;
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

:deep(.dp__input_wrap) {
  --dp-input-padding: 6px 30px 6px 10px !important;
}

:deep(.dp__input::placeholder) {
  color: #B0B0B0 !important;
}

:deep(.dp__menu) {
  border: 1px solid #DDDDDD !important;
  border-radius: 4px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
  margin-top: 2px !important;
  z-index: 500 !important;
  position: absolute !important;
  background: white !important;
  left: 0 !important;
  right: auto !important;
  transform: none !important;
}

:deep(.dp__outer_menu_wrap) {
  left: 0 !important;
  transform: none !important;
}

:deep(.dp__outer_menu_wrap:hover) {
  left: 0 !important;
  transform: none !important;
}

/* Убираем селекторы года и месяца */
:deep(.dp__month_year_row) {
  display: none !important;
}

:deep(.dp__month_year_select) {
  pointer-events: none !important;
  cursor: default !important;
  background: transparent !important;
  border: none !important;
  color: var(--color-text) !important;
}

/* Делаем стрелки видимыми */
:deep(.dp__inner_nav) {
  background: transparent !important;
  color: var(--color-secondary) !important;
  border: none !important;
  width: 24px !important;
  height: 24px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  transition: opacity 0.2s ease !important;
}

:deep(.dp__inner_nav:hover) {
  opacity: 0.7 !important;
}

:deep(.dp__inner_nav .dp__icon) {
  width: 16px !important;
  height: 16px !important;
  fill: var(--color-secondary) !important;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

/* Русские дни недели */
:deep(.dp__weekday) {
  color: #666 !important;
  font-weight: 500 !important;
  font-size: 12px !important;
}

/* Заменяем английские дни недели на русские */
:deep(.dp__calendar_header_item:nth-child(1))::after {
  content: 'Пн' !important;
}

:deep(.dp__calendar_header_item:nth-child(2))::after {
  content: 'Вт' !important;
}

:deep(.dp__calendar_header_item:nth-child(3))::after {
  content: 'Ср' !important;
}

:deep(.dp__calendar_header_item:nth-child(4))::after {
  content: 'Чт' !important;
}

:deep(.dp__calendar_header_item:nth-child(5))::after {
  content: 'Пт' !important;
}

:deep(.dp__calendar_header_item:nth-child(6))::after {
  content: 'Сб' !important;
}

:deep(.dp__calendar_header_item:nth-child(7))::after {
  content: 'Вс' !important;
}

/* Скрываем оригинальный текст */
:deep(.dp__calendar_header_item) {
  font-size: 0 !important;
}

:deep(.dp__calendar_header_item)::after {
  font-size: 12px !important;
  color: #666 !important;
  font-weight: 500 !important;
}

/* Скрываем ненужные элементы */
:deep(.dp__time_picker) {
  display: none !important;
}

/* Стили для выбранной даты */
:deep(.dp__active_date) {
  background: rgba(26, 60, 97, 0.1) !important; /* Светлая заливка */
  border: 2px solid var(--color-secondary) !important; /* Темно-синий контур */
  color: var(--color-secondary) !important; /* Темно-синий текст */
}

:deep(.dp__active_date:hover) {
  background: rgba(26, 60, 97, 0.2) !important; /* Чуть темнее при hover */
  border: 2px solid var(--color-secondary) !important;
  color: var(--color-secondary) !important;
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

.children-ages-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  width: 100%;
  margin-top: 12px;
}

.children-ages-row .field-group {
  flex: 0 0 25%;
  min-width: 120px;
  max-width: 200px;
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
  
  .search-btn-compact {
    margin-top: 16px;
    margin-left: 0;
    width: 100%;
  }
  
  .expand-link-row {
    margin-top: 8px;
  }
}
</style>
