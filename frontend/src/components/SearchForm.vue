<template>
  <div class="search-container">
    <!-- Airbnb Style Search Bar -->
    <div class="search-bar">
      <!-- Откуда -->
      <div class="search-section">
        <label class="section-label">Город отправления</label>
        <Multiselect
          v-model="searchForm.departureCity"
          :options="departureCities"
          :searchable="true"
          :create-option="false"
          placeholder="Кишинёв"
          label="name"
          valueProp="id"
          class="section-input"
        />
      </div>

      <div class="divider"></div>

      <!-- Куда -->
      <div class="search-section">
        <label class="section-label">Куда</label>
        <Multiselect
          v-model="searchForm.destination"
          :options="countries"
          :searchable="true"
          :create-option="false"
          placeholder="Выберите страну"
          label="name"
          valueProp="id"
          class="section-input"
        />
      </div>

      <div class="divider"></div>

      <!-- Дата -->
      <div class="search-section">
        <label class="section-label">Дата</label>
        <VueDatePicker
          v-model="searchForm.dateRange"
          range
          :min-date="new Date()"
          :max-date="maxDate"
          format="dd.MM.yyyy"
          placeholder="Выберите даты"
          class="section-input"
        />
      </div>

      <div class="divider"></div>

      <!-- Ночи -->
      <div class="search-section">
        <label class="section-label">Ночи</label>
        <select v-model="searchForm.nights" class="section-input">
          <option value="">3-7 ночей</option>
          <option v-for="night in availableNights" :key="night" :value="night">
            {{ night }} {{ getNightWord(night) }}
          </option>
        </select>
      </div>

      <div class="divider"></div>

      <!-- Гости -->
      <div class="search-section guests-section" @click="toggleGuestsDropdown">
        <label class="section-label">Гости</label>
        <div class="section-input guests-display">
          <span>{{ formatGuests() }}</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5"/>
          </svg>
        </div>
        
        <!-- Guests Dropdown -->
        <div v-if="showGuestsDropdown" class="guests-dropdown">
          <div class="guest-row">
            <span>Взрослые</span>
            <div class="counter">
              <button @click.stop="decrementAdults" :disabled="searchForm.adults <= 1">-</button>
              <span>{{ searchForm.adults }}</span>
              <button @click.stop="incrementAdults" :disabled="searchForm.adults >= 10">+</button>
            </div>
          </div>
          <div class="guest-row">
            <span>Дети</span>
            <div class="counter">
              <button @click.stop="decrementChildren" :disabled="searchForm.children <= 0">-</button>
              <span>{{ searchForm.children }}</span>
              <button @click.stop="incrementChildren" :disabled="searchForm.children >= 10">+</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Search Button -->
      <button 
        type="button" 
        @click="search" 
        class="search-button"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <span>Поиск</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'

// Reactive data
const searchForm = ref({
  departureCity: null,
  destination: null,
  dateRange: null,
  nights: '',
  adults: 2,
  children: 0
})

const departureCities = ref([
  { id: 1, name: 'Кишинёв' },
  { id: 2, name: 'Бухарест' },
  { id: 3, name: 'Одесса' }
])

const countries = ref([
  { id: 1, name: 'Турция' },
  { id: 2, name: 'Египет' },
  { id: 3, name: 'Греция' },
  { id: 4, name: 'Болгария' },
  { id: 5, name: 'Испания' }
])

const availableNights = ref([3, 7, 10, 14, 21])
const isLoading = ref(false)
const showGuestsDropdown = ref(false)

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
  
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
    emit('search', searchForm.value)
  }, 1000)
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

const toggleGuestsDropdown = () => {
  showGuestsDropdown.value = !showGuestsDropdown.value
}

const formatGuests = () => {
  const total = searchForm.value.adults + searchForm.value.children
  if (total === 1) return '1 гость'
  if (total >= 2 && total <= 4) return `${total} гостя`
  return `${total} гостей`
}

const getNightWord = (nights: number) => {
  if (nights === 1) return 'ночь'
  if (nights >= 2 && nights <= 4) return 'ночи'
  return 'ночей'
}

// Close guests dropdown when clicking outside
watch(showGuestsDropdown, (isOpen) => {
  if (isOpen) {
    const closeDropdown = (e: Event) => {
      if (!(e.target as Element)?.closest('.guests-section')) {
        showGuestsDropdown.value = false
        document.removeEventListener('click', closeDropdown)
      }
    }
    setTimeout(() => document.addEventListener('click', closeDropdown), 0)
  }
})
</script>

<style scoped>
/* Airbnb Style Search Form */
.search-container {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.search-bar {
  display: flex;
  align-items: stretch;
  background: #FFFFFF;
  border: 1px solid #DDDDDD;
  border-radius: 16px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  min-height: 60px;
}

.search-bar:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.search-section {
  flex: 1;
  padding: 12px 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.search-section:hover {
  background-color: #F7F7F7;
}

.section-label {
  font-size: 12px;
  font-weight: 600;
  color: #222222;
  margin-bottom: 2px;
  line-height: 1;
}

.section-input {
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 400;
  color: #717171;
  outline: none;
  font-family: var(--font-family);
  width: 100%;
}

.section-input::placeholder {
  color: #B0B0B0;
}

.divider {
  width: 1px;
  background-color: #DDDDDD;
  margin: 12px 0;
}

.search-button {
  background: #FF385C;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 16px;
  margin: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-family);
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.search-button:hover {
  background: #E31C3D;
  transform: scale(1.02);
}

/* Guests Dropdown */
.guests-section {
  position: relative;
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
  background: #FFFFFF;
  border: 1px solid #DDDDDD;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  margin-top: 8px;
  padding: 16px;
}

.guest-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.guest-row:not(:last-child) {
  border-bottom: 1px solid #EBEBEB;
}

.counter {
  display: flex;
  align-items: center;
  gap: 12px;
}

.counter button {
  width: 32px;
  height: 32px;
  border: 1px solid #DDDDDD;
  background: #FFFFFF;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #717171;
  transition: all 0.2s ease;
}

.counter button:hover:not(:disabled) {
  border-color: #FF385C;
  color: #FF385C;
}

.counter button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
    border-radius: 12px;
  }
  
  .search-section {
    padding: 16px 20px;
    border-right: none;
    border-bottom: 1px solid #DDDDDD;
  }
  
  .search-section:last-of-type {
    border-bottom: none;
  }
  
  .divider {
    display: none;
  }
  
  .search-button {
    margin: 16px;
    border-radius: 8px;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .search-container {
    margin: 0 16px;
  }
  
  .search-section {
    padding: 12px 16px;
  }
  
  .section-input {
    font-size: 16px; /* Prevents zoom on iOS */
  }
}

/* Multiselect overrides */
:deep(.multiselect) {
  border: none !important;
  background: transparent !important;
  font-size: 14px !important;
  color: #717171 !important;
  min-height: auto !important;
}

:deep(.multiselect-wrapper) {
  position: relative;
}

:deep(.multiselect-single-label) {
  color: #717171 !important;
  font-size: 14px !important;
  font-weight: 400 !important;
  padding: 0 !important;
  margin: 0 !important;
}

:deep(.multiselect-placeholder) {
  color: #B0B0B0 !important;
  font-size: 14px !important;
  padding: 0 !important;
  margin: 0 !important;
}

:deep(.multiselect-dropdown) {
  border: 1px solid #DDDDDD !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
  margin-top: 8px !important;
}

:deep(.multiselect-option) {
  padding: 12px 16px !important;
  color: #222222 !important;
  font-size: 14px !important;
}

:deep(.multiselect-option.is-pointed) {
  background: #F7F7F7 !important;
  color: #222222 !important;
}

:deep(.multiselect-option.is-selected) {
  background: #FF385C !important;
  color: white !important;
}

/* DatePicker overrides */
:deep(.dp__main) {
  width: 100% !important;
  font-family: var(--font-family) !important;
}

:deep(.dp__input) {
  border: none !important;
  padding: 0 !important;
  font-size: 14px !important;
  font-weight: 400 !important;
  background: transparent !important;
  color: #717171 !important;
  font-family: var(--font-family) !important;
}

:deep(.dp__input::placeholder) {
  color: #B0B0B0 !important;
}

:deep(.dp__menu) {
  border: 1px solid #DDDDDD !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
  margin-top: 8px !important;
}

:deep(.dp__overlay_container) {
  z-index: 9999 !important;
}
</style>