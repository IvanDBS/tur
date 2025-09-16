<template>
  <div class="form-field-test">
    <div class="test-container">
      <h1>FormField Component Test</h1>
      <p>Тестирование нового FormField компонента</p>
      
      <div class="test-section">
        <h2>Базовые поля</h2>
        
        <FormField
          v-model="testForm.email"
          type="email"
          label="Email"
          placeholder="Введите email"
          :error="errors.email"
          required
        />
        
        <FormField
          v-model="testForm.password"
          type="password"
          label="Пароль"
          placeholder="Введите пароль"
          :error="errors.password"
          required
        />
        
        <FormField
          v-model="testForm.phone"
          type="tel"
          label="Телефон"
          placeholder="+7 (999) 123-45-67"
          :error="errors.phone"
          hint="Необязательное поле"
        />
      </div>
      
      <div class="test-section">
        <h2>Select поля</h2>
        
        <FormField
          v-model="testForm.country"
          type="select"
          label="Страна"
          placeholder="Выберите страну"
          :options="countryOptions"
          :error="errors.country"
          required
        />
      </div>
      
      <div class="test-section">
        <h2>Размеры</h2>
        
        <FormField
          v-model="testForm.small"
          type="text"
          label="Маленькое поле"
          placeholder="Small size"
          size="sm"
        />
        
        <FormField
          v-model="testForm.medium"
          type="text"
          label="Среднее поле"
          placeholder="Medium size"
          size="md"
        />
        
        <FormField
          v-model="testForm.large"
          type="text"
          label="Большое поле"
          placeholder="Large size"
          size="lg"
        />
      </div>
      
      <div class="test-section">
        <h2>Состояния</h2>
        
        <FormField
          v-model="testForm.disabled"
          type="text"
          label="Отключенное поле"
          placeholder="Disabled field"
          disabled
        />
        
        <FormField
          v-model="testForm.error"
          type="text"
          label="Поле с ошибкой"
          placeholder="Field with error"
          error="Это поле содержит ошибку"
        />
      </div>
      
      <div class="test-actions">
        <button @click="handleValidateForm" class="btn btn--primary">
          Проверить валидацию
        </button>
        <button @click="clearForm" class="btn btn--secondary">
          Очистить форму
        </button>
      </div>
      
      <div class="test-results">
        <h3>Результаты тестирования:</h3>
        <pre>{{ JSON.stringify(testForm, null, 2) }}</pre>
        <pre v-if="hasErrors">Ошибки: {{ JSON.stringify(errors, null, 2) }}</pre>
        <div v-if="isValid" class="success-message">
          ✅ Форма валидна!
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { logger } from '@/utils/logger'
import FormField from '@/components/ui/FormField.vue'
import { useFormValidation, validationRules } from '@/composables/useFormValidation'

// Test data
const testForm = reactive({
  email: '',
  password: '',
  phone: '',
  country: null,
  small: '',
  medium: '',
  large: '',
  disabled: 'Disabled value',
  error: 'Error value'
})

// Validation schema
const validationSchema = {
  email: validationRules.email,
  password: validationRules.password,
  phone: validationRules.phone,
  country: validationRules.required
}

// Use validation composable
const { errors, hasErrors, isValid, validateForm, clearErrors } = useFormValidation(
  testForm,
  validationSchema
)

const countryOptions = [
  { value: 'MD', label: 'Moldova' },
  { value: 'RO', label: 'Romania' },
  { value: 'UA', label: 'Ukraine' },
  { value: 'RU', label: 'Russia' }
]

// Test validation
const handleValidateForm = () => {
  const isFormValid = validateForm()
  
  if (isFormValid) {
    logger.debug('Form is valid!', testForm)
  } else {
    logger.debug('Form has validation errors', errors.value)
  }
}

const clearForm = () => {
  Object.keys(testForm).forEach(key => {
    if (key !== 'disabled' && key !== 'error') {
      testForm[key as keyof typeof testForm] = ''
    }
  })
  clearErrors()
}
</script>

<style scoped>
.form-field-test {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.test-container {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
}

.test-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border-soft);
}

.test-section:last-of-type {
  border-bottom: none;
}

.test-actions {
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
}

.test-results {
  background: var(--color-background-soft);
  padding: 1rem;
  border-radius: 8px;
  margin-top: 2rem;
}

.test-results pre {
  background: white;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid var(--color-border);
  font-size: 0.875rem;
  overflow-x: auto;
}

h1 {
  color: var(--color-secondary);
  margin-bottom: 0.5rem;
}

h2 {
  color: var(--color-text);
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

h3 {
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.success-message {
  background: #d1fae5;
  color: #065f46;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #a7f3d0;
  margin-top: 1rem;
  font-weight: 500;
}
</style>
