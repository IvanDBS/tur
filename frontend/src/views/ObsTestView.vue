<template>
  <div class="obs-test-view">
    <div class="container">
      <h1>🧪 OBS API Integration Test</h1>
      
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
          <h3>🏙️ Departure Cities ({{ departureCities.length }})</h3>
          <div class="data-list">
            <div v-for="city in departureCities" :key="city.id" class="data-item">
              <strong>{{ city.id }}</strong>: {{ city.name }}
            </div>
          </div>
        </div>

        <!-- Countries -->
        <div class="data-section">
          <h3>🌍 Countries ({{ countries.length }})</h3>
          <div class="data-list">
            <div v-for="country in countries" :key="country.id" class="data-item">
              <strong>{{ country.id }}</strong>: {{ country.name }}
            </div>
          </div>
        </div>

        <!-- Test Buttons -->
        <div class="test-buttons">
          <button @click="testFetchCountries" :disabled="!departureCities.length" class="btn btn-primary">
            Load Countries for CHISINAU
          </button>
          <button @click="clearData" class="btn btn-secondary">Clear Data</button>
        </div>
      </div>

      <!-- API Status -->
      <div class="status-section">
        <h3>📊 API Status</h3>
        <div class="status-grid">
          <div class="status-item">
            <span class="status-label">Backend Status:</span>
            <span class="status-value" :class="{ 'success': backendStatus, 'error': !backendStatus }">
              {{ backendStatus ? '✅ Online' : '❌ Offline' }}
            </span>
          </div>
          <div class="status-item">
            <span class="status-label">OBS API Status:</span>
            <span class="status-value" :class="{ 'success': hasData, 'error': !hasData }">
              {{ hasData ? '✅ Connected' : '❌ Disconnected' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useObsApi } from '../composables/useObsApi'

const {
  loading,
  error,
  hasData,
  departureCities,
  countries,
  fetchDepartureCities,
  fetchCountries,
  clearData,
  clearError
} = useObsApi()

const backendStatus = ref(false)

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

const checkBackendStatus = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/v1/health')
    backendStatus.value = response.ok
  } catch (err) {
    backendStatus.value = false
  }
}

onMounted(async () => {
  try {
    await checkBackendStatus()
    await fetchDepartureCities()
  } catch (err) {
    // Failed to initialize OBS API test
  }
})
</script>

<style scoped>
.obs-test-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

h1 {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin: 0;
  padding: 2rem;
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
}

.loading {
  text-align: center;
  padding: 3rem;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 6px solid #f3f3f3;
  border-top: 6px solid #667eea;
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
  padding: 1.5rem;
  margin: 1rem;
  border-radius: 8px;
  border-left: 4px solid #f44336;
}

.retry-btn {
  background: #f44336;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 1rem;
  font-weight: 600;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #d32f2f;
}

.data-display {
  padding: 2rem;
}

.data-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.data-section h3 {
  margin: 0 0 1rem 0;
  color: #495057;
  font-size: 1.25rem;
}

.data-list {
  display: grid;
  gap: 0.75rem;
}

.data-item {
  padding: 0.75rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.data-item:hover {
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
}

.test-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.875rem 1.75rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s;
  min-width: 200px;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5a6fd8;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.status-section {
  background: #f8f9fa;
  padding: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.status-section h3 {
  margin: 0 0 1rem 0;
  color: #495057;
  font-size: 1.25rem;
}

.status-grid {
  display: grid;
  gap: 1rem;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

.status-label {
  font-weight: 600;
  color: #495057;
}

.status-value {
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.status-value.success {
  background: #d4edda;
  color: #155724;
}

.status-value.error {
  background: #f8d7da;
  color: #721c24;
}

@media (max-width: 768px) {
  h1 {
    font-size: 2rem;
    padding: 1.5rem;
  }
  
  .data-display {
    padding: 1rem;
  }
  
  .test-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    min-width: 250px;
  }
}
</style>
