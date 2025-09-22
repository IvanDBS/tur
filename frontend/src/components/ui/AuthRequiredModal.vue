<template>
  <div v-if="isOpen" class="auth-required-modal" @click="handleBackdropClick">
    <div class="auth-required-modal__content" @click.stop>
      <button @click="handleClose" class="auth-required-modal__close">
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

      <div class="auth-required-modal__header">
        <div class="auth-required-modal__icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 12l2 2 4-4"/>
            <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
            <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
            <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"/>
            <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3"/>
          </svg>
        </div>
        <h3 class="auth-required-modal__title">{{ title }}</h3>
      </div>
      
      <div class="auth-required-modal__body">
        <p class="auth-required-modal__message">{{ message }}</p>
        <div class="auth-required-modal__actions">
          <button 
            class="btn btn--secondary"
            @click="handleLogin"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10,17 15,12 10,7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            {{ $t('auth.login') }}
          </button>
          <button 
            class="btn btn--primary"
            @click="handleRegister"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
            {{ $t('auth.register') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '../../composables/useI18n'
import { useAuthModal } from '../../composables/useAuthModal'

interface Props {
  isOpen: boolean
  title?: string
  message?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Authorization Required',
  message: 'To book this tour, please sign in or create an account'
})

const emit = defineEmits<{
  close: []
}>()

const { t: $t } = useI18n()
const { openAuthModal } = useAuthModal()

const handleBackdropClick = (event: Event) => {
  if (event.target === event.currentTarget) {
    handleClose()
  }
}

const handleClose = () => {
  emit('close')
}

const handleLogin = () => {
  handleClose()
  // Открываем модальное окно в режиме входа
  openAuthModal('login')
}

const handleRegister = () => {
  handleClose()
  // Открываем модальное окно в режиме регистрации
  openAuthModal('register')
}

// Export component
defineExpose({})
</script>

<style scoped>
.auth-required-modal {
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

.auth-required-modal__content {
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

.auth-required-modal__close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
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

.auth-required-modal__close:hover {
  background: rgba(0, 0, 0, 0.1);
  color: var(--color-text);
  transform: scale(1.05);
}

.auth-required-modal__header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 2rem 4rem 1rem 2rem;
  border-bottom: 1px solid var(--color-border-soft);
}

.auth-required-modal__icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.auth-required-modal__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  line-height: 1.3;
  font-family: var(--font-family);
  padding-right: 1rem;
}

.auth-required-modal__body {
  padding: 1.5rem 2rem 2rem 2rem;
}

.auth-required-modal__message {
  font-size: 1rem;
  color: var(--color-text-soft);
  line-height: 1.6;
  margin: 0 0 2rem 0;
  font-family: var(--font-family);
}

.auth-required-modal__actions {
  display: flex;
  gap: 1rem;
  flex-direction: column;
}

@media (max-width: 640px) {
  .auth-required-modal {
    padding: 1rem;
  }

  .auth-required-modal__content {
    border-radius: 6px;
    max-height: 95vh;
  }
  
  .auth-required-modal__header {
    padding: 1.5rem 1.5rem 1rem 1.5rem;
  }
  
  .auth-required-modal__body {
    padding: 1rem 1.5rem 1.5rem 1.5rem;
  }
  
  .auth-required-modal__title {
    font-size: 1.25rem;
  }
  
  .auth-required-modal__actions {
    gap: 0.75rem;
  }
}
</style>
