<template>
  <div class="search-form">
    <!-- Main Search Row -->
    <div class="search-row">
      <!-- From City -->
      <div class="search-field">
        <label class="field-label">Откуда</label>
        <select v-model="searchForm.departureCity" class="field-input">
          <option value="">Город вылета</option>
          <option v-for="city in departureCities" :key="city.id" :value="city">
            {{ city.label }}
          </option>
        </select>
      </div>

      <!-- To Country -->
      <div class="search-field">
        <label class="field-label">Куда</label>
        <select v-model="searchForm.country" class="field-input" :disabled="!searchForm.departureCity">
          <option value="">Направление</option>
          <option v-for="country in countries" :key="country.id" :value="country">
            {{ country.label }}
          </option>
        </select>
      </div>

      <!-- Date Range -->
      <div class="search-field">
        <label class="field-label">Дата вылета</label>
        <VueDatePicker
          v-model="searchForm.dateRange"
          range
          :min-date="new Date()"
          :max-date="maxDate"
          format="dd.MM.yyyy"
          placeholder="пт 29 авг."
          class="field-input"
        />
      </div>

      <!-- Nights -->
      <div class="search-field">
        <label class="field-label">Количество ночей</label>
        <select v-model="searchForm.nights" class="field-input">
          <option value="">на 6 - 10 ночей</option>
          <option v-for="night in availableNights" :key="night" :value="night">
            {{ night }} {{ getNightWord(night) }}
          </option>
        </select>
      </div>

      <!-- Guests -->
      <div class="search-field guests-field" @click="toggleGuestsDropdown">
        <label class="field-label">Гости</label>
        <div class="field-input guests-display">
          <span>{{ formatGuestsShort() }}</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        
        <!-- Guests Dropdown -->
        <div v-if="showGuestsDropdown" class="guests-dropdown">
          <div class="guest-counter-row">
            <span class="guest-label">Взрослые</span>
            <div class="counter-controls">
              <button type="button" @click.stop="decrementAdults" :disabled="searchForm.adults <= 1" class="counter-btn">-</button>
              <span class="counter-value">{{ searchForm.adults }}</span>
              <button type="button" @click.stop="incrementAdults" :disabled="searchForm.adults >= 10" class="counter-btn">+</button>
            </div>
          </div>
          <div class="guest-counter-row">
            <span class="guest-label">Дети</span>
            <div class="counter-controls">
              <button type="button" @click.stop="decrementChildren" :disabled="searchForm.children <= 0" class="counter-btn">-</button>
              <span class="counter-value">{{ searchForm.children }}</span>
              <button type="button" @click.stop="incrementChildren" :disabled="searchForm.children >= 10" class="counter-btn">+</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Search Button -->
      <button 
        type="button" 
        @click="search" 
        :disabled="!canSearch || isLoading"
        class="search-btn"
      >
        {{ isLoading ? 'Поиск...' : 'Найти' }}
      </button>
    </div>

    <!-- Advanced Filters Toggle -->
    <div v-if="!showAdvanced" class="advanced-toggle-row">
      <button type="button" @click="toggleAdvanced" class="advanced-toggle-btn">
        <span>Дополнительные параметры</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </button>
    </div>

    <!-- Advanced Panel -->
    <div v-if="showAdvanced" class="advanced-panel">
      <div class="advanced-header">
        <h3>Дополнительные параметры</h3>
        <button type="button" @click="toggleAdvanced" class="close-advanced">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="advanced-content">
        <p class="info-note">Здесь будут дополнительные фильтры: отели, питание, цены</p>
      </div>
    </div>
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
const showAdvanced = ref(false)
const showGuestsDropdown = ref(false)

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

// Methods for UI interactions
const toggleAdvanced = () => {
  showAdvanced.value = !showAdvanced.value
}

const toggleGuestsDropdown = () => {
  showGuestsDropdown.value = !showGuestsDropdown.value
}

const formatGuestsShort = () => {
  const total = searchForm.value.adults + searchForm.value.children
  if (total === 1) return '1 гость'
  if (total >= 2 && total <= 4) return `${total} гостя`
  return `${total} гостей`
}

const formatDateRange = () => {
  if (!searchForm.value.dateRange || !Array.isArray(searchForm.value.dateRange)) {
    return null
  }
  
  const [start, end] = searchForm.value.dateRange
  if (!start || !end) return null
  
  const startDate = new Date(start).toLocaleDateString('ru-RU', { 
    day: 'numeric', 
    month: 'short' 
  })
  const endDate = new Date(end).toLocaleDateString('ru-RU', { 
    day: 'numeric', 
    month: 'short' 
  })
  
  return `${startDate} — ${endDate}`
}

const formatGuests = () => {
  const adults = searchForm.value.adults
  const children = searchForm.value.children
  const total = adults + children
  
  if (total === 1) return '1 гость'
  if (total >= 2 && total <= 4) return `${total} гостя`
  return `${total} гостей`
}

// Watchers  
watch(() => searchForm.value.departureCity, (newCity) => {
  if (newCity) {
    loadCountries()
  }
})

// Close guests dropdown when clicking outside
watch(showGuestsDropdown, (isOpen) => {
  if (isOpen) {
    const closeDropdown = (e: Event) => {
      if (!(e.target as Element)?.closest('.guests-field')) {
        showGuestsDropdown.value = false
        document.removeEventListener('click', closeDropdown)
      }
    }
    setTimeout(() => document.addEventListener('click', closeDropdown), 0)
  }
})

// Lifecycle
onMounted(() => {
  loadDepartureCities()
})
</script>

<style scoped>
/* Search Form */
.search-form {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

/* Main Search Row */
.search-row {
  display: flex;
  align-items: stretch;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  box-shadow: var(--shadow);
  overflow: hidden;
  transition: all 0.3s ease;
}

.search-row:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

/* Search Fields */
.search-field {
  flex: 1;
  padding: 1rem;
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 80px;
  position: relative;
}

.search-field:last-of-type {
  border-right: none;
}

.search-field:hover {
  background: var(--color-background-muted);
}

.field-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-soft);
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.field-input {
  border: none;
  background: transparent;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text);
  outline: none;
  cursor: pointer;
  font-family: var(--font-family);
}

.field-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Guests Field */
.guests-field {
  position: relative;
  cursor: pointer;
}

.guests-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.guests-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  margin-top: 0.5rem;
  padding: 1rem;
  animation: slideDown 0.2s ease;
}

.guest-counter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
}

.guest-counter-row:not(:last-child) {
  border-bottom: 1px solid var(--color-border);
}

.guest-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text);
}

.counter-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.counter-btn {
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-border);
  background: var(--color-background-soft);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: var(--color-text-soft);
  transition: all 0.2s ease;
}

.counter-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-muted);
}

.counter-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.counter-value {
  min-width: 24px;
  text-align: center;
  font-weight: 600;
  color: var(--color-text);
}

/* Search Button */
.search-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0 2rem;
  font-family: var(--font-family);
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.search-btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Advanced Toggle Row */
.advanced-toggle-row {
  margin-top: 1rem;
  text-align: center;
}

.advanced-toggle-btn {
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  color: var(--color-text-soft);
  font-size: 0.85rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  font-family: var(--font-family);
}

.advanced-toggle-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* Advanced Panel */
.advanced-panel {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  margin-top: 1rem;
  overflow: hidden;
  animation: slideDown 0.3s ease;
}

.advanced-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background-muted);
}

.advanced-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
}

.close-advanced {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-soft);
  transition: all 0.2s ease;
  padding: 0.25rem;
  border-radius: 4px;
}

.close-advanced:hover {
  color: var(--color-text);
  background: var(--color-border);
}

.advanced-content {
  padding: 1.5rem;
}

.info-note {
  color: var(--color-text-soft);
  font-size: 0.9rem;
  margin: 0;
  text-align: center;
  font-style: italic;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Override Date Picker */
:deep(.dp__main) {
  width: 100% !important;
}

:deep(.dp__input) {
  border: none !important;
  padding: 0 !important;
  font-size: 0.9rem !important;
  font-weight: 500 !important;
  background: transparent !important;
  color: var(--color-text) !important;
  font-family: var(--font-family) !important;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .search-row {
    flex-direction: column;
  }
  
  .search-field {
    border-right: none;
    border-bottom: 1px solid var(--color-border);
    min-height: 60px;
    padding: 0.75rem;
  }
  
  .search-field:last-child {
    border-bottom: none;
  }
  
  .search-btn {
    font-size: 0.9rem;
    padding: 1rem;
  }
  
  .guests-dropdown {
    left: -1rem;
    right: -1rem;
  }
}

@media (max-width: 480px) {
  .search-form {
    margin: 0 0.5rem;
  }
  
  .search-field {
    padding: 0.5rem;
    min-height: 50px;
  }
  
  .field-label {
    font-size: 0.7rem;
  }
  
  .field-input {
    font-size: 0.85rem;
  }
}
</style>
