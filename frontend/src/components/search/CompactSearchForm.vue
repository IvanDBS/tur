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
