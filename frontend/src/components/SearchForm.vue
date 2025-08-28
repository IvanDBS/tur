<template>
  <div class="search-container">
    <!-- Main Search Bar (Always Visible) -->
    <div class="search-bar-main">
      <div class="search-fields">
        <!-- Откуда -->
        <div class="search-field">
          <div class="field-label">Откуда</div>
          <Multiselect
            v-model="searchForm.departureCity"
            :options="departureCities"
            :searchable="true"
            :close-on-select="true"
            placeholder="Город вылета"
            label="label"
            track-by="id"
            class="field-select"
            @select="loadCountries"
          />
        </div>

        <div class="field-divider"></div>

        <!-- Куда -->
        <div class="search-field">
          <div class="field-label">Куда</div>
          <Multiselect
            v-model="searchForm.country"
            :options="countries"
            :searchable="true"
            :close-on-select="true"
            placeholder="Направление"
            label="label"
            track-by="id"
            class="field-select"
            :disabled="!searchForm.departureCity"
            @select="loadPackageTemplates"
          />
        </div>

        <div class="field-divider"></div>

        <!-- Дата вылета -->
        <div class="search-field">
          <div class="field-label">Дата вылета</div>
          <VueDatePicker
            v-model="searchForm.dateRange"
            range
            :min-date="new Date()"
            :max-date="maxDate"
            format="dd.MM"
            placeholder="Выберите даты"
            class="field-datepicker"
            :teleport="true"
          />
        </div>

        <div class="field-divider"></div>

        <!-- Количество ночей -->
        <div class="search-field">
          <div class="field-label">Количество ночей</div>
          <select v-model="searchForm.nights" class="field-select-native">
            <option value="">на 6 - 10 ночей</option>
            <option v-for="night in availableNights" :key="night" :value="night">
              {{ night }} {{ getNightWord(night) }}
            </option>
          </select>
        </div>

        <!-- Search Button -->
        <button 
          type="button" 
          @click="search" 
          :disabled="!canSearch || isLoading"
          class="search-btn-main"
        >
          {{ isLoading ? 'Поиск...' : 'Найти' }}
        </button>

        <!-- Advanced Options Toggle -->
        <button 
          type="button" 
          @click="toggleAdvanced"
          class="advanced-toggle"
          title="Дополнительные параметры"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path v-if="!showAdvanced" d="M12 5v14M5 12h14"/>
            <path v-else d="M5 12h14"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Advanced Options Panel -->
    <div v-if="showAdvanced" class="advanced-panel">
      <!-- Guests Section -->
      <div class="advanced-section">
        <h3 class="section-title">Гости</h3>
        <div class="guests-grid">
          <div class="guest-row">
            <div class="guest-info">
              <div class="guest-title">Взрослые</div>
              <div class="guest-subtitle">18+ лет</div>
            </div>
            <div class="guest-counter">
              <button 
                type="button" 
                @click="decrementAdults" 
                :disabled="searchForm.adults <= 1" 
                class="counter-btn"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6h7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
              <span class="counter-value">{{ searchForm.adults }}</span>
              <button 
                type="button" 
                @click="incrementAdults" 
                :disabled="searchForm.adults >= 10"
                class="counter-btn"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 2.5v7M2.5 6h7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="guest-row">
            <div class="guest-info">
              <div class="guest-title">Дети</div>
              <div class="guest-subtitle">До 18 лет</div>
            </div>
            <div class="guest-counter">
              <button 
                type="button" 
                @click="decrementChildren" 
                :disabled="searchForm.children <= 0" 
                class="counter-btn"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6h7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
              <span class="counter-value">{{ searchForm.children }}</span>
              <button 
                type="button" 
                @click="incrementChildren" 
                :disabled="searchForm.children >= 10"
                class="counter-btn"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 2.5v7M2.5 6h7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Additional Filters -->
      <div class="advanced-section">
        <h3 class="section-title">Дополнительные параметры</h3>
        <div class="additional-info">
          <p class="info-text">Гости: {{ formatGuests() }}</p>
          <p class="info-text" v-if="searchForm.dateRange">Даты: {{ formatDateRange() }}</p>
        </div>
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

// Methods for advanced options
const toggleAdvanced = () => {
  showAdvanced.value = !showAdvanced.value
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
watch(() => searchForm.value.departureCity, loadCountries)

// Lifecycle
onMounted(() => {
  loadDepartureCities()
})
</script>

<style scoped>
/* Search Container */
.search-container {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

/* Main Search Bar */
.search-bar-main {
  background: white;
  border-radius: 60px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border: 1px solid var(--color-border-soft);
  overflow: hidden;
  transition: all 0.3s ease;
}

.search-bar-main:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.search-fields {
  display: flex;
  align-items: stretch;
  position: relative;
}

.search-field {
  flex: 1;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 80px;
  position: relative;
}

.search-field:hover {
  background: var(--color-background-soft);
}

.field-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-soft);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
}

.field-divider {
  width: 1px;
  height: 40px;
  background: var(--color-border);
  opacity: 0.6;
  align-self: center;
}

/* Form Controls */
.field-select,
.field-datepicker,
.field-select-native {
  border: none !important;
  background: transparent !important;
  padding: 0 !important;
  margin: 0 !important;
  font-size: 0.9rem !important;
  font-weight: 500 !important;
  color: var(--color-text) !important;
  outline: none !important;
  cursor: pointer !important;
  min-height: auto !important;
}

.field-select-native {
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e") !important;
  background-position: right 0 center !important;
  background-repeat: no-repeat !important;
  background-size: 16px 12px !important;
  padding-right: 20px !important;
}

/* Search Button */
.search-btn-main {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 0 2rem;
  margin: 0.5rem;
  height: 60px;
  font-family: var(--font-family);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.3);
  white-space: nowrap;
}

.search-btn-main:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.search-btn-main:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Advanced Toggle */
.advanced-toggle {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  margin: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-soft);
  transition: all 0.2s ease;
}

.advanced-toggle:hover {
  background: var(--color-border);
  color: var(--color-text);
  border-color: var(--color-primary);
}

/* Advanced Panel */
.advanced-panel {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--color-border-soft);
  margin-top: 1rem;
  padding: 1.5rem;
  animation: slideDown 0.3s ease;
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

/* Advanced Sections */
.advanced-section {
  margin-bottom: 1.5rem;
}

.advanced-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 1rem;
}

.guests-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.guest-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-border-soft);
}

.guest-row:last-child {
  border-bottom: none;
}

.guest-info {
  display: flex;
  flex-direction: column;
}

.guest-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 0.25rem;
}

.guest-subtitle {
  font-size: 0.8rem;
  color: var(--color-text-soft);
}

.guest-counter {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.counter-btn {
  width: 28px;
  height: 28px;
  border: 1px solid var(--color-border);
  background: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: var(--color-text-soft);
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
  min-width: 20px;
  text-align: center;
  font-weight: 600;
  color: var(--color-text);
  font-size: 0.9rem;
}

/* Additional Info */
.additional-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-text {
  font-size: 0.85rem;
  color: var(--color-text-soft);
  margin: 0;
}

/* Override third-party component styles */
:deep(.multiselect) {
  min-height: auto !important;
  border: none !important;
  background: transparent !important;
}

:deep(.multiselect-input) {
  border: none !important;
  padding: 0 !important;
  margin: 0 !important;
  font-size: 0.9rem !important;
  background: transparent !important;
}

:deep(.multiselect-single-label) {
  padding: 0 !important;
  line-height: 1.4 !important;
  font-weight: 500 !important;
  background: transparent !important;
}

:deep(.multiselect-dropdown) {
  border-radius: 12px !important;
  border: 1px solid var(--color-border) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
  z-index: 1000 !important;
}

:deep(.dp__main) {
  width: 100% !important;
}

:deep(.dp__input) {
  border: none !important;
  padding: 0 !important;
  font-size: 0.9rem !important;
  font-weight: 500 !important;
  background: transparent !important;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .search-container {
    margin: 0 1rem;
  }
  
  .search-fields {
    flex-direction: column;
  }
  
  .search-field {
    padding: 0.75rem 1rem;
    min-height: 60px;
  }
  
  .field-divider {
    width: 80%;
    height: 1px;
    margin: 0 auto;
  }
  
  .search-btn-main {
    margin: 1rem;
    height: 50px;
    border-radius: 25px;
  }
  
  .advanced-toggle {
    margin: 1rem;
  }
  
  .advanced-panel {
    margin: 1rem;
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .search-container {
    margin: 0 0.5rem;
  }
  
  .search-field {
    padding: 0.5rem 0.75rem;
    min-height: 50px;
  }
  
  .field-label {
    font-size: 0.7rem;
  }
  
  .search-btn-main {
    font-size: 0.9rem;
    padding: 0 1.5rem;
  }
}
</style>
