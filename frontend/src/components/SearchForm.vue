<template>
  <div class="search-container">
    <!-- Airbnb Style Search Bar -->
    <div class="search-bar">
      <!-- Откуда -->
      <div class="search-section">
        <label class="section-label">Город отправления</label>
        <input 
          type="text" 
          v-model="searchForm.departureCity" 
          placeholder="Кишинёв"
          class="section-input"
        />
      </div>

      <div class="divider"></div>

      <!-- Куда -->
      <div class="search-section">
        <label class="section-label">Куда</label>
        <input 
          type="text" 
          v-model="searchForm.destination" 
          placeholder="Введите страну курорт или отель"
          class="section-input"
        />
      </div>

      <div class="divider"></div>

      <!-- Планет/Месность -->
      <div class="search-section">
        <label class="section-label">Планет</label>
        <select v-model="searchForm.package" class="section-input">
          <option value="">Выберите местность</option>
          <option value="beach">Пляжный отдых</option>
          <option value="city">Городской туризм</option>
          <option value="mountain">Горы</option>
        </select>
      </div>

      <div class="divider"></div>

      <!-- Дата -->
      <div class="search-section">
        <label class="section-label">Дата</label>
        <input 
          type="text" 
          v-model="searchForm.dateDisplay" 
          placeholder="01.09.2025"
          class="section-input"
        />
      </div>

      <div class="divider"></div>

      <!-- Ночи -->
      <div class="search-section">
        <label class="section-label">Ночи</label>
        <select v-model="searchForm.nights" class="section-input">
          <option value="">3</option>
          <option v-for="night in availableNights" :key="night" :value="night">
            {{ night }}
          </option>
        </select>
      </div>

      <div class="divider"></div>

      <!-- Взрослые -->
      <div class="search-section">
        <label class="section-label">Взрослые</label>
        <select v-model="searchForm.adults" class="section-input">
          <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
        </select>
      </div>

      <div class="divider"></div>

      <!-- Дети -->
      <div class="search-section">
        <label class="section-label">Дети</label>
        <select v-model="searchForm.children" class="section-input">
          <option v-for="n in 11" :key="n-1" :value="n-1">{{ n-1 }}</option>
        </select>
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
        <span>Поиск тура</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Reactive data
const searchForm = ref({
  departureCity: 'Кишинёв',
  destination: '',
  package: '',
  dateDisplay: '01.09.2025',
  nights: '3',
  adults: 2,
  children: 0
})

const availableNights = ref([3, 7, 10, 14, 21])
const isLoading = ref(false)

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
</script>

<style scoped>
/* Airbnb Style Search Form */
.search-container {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  /* Временная отладочная рамка */
  border: 2px solid red;
  background: yellow;
}

.search-bar {
  display: flex;
  align-items: stretch;
  background: #FFFFFF;
  border: 1px solid #DDDDDD;
  border-radius: 32px;
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
  border-radius: 24px;
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

/* Mobile Responsive */
@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
    border-radius: 16px;
  }
  
  .search-section {
    padding: 16px 20px;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
  }
  
  .search-section:last-of-type {
    border-bottom: none;
  }
  
  .divider {
    display: none;
  }
  
  .search-button {
    margin: 16px;
    border-radius: 12px;
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
</style>