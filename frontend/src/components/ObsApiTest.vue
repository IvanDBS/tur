<template>
  <div class="obs-api-test">
    <h2>OBS API Integration Test</h2>
    
    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading data from OBS API...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error">
      <p>❌ Error: {{ error }}</p>
      <button @click="retryLoad" class="retry-btn">Retry</button>
    </div>

    <!-- Data Display -->
    <div v-if="!loading && !error" class="data-display">
      <!-- Departure Cities -->
      <div class="data-section">
        <h3>Departure Cities ({{ departureCities.length }})</h3>
        <div class="data-list">
          <div v-for="city in departureCities" :key="city.id" class="data-item">
            <strong>{{ city.id }}</strong>: {{ city.name }}
          </div>
        </div>
      </div>

      <!-- Countries -->
      <div class="data-section">
        <h3>Countries ({{ countries.length }})</h3>
        <div class="data-list">
          <div v-for="country in countries" :key="country.id" class="data-item">
            <strong>{{ country.id }}</strong>: {{ country.name }}
          </div>
        </div>
      </div>

      <!-- Test Buttons -->
      <div class="test-buttons">
        <button @click="testFetchCountries" :disabled="!departureCities.length">
          Load Countries for CHISINAU
        </button>
        <button @click="clearData">Clear Data</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useObsApi } from '../composables/useObsApi'

const {
  loading,
  error,
  departureCities,
  countries,
  fetchDepartureCities,
  fetchCountries,
  clearData,
  clearError
} = useObsApi()

const retryLoad = async () => {
  clearError()
  await fetchDepartureCities()
}

const testFetchCountries = async () => {
  if (departureCities.value.length > 0) {
    const chisinauId = departureCities.value.find(city => city.name === 'CHISINAU')?.id
    if (chisinauId) {
      await fetchCountries(chisinauId)
    }
  }
}

onMounted(async () => {
  try {
    await fetchDepartureCities()
  } catch {
    // Failed to initialize OBS API test
  }
})
</script>

<style scoped>
.obs-api-test {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
}

.loading {
  text-align: center;
  padding: 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  background: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.retry-btn {
  background: #f44336;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 0.5rem;
}

.retry-btn:hover {
  background: #d32f2f;
}

.data-section {
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 4px;
}

.data-section h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

.data-list {
  display: grid;
  gap: 0.5rem;
}

.data-item {
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.test-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.test-buttons button {
  background: #2196f3;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.test-buttons button:hover:not(:disabled) {
  background: #1976d2;
}

.test-buttons button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
