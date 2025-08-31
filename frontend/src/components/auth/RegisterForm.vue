<template>
  <div class="auth-form">
    <div class="auth-form__header">
      <h2 class="auth-form__title">Регистрация</h2>
      <p class="auth-form__subtitle">Создайте новый аккаунт</p>
    </div>

    <form @submit.prevent="handleSubmit" class="auth-form__content">
      <div class="form-group">
        <label for="email" class="form-label">Email</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          class="form-input"
          :class="{ 'form-input--error': errors.email }"
          placeholder="Введите ваш email"
          required
        />
        <span v-if="errors.email" class="form-error">{{ errors.email }}</span>
      </div>

      <div class="form-row">
        <div class="form-group form-group--half">
          <label for="firstName" class="form-label">Имя</label>
          <input
            id="firstName"
            v-model="form.firstName"
            type="text"
            class="form-input"
            :class="{ 'form-input--error': errors.firstName }"
            placeholder="Имя"
          />
          <span v-if="errors.firstName" class="form-error">{{ errors.firstName }}</span>
        </div>

        <div class="form-group form-group--half">
          <label for="lastName" class="form-label">Фамилия</label>
          <input
            id="lastName"
            v-model="form.lastName"
            type="text"
            class="form-input"
            :class="{ 'form-input--error': errors.lastName }"
            placeholder="Фамилия"
          />
          <span v-if="errors.lastName" class="form-error">{{ errors.lastName }}</span>
        </div>
      </div>

      <div class="form-group">
        <label for="phone" class="form-label">Телефон (необязательно)</label>
        <input
          id="phone"
          v-model="form.phone"
          type="tel"
          class="form-input"
          :class="{ 'form-input--error': errors.phone }"
          placeholder="+7 (999) 123-45-67"
        />
        <span v-if="errors.phone" class="form-error">{{ errors.phone }}</span>
      </div>

      <div class="form-group">
        <label for="password" class="form-label">Пароль</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          class="form-input"
          :class="{ 'form-input--error': errors.password }"
          placeholder="Введите пароль"
          required
        />
        <span v-if="errors.password" class="form-error">{{ errors.password }}</span>
      </div>

      <div class="form-group">
        <label for="passwordConfirmation" class="form-label">Подтверждение пароля</label>
        <input
          id="passwordConfirmation"
          v-model="form.passwordConfirmation"
          type="password"
          class="form-input"
          :class="{ 'form-input--error': errors.passwordConfirmation }"
          placeholder="Повторите пароль"
          required
        />
        <span v-if="errors.passwordConfirmation" class="form-error">{{ errors.passwordConfirmation }}</span>
      </div>

      <div v-if="authStore.error" class="form-error-message">
        {{ authStore.error }}
      </div>

      <button
        type="submit"
        class="btn btn--primary btn--full"
        :disabled="authStore.isLoading"
      >
        <span v-if="authStore.isLoading" class="btn__loading">
          <svg class="btn__spinner" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" stroke-dasharray="31.416" stroke-dashoffset="31.416">
              <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
              <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
            </circle>
          </svg>
        </span>
        <span v-else>Зарегистрироваться</span>
      </button>
    </form>

    <div class="auth-form__footer">
      <p class="auth-form__text">
        Уже есть аккаунт?
        <button @click="$emit('switch-mode', 'login')" class="auth-form__link">
          Войти
        </button>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { RegisterCredentials } from '@/types/auth'

const emit = defineEmits<{
  'switch-mode': [mode: 'login']
  'register-success': []
}>()

const authStore = useAuthStore()

const form = reactive<RegisterCredentials>({
  email: '',
  password: '',
  passwordConfirmation: '',
  firstName: '',
  lastName: '',
  phone: ''
})

const errors = reactive({
  email: '',
  password: '',
  passwordConfirmation: '',
  firstName: '',
  lastName: '',
  phone: ''
})

const validateForm = (): boolean => {
  let isValid = true
  
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })
  
  // Email validation
  if (!form.email) {
    errors.email = 'Email обязателен'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Введите корректный email'
    isValid = false
  }
  
  // Password validation
  if (!form.password) {
    errors.password = 'Пароль обязателен'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = 'Пароль должен содержать минимум 6 символов'
    isValid = false
  }
  
  // Password confirmation validation
  if (!form.passwordConfirmation) {
    errors.passwordConfirmation = 'Подтверждение пароля обязательно'
    isValid = false
  } else if (form.password !== form.passwordConfirmation) {
    errors.passwordConfirmation = 'Пароли не совпадают'
    isValid = false
  }
  
  // Phone validation (optional)
  if (form.phone && !/^\+?[\d\s\-\(\)]+$/.test(form.phone)) {
    errors.phone = 'Введите корректный номер телефона'
    isValid = false
  }
  
  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  try {
    await authStore.register(form)
    // Успешная регистрация - эмитим событие
    emit('register-success')
  } catch (error) {
    // Ошибка уже обрабатывается в store
  }
}
</script>

<style scoped>
.auth-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 2.5rem;
  background: white;
  border-radius: 8px;
}

.auth-form__header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-form__title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 0.75rem 0;
  letter-spacing: -0.02em;
}

.auth-form__subtitle {
  color: var(--color-text-muted);
  margin: 0;
  font-size: 0.95rem;
}

.auth-form__content {
  margin-bottom: 2rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group--half {
  flex: 1;
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 1rem;
  transition: all 0.2s ease;
  box-sizing: border-box;
  background: var(--color-background);
  color: var(--color-text);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-secondary);
  box-shadow: 0 0 0 2px var(--color-secondary-muted);
}

.form-input--error {
  border-color: var(--color-danger);
}

.form-input--error:focus {
  border-color: var(--color-danger);
  box-shadow: 0 0 0 2px rgba(255, 90, 95, 0.1);
}

.form-error {
  display: block;
  font-size: 0.875rem;
  color: var(--color-danger);
  margin-top: 0.5rem;
  font-weight: 500;
}

.form-error-message {
  background: rgba(255, 90, 95, 0.1);
  border: 1px solid rgba(255, 90, 95, 0.2);
  color: var(--color-danger);
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  font-family: var(--font-family);
}

.btn--primary {
  background: var(--color-secondary);
  color: white;
  box-shadow: 0 4px 12px var(--color-secondary-muted);
}

.btn--primary:hover:not(:disabled) {
  background: var(--color-secondary-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px var(--color-secondary-muted);
}

.btn--primary:disabled {
  background: var(--color-text-muted);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn--full {
  width: 100%;
}

.btn__loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn__spinner {
  width: 1.25rem;
  height: 1.25rem;
  color: currentColor;
}

.auth-form__footer {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border-soft);
}

.auth-form__text {
  color: var(--color-text-muted);
  margin: 0;
  font-size: 0.95rem;
}

.auth-form__link {
  background: none;
  border: none;
  color: var(--color-primary);
  text-decoration: none;
  cursor: pointer;
  font-size: inherit;
  font-weight: 600;
  padding: 0;
  margin: 0;
  transition: color 0.2s ease;
}

.auth-form__link:hover {
  color: var(--color-primary-hover);
  text-decoration: underline;
}

@media (max-width: 480px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .form-group--half {
    margin-bottom: 1.5rem;
  }
}
</style>
