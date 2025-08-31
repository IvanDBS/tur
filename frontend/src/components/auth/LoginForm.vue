<template>
  <div class="auth-form">
    <div class="auth-form__header">
      <h2 class="auth-form__title">Вход в систему</h2>
      <p class="auth-form__subtitle">Введите ваши данные для входа</p>
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

      <div class="form-group">
        <label for="password" class="form-label">Пароль</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          class="form-input"
          :class="{ 'form-input--error': errors.password }"
          placeholder="Введите ваш пароль"
          required
        />
        <span v-if="errors.password" class="form-error">{{ errors.password }}</span>
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
        <span v-else>Войти</span>
      </button>
    </form>

    <div class="auth-form__footer">
      <p class="auth-form__text">
        Нет аккаунта?
        <button @click="$emit('switch-mode', 'register')" class="auth-form__link">
          Зарегистрироваться
        </button>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { LoginCredentials } from '@/types/auth'

const emit = defineEmits<{
  'switch-mode': [mode: 'register']
  'login-success': []
}>()

const authStore = useAuthStore()

const form = reactive<LoginCredentials>({
  email: '',
  password: ''
})

const errors = reactive({
  email: '',
  password: ''
})

const validateForm = (): boolean => {
  let isValid = true
  
  // Reset errors
  errors.email = ''
  errors.password = ''
  
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
  
  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  try {
    await authStore.login(form)
    // Успешный вход - эмитим событие
    emit('login-success')
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


</style>
