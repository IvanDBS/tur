<template>
  <div class="auth-form">
    <div class="auth-form__header">
      <h2 class="auth-form__title">Регистрация</h2>
      <p class="auth-form__subtitle">Создайте новый аккаунт</p>
    </div>

    <form @submit.prevent="handleSubmit" class="auth-form__content">
      <FormField
        v-model="form.email"
        type="email"
        label="Email"
        placeholder="Введите ваш email"
        :error="errors.email"
        required
      />

      <div class="form-row">
        <FormField
          v-model="form.firstName"
          type="text"
          label="Имя"
          placeholder="Имя"
          :error="errors.firstName"
          class="form-group--half"
        />

        <FormField
          v-model="form.lastName"
          type="text"
          label="Фамилия"
          placeholder="Фамилия"
          :error="errors.lastName"
          class="form-group--half"
        />
      </div>

      <FormField
        v-model="form.phone"
        type="tel"
        label="Телефон (необязательно)"
        placeholder="+7 (999) 123-45-67"
        :error="errors.phone"
        hint="Необязательное поле"
      />

      <FormField
        v-model="form.password"
        type="password"
        label="Пароль"
        placeholder="Введите пароль"
        :error="errors.password"
        required
      />

      <FormField
        v-model="form.passwordConfirmation"
        type="password"
        label="Подтверждение пароля"
        placeholder="Повторите пароль"
        :error="errors.passwordConfirmation"
        required
      />

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
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
              fill="none"
              stroke-dasharray="31.416"
              stroke-dashoffset="31.416"
            >
              <animate
                attributeName="stroke-dasharray"
                dur="2s"
                values="0 31.416;15.708 15.708;0 31.416"
                repeatCount="indefinite"
              />
              <animate
                attributeName="stroke-dashoffset"
                dur="2s"
                values="0;-15.708;-31.416"
                repeatCount="indefinite"
              />
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
  import { useFormValidation, validationRules } from '@/composables/useFormValidation'
  import FormField from '@/components/ui/FormField.vue'
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
    phone: '',
  })

  // Validation schema
  const validationSchema = {
    email: validationRules.email,
    password: validationRules.password,
    passwordConfirmation: {
      required: true,
      custom: (value: string) => {
        if (value !== form.password) {
          return 'Пароли не совпадают'
        }
        return null
      }
    },
    firstName: validationRules.required,
    lastName: validationRules.required,
    phone: validationRules.phone
  }

  // Use validation composable
  const { errors, validateForm } = useFormValidation(form, validationSchema)

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      await authStore.register(form)
      // Успешная регистрация - эмитим событие
      emit('register-success')
    } catch {
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
