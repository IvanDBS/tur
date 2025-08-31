<template>
  <div class="auth-test">
    <div class="container">
      <h1>Тест авторизации</h1>

      <div class="auth-status">
        <h2>Статус авторизации</h2>
        <div class="status-card">
          <div class="status-item">
            <span class="status-label">Авторизован:</span>
            <span
              class="status-value"
              :class="{
                'status--success': authStore.isAuthenticated,
                'status--error': !authStore.isAuthenticated,
              }"
            >
              {{ authStore.isAuthenticated ? 'Да' : 'Нет' }}
            </span>
          </div>

          <div v-if="authStore.currentUser" class="status-item">
            <span class="status-label">Пользователь:</span>
            <span class="status-value">{{ userDisplayName }}</span>
          </div>

          <div v-if="authStore.currentUser" class="status-item">
            <span class="status-label">Email:</span>
            <span class="status-value">{{ authStore.currentUser.email }}</span>
          </div>

          <div v-if="authStore.isLoading" class="status-item">
            <span class="status-label">Загрузка:</span>
            <span class="status-value status--loading">В процессе...</span>
          </div>

          <div v-if="authStore.error" class="status-item">
            <span class="status-label">Ошибка:</span>
            <span class="status-value status--error">{{
              authStore.error
            }}</span>
          </div>
        </div>
      </div>

      <div class="auth-actions">
        <h2>Действия</h2>
        <div class="action-buttons">
          <button @click="openAuthModal" class="btn btn--primary">
            Открыть модальное окно авторизации
          </button>

          <button
            v-if="authStore.isAuthenticated"
            @click="handleLogout"
            class="btn btn--secondary"
          >
            Выйти
          </button>

          <button @click="testGetCurrentUser" class="btn btn--outline">
            Проверить текущего пользователя
          </button>
        </div>
      </div>

      <div class="api-test">
        <h2>Тест API</h2>
        <div class="api-buttons">
          <button @click="testRegister" class="btn btn--outline">
            Тест регистрации
          </button>
          <button @click="testLogin" class="btn btn--outline">
            Тест входа
          </button>
          <button @click="testLogout" class="btn btn--outline">
            Тест выхода
          </button>
        </div>
      </div>
    </div>

    <!-- Auth Modal -->
    <AuthModal :is-open="isAuthModalOpen" @close="closeAuthModal" />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useAuthStore } from '@/stores/auth'
  import AuthModal from '@/components/auth/AuthModal.vue'

  const authStore = useAuthStore()
  const isAuthModalOpen = ref(false)

  // Computed
  const userDisplayName = computed(() => {
    const user = authStore.currentUser
    if (!user) return ''

    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`
    } else if (user.firstName) {
      return user.firstName
    } else {
      return user.email.split('@')[0]
    }
  })

  // Methods
  const openAuthModal = () => {
    isAuthModalOpen.value = true
  }

  const closeAuthModal = () => {
    isAuthModalOpen.value = false
  }

  const handleLogout = async () => {
    await authStore.logout()
  }

  const testGetCurrentUser = async () => {
    await authStore.getCurrentUser()
  }

  const testRegister = async () => {
    try {
      await authStore.register({
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        passwordConfirmation: 'password123',
        firstName: 'Test',
        lastName: 'User',
      })
      alert('Регистрация успешна!')
    } catch (error) {
      alert(`Ошибка регистрации: ${error}`)
    }
  }

  const testLogin = async () => {
    try {
      await authStore.login({
        email: 'test2@example.com',
        password: 'password123',
      })
      alert('Вход успешен!')
    } catch (error) {
      alert(`Ошибка входа: ${error}`)
    }
  }

  const testLogout = async () => {
    try {
      await authStore.logout()
      alert('Выход успешен!')
    } catch (error) {
      alert(`Ошибка выхода: ${error}`)
    }
  }

  // Lifecycle
  onMounted(() => {
    // Try to get current user on mount
    authStore.getCurrentUser()
  })
</script>

<style scoped>
  .auth-test {
    min-height: calc(
      100vh - 72px - 200px
    ); /* Вычитаем высоту хедера и футера */
    padding-top: 7rem;
    padding-bottom: 2rem;
    background: var(--color-background-soft);
  }

  .container {
    max-width: 800px;
    margin: 0 auto;
  }

  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 2rem;
    text-align: center;
  }

  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 1rem;
  }

  .auth-status {
    margin-bottom: 2rem;
  }

  .status-card {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid #f3f4f6;
  }

  .status-item:last-child {
    border-bottom: none;
  }

  .status-label {
    font-weight: 500;
    color: #6b7280;
  }

  .status-value {
    font-weight: 600;
  }

  .status--success {
    color: #059669;
  }

  .status--error {
    color: #dc2626;
  }

  .status--loading {
    color: #3b82f6;
  }

  .auth-actions {
    margin-bottom: 2rem;
  }

  .action-buttons {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .api-test {
    margin-bottom: 2rem;
  }

  .api-buttons {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn--primary {
    background: #3b82f6;
    color: white;
  }

  .btn--primary:hover {
    background: #2563eb;
  }

  .btn--secondary {
    background: #ef4444;
    color: white;
  }

  .btn--secondary:hover {
    background: #dc2626;
  }

  .btn--outline {
    background: white;
    color: #374151;
    border: 1px solid #d1d5db;
  }

  .btn--outline:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }

  @media (max-width: 768px) {
    .auth-test {
      min-height: calc(100vh - 64px - 200px);
      padding-top: 5rem;
      padding-bottom: 1rem;
    }

    .container {
      padding: 0 1rem;
    }

    .action-buttons,
    .api-buttons {
      flex-direction: column;
    }

    .btn {
      width: 100%;
    }
  }
</style>
