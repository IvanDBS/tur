<template>
  <div class="search-form">
    <!-- Откуда -->
    <div class="field-group">
      <label class="label">Откуда</label>
      <Multiselect
        v-model="searchForm.departureCity"
        :options="departureCities"
        :searchable="true"
        :close-on-select="true"
        placeholder="Выберите город отправления"
        label="label"
        track-by="id"
        class="field"
      />
    </div>

    <!-- Куда -->
    <div class="field-group">
      <label class="label">Куда</label>
      <Multiselect
        v-model="searchForm.country"
        :options="countries"
        :searchable="true"
        :close-on-select="true"
        placeholder="Выберите страну"
        label="label"
        track-by="id"
        class="field"
        :disabled="!searchForm.departureCity"
        @select="loadPackageTemplates"
      />
    </div>

    <!-- Даты -->
    <div class="field-group">
      <label class="label">Даты поездки</label>
      <VueDatePicker
        v-model="searchForm.dateRange"
        range
        :min-date="new Date()"
        :max-date="maxDate"
        format="dd.MM.yyyy"
        placeholder="Выберите даты"
        class="field"
        :teleport="true"
      />
    </div>

    <!-- Ночи -->
    <div class="field-group">
      <label class="label">Количество ночей</label>
      <select v-model="searchForm.nights" class="field select">
        <option value="">Выберите</option>
        <option v-for="night in availableNights" :key="night" :value="night">
          {{ night }} {{ getNightWord(night) }}
        </option>
      </select>
    </div>

    <!-- Гости -->
    <div class="field-group">
      <label class="label">Гости</label>
      <div class="guests-selector">
        <div class="guest-input">
          <span class="guest-label">Взрослые</span>
          <div class="counter">
            <button type="button" @click="decrementAdults" :disabled="searchForm.adults <= 1" class="counter-btn">−</button>
            <span class="counter-value">{{ searchForm.adults }}</span>
            <button type="button" @click="incrementAdults" class="counter-btn">+</button>
          </div>
        </div>
        <div class="guest-input">
          <span class="guest-label">Дети</span>
          <div class="counter">
            <button type="button" @click="decrementChildren" :disabled="searchForm.children <= 0" class="counter-btn">−</button>
            <span class="counter-value">{{ searchForm.children }}</span>
            <button type="button" @click="incrementChildren" class="counter-btn">+</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Кнопка поиска -->
    <button 
      type="button" 
      @click="search" 
      :disabled="!canSearch || isLoading"
      class="search-btn"
    >
      {{ isLoading ? 'Поиск...' : 'Найти туры' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import Multiselect from '@vueform/multiselect'

// Reactive data
const searchForm = ref({
  departureCity: null,
  country: null,
  dateRange: null,
  nights: '',
  adults: 2,
  children: 0
})

const departureCities = ref([])
const countries = ref([])
const packageTemplates = ref([])
const availableNights = ref([7, 8, 10, 14, 15, 21])
const isLoading = ref(false)

// Emits
const emit = defineEmits<{
  search: [params: any]
}>()

// Computed
const maxDate = computed(() => {
  const date = new Date()
  date.setFullYear(date.getFullYear() + 1)
  return date
})

const canSearch = computed(() => {
  return searchForm.value.departureCity && 
         searchForm.value.country && 
         searchForm.value.dateRange && 
         searchForm.value.nights && 
         searchForm.value.adults > 0
})

// Methods
const loadDepartureCities = async () => {
  try {
    // Mock data for now - replace with API call
    departureCities.value = [
      { id: 1, label: 'CHISINAU' },
      { id: 2, label: 'BUCHAREST' }
    ]
  } catch (error) {
    console.error('Failed to load departure cities:', error)
  }
}

const loadCountries = async () => {
  if (!searchForm.value.departureCity) return
  
  try {
    // Mock data for now - replace with API call
    countries.value = [
      { id: 223, label: 'TURCIA' },
      { id: 224, label: 'EGIPT' },
      { id: 225, label: 'GRECIA' }
    ]
  } catch (error) {
    console.error('Failed to load countries:', error)
  }
}

const loadPackageTemplates = async () => {
  if (!searchForm.value.country) return
  
  try {
    // Mock data for now - replace with API call
    packageTemplates.value = [
      { id: 53, label: 'Antalya pachete avion' },
      { id: 63, label: 'Antalya doar cazare' }
    ]
  } catch (error) {
    console.error('Failed to load package templates:', error)
  }
}

const search = async () => {
  if (!canSearch.value) return
  
  isLoading.value = true
  
  try {
    const searchParams = {
      country: searchForm.value.country.id,
      airport_city_from: searchForm.value.departureCity.id,
      date_from: formatDate(searchForm.value.dateRange[0]),
      date_to: formatDate(searchForm.value.dateRange[1]),
      nights_from: parseInt(searchForm.value.nights),
      adults: searchForm.value.adults,
      children: searchForm.value.children
    }
    
    // Emit search event to parent
    emit('search', searchParams)
    
    // Simulate API delay for UI feedback
    await new Promise(resolve => setTimeout(resolve, 500))
    
  } catch (error) {
    console.error('Search failed:', error)
  } finally {
    isLoading.value = false
  }
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-GB')
}

const getNightWord = (count: number) => {
  if (count === 1) return 'ночь'
  if (count >= 2 && count <= 4) return 'ночи'
  return 'ночей'
}

const incrementAdults = () => {
  if (searchForm.value.adults < 10) searchForm.value.adults++
}

const decrementAdults = () => {
  if (searchForm.value.adults > 1) searchForm.value.adults--
}

const incrementChildren = () => {
  if (searchForm.value.children < 10) searchForm.value.children++
}

const decrementChildren = () => {
  if (searchForm.value.children > 0) searchForm.value.children--
}

// Watchers
watch(() => searchForm.value.departureCity, loadCountries)

// Lifecycle
onMounted(() => {
  loadDepartureCities()
})
</script>

<style scoped>
.search-form {
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.field-group {
  margin-bottom: 1.5rem;
}

.label {
  display: block;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.field {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-family: var(--font-family);
  transition: border-color 0.2s ease;
}

.field:focus {
  outline: none;
  border-color: var(--color-primary);
}

.select {
  background: white;
  cursor: pointer;
}

.guests-selector {
  display: flex;
  gap: 1rem;
}

.guest-input {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.guest-label {
  font-size: 0.9rem;
  color: var(--color-text);
}

.counter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.counter-btn {
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-border);
  background: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  transition: all 0.2s ease;
}

.counter-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.counter-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.counter-value {
  min-width: 20px;
  text-align: center;
  font-weight: 500;
}

.search-btn {
  width: 100%;
  padding: 1rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-family: var(--font-family);
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-top: 1rem;
}

.search-btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Override multiselect styles for minimal look */
:deep(.multiselect) {
  min-height: auto;
}

:deep(.multiselect-input) {
  border: none !important;
  padding: 0 !important;
  margin: 0 !important;
}

:deep(.multiselect-single-label) {
  padding: 0;
  line-height: 1.5;
}
</style>
