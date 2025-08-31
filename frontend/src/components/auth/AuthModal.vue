<template>
  <div v-if="isOpen" class="auth-modal" @click="handleBackdropClick">
    <div class="auth-modal__content" @click.stop>
      <button @click="close" class="auth-modal__close">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <LoginForm
        v-if="mode === 'login'"
        @switch-mode="switchMode"
        @login-success="handleLoginSuccess"
      />
      <RegisterForm
        v-else
        @switch-mode="switchMode"
        @register-success="handleRegisterSuccess"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { useAuthStore } from '@/stores/auth'
  import LoginForm from './LoginForm.vue'
  import RegisterForm from './RegisterForm.vue'

  interface Props {
    isOpen: boolean
  }

  interface Emits {
    (e: 'close'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const authStore = useAuthStore()
  const mode = ref<'login' | 'register'>('login')

  const close = () => {
    emit('close')
  }

  const handleBackdropClick = (event: Event) => {
    if (event.target === event.currentTarget) {
      close()
    }
  }

  const switchMode = (newMode: 'login' | 'register') => {
    mode.value = newMode
  }

  const handleLoginSuccess = () => {
    close()
  }

  const handleRegisterSuccess = () => {
    close()
  }

  // Автоматически закрываем модальное окно при успешной авторизации
  watch(
    () => authStore.isAuthenticated,
    isAuthenticated => {
      if (isAuthenticated && props.isOpen) {
        close()
      }
    }
  )
</script>

<style scoped>
  .auth-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 99999999;
    padding: 2rem;
    backdrop-filter: blur(4px);
    width: 100vw;
    height: 100vh;
  }

  .auth-modal__content {
    position: relative;
    background: white;
    border-radius: 8px;
    max-width: 480px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .auth-modal__close {
    position: absolute;
    top: 1.25rem;
    right: 1.25rem;
    background: rgba(0, 0, 0, 0.05);
    border: none;
    color: var(--color-text-muted);
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 4px;
    transition: all 0.2s ease;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .auth-modal__close:hover {
    background: rgba(0, 0, 0, 0.1);
    color: var(--color-text);
    transform: scale(1.05);
  }

  @media (max-width: 640px) {
    .auth-modal {
      padding: 1rem;
    }

    .auth-modal__content {
      border-radius: 6px;
      max-height: 95vh;
    }
  }
</style>
