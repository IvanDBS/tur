<template>
  <div class="search-compact">
    <!-- Loading Indicator -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Загружаем данные...</p>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="false" class="error-message">
      <!-- Ошибки отображаются в родительском компоненте -->
    </div>

    <!-- Тестовая кнопка -->
    <div style="margin-bottom: 20px; text-align: center;">
      <button 
        @click="testLoadPackages" 
        type="button"
        style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;"
      >
        🧪 Тест: Загрузить пакеты
      </button>
    </div>

    <div class="search-row">
      <!-- Откуда -->
      <div class="field-group">
        <label>Откуда:</label>
        <Multiselect
          v-model="form.departureCity"
          :options="searchData.departureCitiesOptions.value"
          :searchable="true"
          :canClear="false"
          :canDeselect="false"
          placeholder="Выберите город"
          label="label"
          valueProp="value"
          :disabled="loading"
        />
      </div>

      <!-- Куда -->
      <div class="field-group">
        <label>Куда:</label>
        <Multiselect
          v-model="form.destination"
          :options="searchData.countriesOptions.value"
          :searchable="true"
          :canClear="false"
          :canDeselect="false"
          placeholder="Выберите страну"
          label="label"
          valueProp="value"
          :disabled="loading || !form.departureCity"
        />
      </div>

      <!-- Пакет -->
      <div class="field-group">
        <label>Пакет:</label>
        <Multiselect
          v-model="form.package"
          :options="searchData.packagesOptions.value"
          :searchable="true"
          :canClear="false"
          :canDeselect="false"
          placeholder="Выберите пакет"
          label="label"
          valueProp="value"
          :disabled="loading || !form.destination"
        />
      </div>

      <!-- Дата -->
      <div class="field-group">
        <label>Дата:</label>
        <VueDatePicker
          v-model="form.date"
          :disabled="loading || !form.package"
          placeholder="Выберите дату"
          :min-date="new Date()"
          :format="formatDate"
          :text-input="true"
          :auto-apply="true"
        />
      </div>

      <!-- Ночи -->
      <div class="field-group">
        <label>Ночи:</label>
        <Multiselect
          v-model="form.nights"
          :options="searchData.nightsOptions"
          :searchable="false"
          :canClear="false"
          :canDeselect="false"
          placeholder="Выберите ночи"
          label="label"
          valueProp="value"
          :disabled="loading || !form.date"
        />
      </div>

      <!-- Взрослые -->
      <div class="field-group">
        <label>Взрослые:</label>
        <Multiselect
          v-model="form.adults"
          :options="searchData.adultsOptions"
          :searchable="false"
          :canClear="false"
          :canDeselect="false"
          placeholder="Выберите количество"
          label="label"
          valueProp="value"
          :disabled="loading"
        />
      </div>

      <!-- Дети -->
      <div class="field-group">
        <label>Дети:</label>
        <Multiselect
          v-model="form.children"
          :options="searchData.childrenOptions"
          :searchable="false"
          :canClear="false"
          :canDeselect="false"
          placeholder="Выберите количество"
          label="label"
          valueProp="value"
          :disabled="loading || !form.adults"
        />
      </div>

      <!-- Возраст детей -->
      <div v-if="form.children > 0" class="field-group">
        <label>Возраст детей:</label>
        <div class="children-ages">
          <Multiselect
            v-for="(age, index) in form.childrenAges"
            :key="index"
            v-model="form.childrenAges[index]"
            :options="[
              { label: '0-2 года', value: 0 },
              { label: '3-12 лет', value: 3 },
              { label: '13-17 лет', value: 13 }
            ]"
            :searchable="false"
            :canClear="false"
            :canDeselect="false"
            placeholder="Возраст"
            label="label"
            valueProp="value"
            :disabled="loading"
          />
        </div>
      </div>

      <!-- Search Button -->
      <button 
        type="button" 
        @click="handleSearch" 
        class="search-btn"
        :disabled="loading || !form.departureCity || !form.destination"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        Поиск тура
      </button>
    </div>

    <!-- Expand Button -->
    <div class="expand-section">
      <button type="button" @click="handleExpand" class="expand-btn">
        Расширенный поиск
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="6,9 12,15 18,9" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted } from 'vue'
  import VueDatePicker from '@vuepic/vue-datepicker'
  import '@vuepic/vue-datepicker/dist/main.css'
  import Multiselect from '@vueform/multiselect'
  import '@vueform/multiselect/themes/default.css'
  import { useSearchData } from '../../composables/useSearchData'
  import type {
    CompactSearchForm,
    DepartureCity,
    Country,
    SearchOption,
    Package,
  } from '../../types/search'

  // Props
  interface Props {
    modelValue: CompactSearchForm
    loading?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    loading: false
  })

  // Emits
  const emit = defineEmits<{
    'update:modelValue': [value: CompactSearchForm]
    search: [form: CompactSearchForm]
    expand: []
  }>()

  // Use search data composable
  const searchData = useSearchData()

  // Form data
  const form = ref<CompactSearchForm>({
    departureCity: null,
    destination: null,
    package: null,
    date: null,
    nights: 6,
    adults: 2,
    children: 0,
    childrenAges: []
  })

  // Format date function
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Watch for form changes and emit updates
  watch(form, (newForm) => {
    emit('update:modelValue', { ...newForm })
  }, { deep: true })

  // Watch for prop changes and update form
  watch(() => props.modelValue, (newValue) => {
    if (newValue) {
      form.value = { ...newValue }
    }
  }, { deep: true })

  // Watch for departure city changes and load countries
  watch(() => form.value.departureCity, async (newCity) => {
    console.log('Departure city watch triggered:', newCity)
    try {
      if (newCity && newCity.id) {
        console.log(`Loading countries for city ${newCity.id}`)
        form.value.destination = null
        form.value.package = null
        form.value.date = null
        // Загружаем страны для выбранного города через useSearchData
        await searchData.loadCountries(newCity.id)
        console.log(`Loaded countries for departure city: ${newCity.name}`)
      } else {
        console.log('Departure city watch: missing city data', newCity)
      }
    } catch (err) {
      console.error('Departure city watch error:', err)
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        city: newCity
      })
    }
  })

  // Watch for destination changes and load packages
  watch(() => form.value.destination, async (newCountry) => {
    console.log('Destination watch triggered:', newCountry)
    try {
      if (newCountry && newCountry.id && form.value.departureCity?.id) {
        console.log(`Loading packages for country ${newCountry.id} and city ${form.value.departureCity.id}`)
        // Очищаем предыдущий выбор
        form.value.package = null
        form.value.date = null
        
        // Загружаем пакеты для выбранной страны через useSearchData
        await searchData.loadPackageTemplates(newCountry.id, form.value.departureCity.id)
        
        console.log(`Loaded packages for country: ${newCountry.name}`)
      } else {
        console.log('Destination watch: missing required data', {
          newCountry,
          departureCity: form.value.departureCity
        })
      }
    } catch (err) {
      console.error('Destination watch error:', err)
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        country: newCountry,
        departureCity: form.value.departureCity
      })
    }
  })

  // Handle search
  const handleSearch = () => {
    emit('search', form.value)
  }

  // Handle expand
  const handleExpand = () => {
    emit('expand')
  }

  // Тестовая функция для загрузки пакетов
  const testLoadPackages = async () => {
    console.log('Тест: Загружаем пакеты для TÜRKIYE (ID: 223) и CHISINAU (ID: 48478)')
    try {
      await searchData.fetchPackageTemplates(223, 48478)
      console.log('Тест: Пакеты загружены')
    } catch (err) {
      console.error('Тест: Ошибка загрузки пакетов:', err)
    }
  }

  // Load departure cities on mount
  onMounted(async () => {
    try {
      console.log('Component mounted, loading departure cities...')
      // Загружаем города отправления при монтировании
      await searchData.loadDepartureCities()
      console.log('Departure cities loaded on mount')
    } catch (err) {
      console.error('Failed to load departure cities on mount:', err)
    }
  })

  // Явный экспорт для TypeScript
  defineExpose({})
</script>

<style scoped>
  /* Loading Overlay */
  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    border-radius: 8px;
  }

  .loading-spinner {
    text-align: center;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Error Banner */
  .error-banner {
    background: #ffebee;
    color: #c62828;
    padding: 1rem;
    border-radius: 6px;
    margin-bottom: 1rem;
    border-left: 4px solid #f44336;
    font-size: 0.9rem;
  }

  /* Стили для календаря - коралловая рамка */
  :deep(.dp__active_date) {
    background: transparent !important;
    border: 2px solid var(--color-primary) !important;
    color: var(--color-primary) !important;
  }

  :deep(.dp__active_date:hover) {
    background: transparent !important;
    border: 2px solid var(--color-primary) !important;
    color: var(--color-primary) !important;
  }

  /* Стили для самого input поля календаря */
  :deep(.dp__input:hover) {
    border-color: #1d3557 !important;
    box-shadow: 0 0 0 2px rgba(29, 53, 87, 0.2) !important;
    border-radius: 4px !important;
    outline: none !important;
  }

  :deep(.dp__input:focus) {
    border-color: #1d3557 !important;
    box-shadow: 0 0 0 2px rgba(29, 53, 87, 0.2) !important;
    border-radius: 4px !important;
    outline: none !important;
  }

  :deep(.dp__input:hover:not(.dp__input_focus)) {
    border-color: #1d3557 !important;
    box-shadow: 0 0 0 2px rgba(29, 53, 87, 0.2) !important;
    border-radius: 4px !important;
    outline: none !important;
  }

  :deep(.dp__input_focus) {
    border-color: #1d3557 !important;
    box-shadow: 0 0 0 2px rgba(29, 53, 87, 0.2) !important;
    border-radius: 4px !important;
    outline: none !important;
  }

  /* Выравнивание высоты полей дат с другими селекторами */
  :deep(.dp__input) {
    min-height: 38px !important;
    height: 38px !important;
    box-sizing: border-box !important;
  }

  /* Compact Form */
  .search-compact {
    background: #ffffff;
    border: 1px solid #dddddd;
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

  /* Дополнительное выравнивание для полей дат */
  .field-group:has(.dp__input) {
    display: flex;
    flex-direction: column;
    gap: 2px;
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

  .search-btn {
    background: white;
    border: 1px solid var(--color-primary);
    color: var(--color-primary);
    border-radius: 6px;
    padding: 8px 20px;
    cursor: pointer;
    font-family: var(--font-family);
    font-weight: 600;
    transition: all 0.2s ease;
    min-width: 140px;
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: center;
    align-self: flex-end;
    height: 38px;
    box-sizing: border-box;
  }

  .search-btn:hover:not(:disabled) {
    background: var(--color-primary);
    color: white;
  }

  .search-btn:disabled {
    background: #f5f5f5;
    border-color: #ddd;
    color: #999;
    cursor: not-allowed;
  }

  .search-btn svg {
    transition: transform 0.2s;
  }

  .search-btn:hover:not(:disabled) svg {
    transform: scale(1.1);
  }

  .expand-section {
    text-align: center;
    margin-top: 12px;
  }

  .expand-btn {
    background: none;
    border: none;
    color: var(--color-secondary);
    cursor: pointer;
    font-size: 14px;
    padding: 8px 16px;
    border-radius: 4px;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .expand-btn:hover {
    color: var(--color-secondary-hover);
    background: rgba(0, 0, 0, 0.05);
  }

  .expand-btn svg {
    transition: transform 0.2s;
  }

  .expand-btn:hover svg {
    transform: translateY(1px);
  }

  /* Адаптивность */
  @media (max-width: 768px) {
    .search-compact {
      padding: 16px;
    }

    .search-row {
      gap: 8px;
    }

    .field-group {
      min-width: 80px;
    }

    .search-btn {
      min-width: 120px;
      padding: 8px 16px;
      font-size: 13px;
      height: 38px;
    }

    .expand-section {
      margin-top: 8px;
    }
  }

  @media (max-width: 480px) {
    .search-compact {
      padding: 12px;
    }

    .search-row {
      flex-direction: column;
      align-items: stretch;
    }

    .field-group {
      min-width: auto;
    }

    .search-btn {
      min-width: auto;
      width: 100%;
    }
  }
</style>
