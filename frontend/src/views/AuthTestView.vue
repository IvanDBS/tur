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
          <button @click="testRegister" class="btn btn--primary">
            🎲 Случайная регистрация
          </button>
          <button @click="createSpecificUser(1)" class="btn btn--outline">
            👤 Создать user1@example.com
          </button>
          <button @click="createSpecificUser(2)" class="btn btn--outline">
            👤 Создать user2@example.com
          </button>
          <button @click="createSpecificUser(3)" class="btn btn--outline">
            👤 Создать user3@example.com
          </button>
          <button @click="testLogin" class="btn btn--secondary">
            🔑 Тест входа
          </button>
          <button @click="testAdminLogin" class="btn btn--outline">
            👑 Тест входа (АДМИН)
          </button>
          <button @click="testLogout" class="btn btn--outline">
            🚪 Тест выхода
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
  import { logger } from '@/utils/logger'
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
    try {
      await authStore.logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const testRegister = async () => {
    try {
      // Генерируем уникальный номер пользователя
      const userNumber = Math.floor(Math.random() * 1000) + 1
      const testData = {
        email: `user${userNumber}@example.com`,
        password: 'password',
        passwordConfirmation: 'password',
        firstName: `User${userNumber}`,
        lastName: 'Test',
        phone: '+37312345678'
      }
      
      console.log('Регистрируем пользователя:', testData.email)
      await authStore.register(testData)
      console.log('✅ Регистрация успешна! Проверьте email для подтверждения.')
      logger.debug('Registration test completed')
    } catch (error) {
      console.error('❌ Ошибка регистрации:', error)
    }
  }

  const createSpecificUser = async (userNumber: number) => {
    try {
      const testData = {
        email: `user${userNumber}@example.com`,
        password: 'password',
        passwordConfirmation: 'password',
        firstName: `User${userNumber}`,
        lastName: 'Test',
        phone: '+37312345678'
      }
      
      console.log(`Создаем пользователя user${userNumber}@example.com`)
      await authStore.register(testData)
      console.log(`✅ Пользователь user${userNumber}@example.com создан! Проверьте email для подтверждения.`)
      logger.debug(`Specific user ${userNumber} registration completed`)
    } catch (error) {
      console.error(`❌ Ошибка создания пользователя user${userNumber}:`, error)
    }
  }

  const testLogin = async () => {
    try {
      // Используем случайного пользователя для входа
      const userNumber = Math.floor(Math.random() * 100) + 1
      const credentials = {
        email: `user${userNumber}@example.com`,
        password: 'password'
      }
      
      console.log('Входим как пользователь:', credentials.email)
      await authStore.login(credentials)
      console.log('✅ Вход успешен!')
      logger.debug('Login test completed')
    } catch (error) {
      console.error('❌ Ошибка входа:', error)
    }
  }

  const testAdminLogin = async () => {
    try {
      const credentials = {
        email: 'admin@example.com',
        password: 'password123'
      }
      
      await authStore.login(credentials)
      logger.debug('Admin login test completed')
    } catch (error) {
      console.error('Admin login test error:', error)
    }
  }

  const testLogout = async () => {
    try {
      await authStore.logout()
      logger.debug('Logout test completed')
    } catch (error) {
      console.error('Logout test error:', error)
    }
  }

  const testGetCurrentUser = async () => {
    try {
      await authStore.getCurrentUser()
      logger.debug('Get current user test completed')
    } catch (error) {
      console.error('Get current user test error:', error)
    }
  }

  // Lifecycle
  onMounted(() => {
    // Initialize auth state
    authStore.getCurrentUser()
  })
</script>

<style scoped>
  .auth-test {
    min-height: calc(100vh - 64px - 200px);
    padding: 2rem 0;
    background: #f9fafb;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1f2937;
    text-align: center;
    margin-bottom: 3rem;
  }

  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 1.5rem;
  }

  .auth-status {
    margin-bottom: 3rem;
  }

  .status-card {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    border: 1px solid #e5e7eb;
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
    padding: 0.25rem 0.75rem;
    border-radius: 6px;
    font-size: 0.875rem;
  }

  .status--success {
    background: #d1fae5;
    color: #065f46;
  }

  .status--error {
    background: #fee2e2;
    color: #991b1b;
  }

  .status--loading {
    background: #fef3c7;
    color: #92400e;
  }

  .auth-actions {
    margin-bottom: 3rem;
  }

  .action-buttons {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .api-test {
    margin-bottom: 3rem;
  }

  .api-buttons {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .btn--primary {
    background: var(--color-primary);
    color: white;
  }

  .btn--primary:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
  }

  .btn--secondary {
    background: #6b7280;
    color: white;
  }

  .btn--secondary:hover {
    background: #4b5563;
    transform: translateY(-1px);
  }

  .btn--outline {
    background: transparent;
    color: #374151;
    border: 2px solid #d1d5db;
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

    h1 {
      font-size: 2rem;
      margin-bottom: 2rem;
    }

    .action-buttons,
    .api-buttons {
      flex-direction: column;
    }

    .btn {
      width: 100%;
      justify-content: center;
    }
  }
</style>