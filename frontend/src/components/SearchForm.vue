<template>
  <div class="search-container">
    <!-- Compact Search Bar -->
    <div v-if="!expanded" class="search-bar-compact" @click="expandSearch">
      <div class="search-sections">
        <div class="search-section">
          <div class="section-label">Откуда</div>
          <div class="section-value">{{ searchForm.departureCity?.label || 'Город вылета' }}</div>
        </div>
        
        <div class="search-divider"></div>
        
        <div class="search-section">
          <div class="section-label">Куда</div>
          <div class="section-value">{{ searchForm.country?.label || 'Направление' }}</div>
        </div>
        
        <div class="search-divider"></div>
        
        <div class="search-section">
          <div class="section-label">Когда</div>
          <div class="section-value">{{ formatDateRange() || 'Выберите даты' }}</div>
        </div>
        
        <div class="search-divider"></div>
        
        <div class="search-section">
          <div class="section-label">Гости</div>
          <div class="section-value">{{ formatGuests() }}</div>
        </div>
        
        <button class="search-btn-compact">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Expanded Search Form -->
    <div v-if="expanded" class="search-form-expanded">
      <!-- Close Button -->
      <button class="close-btn" @click="collapseSearch">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      <!-- Main Search Fields -->
      <div class="search-grid">
        <!-- Откуда -->
        <div class="field-group">
          <label class="field-label">Откуда</label>
          <Multiselect
            v-model="searchForm.departureCity"
            :options="departureCities"
            :searchable="true"
            :close-on-select="true"
            placeholder="Выберите город"
            label="label"
            track-by="id"
            class="field-input"
          />
        </div>

        <!-- Куда -->
        <div class="field-group">
          <label class="field-label">Куда</label>
          <Multiselect
            v-model="searchForm.country"
            :options="countries"
            :searchable="true"
            :close-on-select="true"
            placeholder="Выберите страну"
            label="label"
            track-by="id"
            class="field-input"
            :disabled="!searchForm.departureCity"
            @select="loadPackageTemplates"
          />
        </div>

        <!-- Даты -->
        <div class="field-group">
          <label class="field-label">Даты поездки</label>
          <VueDatePicker
            v-model="searchForm.dateRange"
            range
            :min-date="new Date()"
            :max-date="maxDate"
            format="dd.MM.yyyy"
            placeholder="Выберите даты"
            class="field-input"
            :teleport="true"
          />
        </div>

        <!-- Ночи -->
        <div class="field-group">
          <label class="field-label">Количество ночей</label>
          <select v-model="searchForm.nights" class="field-input">
            <option value="">Выберите</option>
            <option v-for="night in availableNights" :key="night" :value="night">
              {{ night }} {{ getNightWord(night) }}
            </option>
          </select>
        </div>
      </div>

      <!-- Guests Section -->
      <div class="guests-section">
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

      <!-- Search Button -->
      <button 
        type="button" 
        @click="search" 
        :disabled="!canSearch || isLoading"
        class="search-btn-primary"
      >
        <svg v-if="!isLoading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <div v-if="isLoading" class="loading-spinner"></div>
        {{ isLoading ? 'Поиск...' : 'Найти туры' }}
      </button>
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
const expanded = ref(false)

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

// New methods for compact/expanded view
const expandSearch = () => {
  expanded.value = true
}

const collapseSearch = () => {
  expanded.value = false
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
  max-width: 850px;
  margin: 0 auto;
}

/* Compact Search Bar */
.search-bar-compact {
  background: white;
  border-radius: 50px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border-soft);
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.search-bar-compact:hover {
  box-shadow: var(--shadow-ocean);
  transform: translateY(-2px);
}

.search-sections {
  display: flex;
  align-items: center;
  position: relative;
}

.search-section {
  flex: 1;
  padding: 1rem 1.5rem;
  transition: all 0.2s ease;
}

.search-section:hover {
  background: var(--color-background-soft);
}

.section-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-soft);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
}

.section-value {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-divider {
  width: 1px;
  height: 32px;
  background: var(--color-border);
  opacity: 0.6;
}

.search-btn-compact {
  background: var(--color-ocean);
  color: white;
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  margin: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3);
}

.search-btn-compact:hover {
  background: var(--color-ocean-dark);
  transform: scale(1.05);
}

/* Expanded Search Form */
.search-form-expanded {
  background: white;
  border-radius: 24px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border-soft);
  padding: 2rem;
  position: relative;
  animation: expandForm 0.3s ease;
}

@keyframes expandForm {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: var(--color-background-soft);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-soft);
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--color-border);
  color: var(--color-text);
}

/* Search Grid */
.search-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.field-group {
  display: flex;
  flex-direction: column;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.field-input {
  padding: 0.875rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  font-family: var(--font-family);
  font-size: 0.9rem;
  transition: all 0.2s ease;
  background: white;
}

.field-input:focus {
  outline: none;
  border-color: var(--color-ocean);
  box-shadow: 0 0 0 3px var(--color-ocean-muted);
}

.field-input:hover {
  border-color: var(--color-ocean-light);
}

/* Guests Section */
.guests-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 1rem;
}

.guests-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.guest-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
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
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 0.25rem;
}

.guest-subtitle {
  font-size: 0.875rem;
  color: var(--color-text-soft);
}

.guest-counter {
  display: flex;
  align-items: center;
  gap: 1rem;
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
  transition: all 0.2s ease;
  color: var(--color-text-soft);
}

.counter-btn:hover:not(:disabled) {
  border-color: var(--color-ocean);
  color: var(--color-ocean);
  background: var(--color-ocean-muted);
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
.search-btn-primary {
  width: 100%;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, var(--color-ocean), var(--color-ocean-light));
  color: white;
  border: none;
  border-radius: 16px;
  font-family: var(--font-family);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: var(--shadow-ocean);
}

.search-btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(14, 165, 233, 0.3);
  background: linear-gradient(135deg, var(--color-ocean-light), var(--color-ocean));
}

.search-btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Override third-party component styles */
:deep(.multiselect) {
  min-height: auto;
  border: none !important;
  border-radius: 12px !important;
}

:deep(.multiselect-input) {
  border: none !important;
  padding: 0 !important;
  margin: 0 !important;
  font-size: 0.9rem !important;
}

:deep(.multiselect-single-label) {
  padding: 0 !important;
  line-height: 1.5 !important;
  font-weight: 500 !important;
}

:deep(.multiselect-dropdown) {
  border-radius: 12px !important;
  border: 1px solid var(--color-border) !important;
  box-shadow: var(--shadow-lg) !important;
}

:deep(.dp__main) {
  width: 100%;
}

:deep(.dp__input) {
  border: none !important;
  padding: 0 !important;
  font-size: 0.9rem !important;
  font-weight: 500 !important;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .search-sections {
    flex-direction: column;
  }
  
  .search-section {
    padding: 0.75rem 1rem;
    text-align: left;
  }
  
  .search-divider {
    width: 80%;
    height: 1px;
    margin: 0 auto;
  }
  
  .search-btn-compact {
    margin: 1rem auto;
  }
  
  .search-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .search-form-expanded {
    padding: 1.5rem;
    border-radius: 16px;
  }
  
  .guest-row {
    padding: 0.75rem 0;
  }
}

@media (max-width: 480px) {
  .search-container {
    margin: 0 1rem;
  }
  
  .search-form-expanded {
    padding: 1rem;
  }
}
</style>
