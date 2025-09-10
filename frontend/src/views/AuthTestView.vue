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
          <button @click="testAdminLogin" class="btn btn--outline">
            Тест входа (АДМИН)
          </button>
          <button @click="testLogout" class="btn btn--outline">
            Тест выхода
          </button>
        </div>
      </div>

      <!-- Button Test -->
      <div class="button-test">
        <h2>Тест кнопки "Войти" в коралловом стиле</h2>
        
        <div class="variant-section">
          <h3>Кнопка "Войти" в коралловом стиле</h3>
          <div class="button-group">
            <button class="auth-btn coral-style" title="Войти">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Войти
            </button>
          </div>
        </div>
      </div>

      <!-- Checkbox Variants -->
      <div class="checkbox-variants">
        <h2>Варианты чекбоксов</h2>
        
        <!-- Variant 1: Minimal Square -->
        <div class="variant-section">
          <h3>Вариант 1: Минимальный квадрат</h3>
          <div class="checkbox-group">
            <label class="checkbox-v1">
              <input type="checkbox" v-model="checkboxes.v1" />
              <span class="checkmark"></span>
              <span class="label-text">Опция 1</span>
            </label>
            <label class="checkbox-v1">
              <input type="checkbox" v-model="checkboxes.v1b" />
              <span class="checkmark"></span>
              <span class="label-text">Опция 2</span>
            </label>
          </div>
        </div>

        <!-- Variant 2: Rounded -->
        <div class="variant-section">
          <h3>Вариант 2: Скругленный</h3>
          <div class="checkbox-group">
            <label class="checkbox-v2">
              <input type="checkbox" v-model="checkboxes.v2" />
              <span class="checkmark"></span>
              <span class="label-text">Опция 1</span>
            </label>
            <label class="checkbox-v2">
              <input type="checkbox" v-model="checkboxes.v2b" />
              <span class="checkmark"></span>
              <span class="label-text">Опция 2</span>
            </label>
          </div>
        </div>

        <!-- Variant 3: Toggle Switch -->
        <div class="variant-section">
          <h3>Вариант 3: Переключатель</h3>
          <div class="checkbox-group">
            <label class="checkbox-v3">
              <input type="checkbox" v-model="checkboxes.v3" />
              <span class="slider"></span>
              <span class="label-text">Опция 1</span>
            </label>
            <label class="checkbox-v3">
              <input type="checkbox" v-model="checkboxes.v3b" />
              <span class="slider"></span>
              <span class="label-text">Опция 2</span>
            </label>
          </div>
        </div>

        <!-- Variant 4: Circle -->
        <div class="variant-section">
          <h3>Вариант 4: Круглый</h3>
          <div class="checkbox-group">
            <label class="checkbox-v4">
              <input type="checkbox" v-model="checkboxes.v4" />
              <span class="checkmark"></span>
              <span class="label-text">Опция 1</span>
            </label>
            <label class="checkbox-v4">
              <input type="checkbox" v-model="checkboxes.v4b" />
              <span class="checkmark"></span>
              <span class="label-text">Опция 2</span>
            </label>
          </div>
        </div>

        <!-- Variant 5: Minimal Line -->
        <div class="variant-section">
          <h3>Вариант 5: Минимальная линия</h3>
          <div class="checkbox-group">
            <label class="checkbox-v5">
              <input type="checkbox" v-model="checkboxes.v5" />
              <span class="checkmark"></span>
              <span class="label-text">Опция 1</span>
            </label>
            <label class="checkbox-v5">
              <input type="checkbox" v-model="checkboxes.v5b" />
              <span class="checkmark"></span>
              <span class="label-text">Опция 2</span>
            </label>
          </div>
        </div>

        <!-- Variant 6: Rounded No Fill - Coral -->
        <div class="variant-section">
          <h3>Вариант 6: Скругленный без заливки (Коралловый)</h3>
          <div class="checkbox-group">
            <label class="checkbox-v6">
              <input type="checkbox" v-model="checkboxes.v6" />
              <span class="checkmark"></span>
              <span class="label-text">Опция 1</span>
            </label>
            <label class="checkbox-v6">
              <input type="checkbox" v-model="checkboxes.v6b" />
              <span class="checkmark"></span>
              <span class="label-text">Опция 2</span>
            </label>
          </div>
        </div>

        <!-- Variant 7: Rounded No Fill - Dark Blue -->
        <div class="variant-section">
          <h3>Вариант 7: Скругленный без заливки (Темно-синий)</h3>
          <div class="checkbox-group">
            <label class="checkbox-v7">
              <input type="checkbox" v-model="checkboxes.v7" />
              <span class="checkmark"></span>
              <span class="label-text">Опция 1</span>
            </label>
            <label class="checkbox-v7">
              <input type="checkbox" v-model="checkboxes.v7b" />
              <span class="checkmark"></span>
              <span class="label-text">Опция 2</span>
            </label>
          </div>
        </div>

        <!-- Variant 8: Rounded No Fill No Border - Dark Blue -->
        <div class="variant-section">
          <h3>Вариант 8: Скругленный без заливки и рамки (Темно-синий)</h3>
          <div class="checkbox-group">
            <label class="checkbox-v8">
              <input type="checkbox" v-model="checkboxes.v8" />
              <span class="checkmark"></span>
              <span class="label-text">Опция 1</span>
            </label>
            <label class="checkbox-v8">
              <input type="checkbox" v-model="checkboxes.v8b" />
              <span class="checkmark"></span>
              <span class="label-text">Опция 2</span>
            </label>
          </div>
        </div>

        <!-- Variant 9: Rounded No Fill Thin Border - Dark Blue -->
        <div class="variant-section">
          <h3>Вариант 9: Скругленный без заливки с тонкой рамкой (Темно-синий)</h3>
          <div class="checkbox-group">
            <label class="checkbox-v9">
              <input type="checkbox" v-model="checkboxes.v9" />
              <span class="checkmark"></span>
              <span class="label-text">Опция 1</span>
            </label>
            <label class="checkbox-v9">
              <input type="checkbox" v-model="checkboxes.v9b" />
              <span class="checkmark"></span>
              <span class="label-text">Опция 2</span>
            </label>
          </div>
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

  // Checkbox states
  const checkboxes = ref({
    v1: false,
    v1b: false,
    v2: false,
    v2b: false,
    v3: false,
    v3b: false,
    v4: false,
    v4b: false,
    v5: false,
    v5b: false,
    v6: false,
    v6b: false,
    v7: false,
    v7b: false,
    v8: false,
    v8b: false,
    v9: false,
    v9b: false,
  })

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

  const testAdminLogin = async () => {
    try {
      await authStore.login({
        email: 'admin@example.com',
        password: 'password123',
      })
      alert('Вход админа успешен!')
    } catch (error) {
      alert(`Ошибка входа админа: ${error}`)
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

  /* Button Test */
  .button-test {
    margin-bottom: 2rem;
  }

  .button-group {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  /* Base auth-btn styles */
  .auth-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    border: none;
    border-radius: 6px;
    font-family: var(--font-family);
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  /* Coral style for auth button */
  .auth-btn.coral-style {
    background: #ff6b6b;
    color: white;
    box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
  }

  .auth-btn.coral-style:hover {
    transform: scale(1.02);
    background: #ff5252;
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
  }

  /* Checkbox Variants */
  .checkbox-variants {
    margin-bottom: 2rem;
  }

  .variant-section {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 1rem;
  }

  .checkbox-group {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
  }

  /* Variant 1: Minimal Square */
  .checkbox-v1 {
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
  }

  .checkbox-v1 input {
    display: none;
  }

  .checkbox-v1 .checkmark {
    width: 18px;
    height: 18px;
    border: 2px solid #d1d5db;
    border-radius: 2px;
    margin-right: 8px;
    position: relative;
    transition: all 0.2s ease;
  }

  .checkbox-v1 input:checked + .checkmark {
    background: var(--color-primary);
    border-color: var(--color-primary);
  }

  .checkbox-v1 input:checked + .checkmark::after {
    content: '';
    position: absolute;
    left: 5px;
    top: 2px;
    width: 4px;
    height: 8px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  .checkbox-v1 .label-text {
    font-size: 14px;
    color: #374151;
  }

  /* Variant 2: Rounded */
  .checkbox-v2 {
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
  }

  .checkbox-v2 input {
    display: none;
  }

  .checkbox-v2 .checkmark {
    width: 18px;
    height: 18px;
    border: 2px solid #d1d5db;
    border-radius: 4px;
    margin-right: 8px;
    position: relative;
    transition: all 0.2s ease;
  }

  .checkbox-v2 input:checked + .checkmark {
    background: var(--color-primary);
    border-color: var(--color-primary);
  }

  .checkbox-v2 input:checked + .checkmark::after {
    content: '';
    position: absolute;
    left: 5px;
    top: 2px;
    width: 4px;
    height: 8px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  .checkbox-v2 .label-text {
    font-size: 14px;
    color: #374151;
  }

  /* Variant 3: Toggle Switch */
  .checkbox-v3 {
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
  }

  .checkbox-v3 input {
    display: none;
  }

  .checkbox-v3 .slider {
    width: 40px;
    height: 20px;
    background: #d1d5db;
    border-radius: 20px;
    margin-right: 8px;
    position: relative;
    transition: all 0.3s ease;
  }

  .checkbox-v3 .slider::before {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: white;
    top: 2px;
    left: 2px;
    transition: all 0.3s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .checkbox-v3 input:checked + .slider {
    background: var(--color-primary);
  }

  .checkbox-v3 input:checked + .slider::before {
    transform: translateX(20px);
  }

  .checkbox-v3 .label-text {
    font-size: 14px;
    color: #374151;
  }

  /* Variant 4: Circle */
  .checkbox-v4 {
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
  }

  .checkbox-v4 input {
    display: none;
  }

  .checkbox-v4 .checkmark {
    width: 18px;
    height: 18px;
    border: 2px solid #d1d5db;
    border-radius: 50%;
    margin-right: 8px;
    position: relative;
    transition: all 0.2s ease;
  }

  .checkbox-v4 input:checked + .checkmark {
    background: var(--color-primary);
    border-color: var(--color-primary);
  }

  .checkbox-v4 input:checked + .checkmark::after {
    content: '';
    position: absolute;
    left: 5px;
    top: 2px;
    width: 4px;
    height: 8px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  .checkbox-v4 .label-text {
    font-size: 14px;
    color: #374151;
  }

  /* Variant 5: Minimal Line */
  .checkbox-v5 {
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
  }

  .checkbox-v5 input {
    display: none;
  }

  .checkbox-v5 .checkmark {
    width: 18px;
    height: 18px;
    border: 2px solid #d1d5db;
    border-radius: 0;
    margin-right: 8px;
    position: relative;
    transition: all 0.2s ease;
  }

  .checkbox-v5 input:checked + .checkmark {
    background: var(--color-primary);
    border-color: var(--color-primary);
  }

  .checkbox-v5 input:checked + .checkmark::after {
    content: '';
    position: absolute;
    left: 5px;
    top: 2px;
    width: 4px;
    height: 8px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  .checkbox-v5 .label-text {
    font-size: 14px;
    color: #374151;
  }

  /* Variant 6: Rounded No Fill - Coral */
  .checkbox-v6 {
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
  }

  .checkbox-v6 input {
    display: none;
  }

  .checkbox-v6 .checkmark {
    width: 18px;
    height: 18px;
    border: 2px solid #d1d5db;
    border-radius: 4px;
    margin-right: 8px;
    position: relative;
    transition: all 0.2s ease;
    background: transparent;
  }

  .checkbox-v6 input:checked + .checkmark {
    border-color: #ff6b6b;
    background: transparent;
  }

  .checkbox-v6 input:checked + .checkmark::after {
    content: '';
    position: absolute;
    left: 5px;
    top: 2px;
    width: 4px;
    height: 8px;
    border: solid #ff6b6b;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  .checkbox-v6 .label-text {
    font-size: 14px;
    color: #374151;
  }

  /* Variant 7: Rounded No Fill - Dark Blue */
  .checkbox-v7 {
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
  }

  .checkbox-v7 input {
    display: none;
  }

  .checkbox-v7 .checkmark {
    width: 18px;
    height: 18px;
    border: 2px solid #d1d5db;
    border-radius: 4px;
    margin-right: 8px;
    position: relative;
    transition: all 0.2s ease;
    background: transparent;
  }

  .checkbox-v7 input:checked + .checkmark {
    border-color: #1e3a8a;
    background: transparent;
  }

  .checkbox-v7 input:checked + .checkmark::after {
    content: '';
    position: absolute;
    left: 5px;
    top: 2px;
    width: 4px;
    height: 8px;
    border: solid #1e3a8a;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  .checkbox-v7 .label-text {
    font-size: 14px;
    color: #374151;
  }

  /* Variant 8: Rounded No Fill No Border - Dark Blue */
  .checkbox-v8 {
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
  }

  .checkbox-v8 input {
    display: none;
  }

  .checkbox-v8 .checkmark {
    width: 18px;
    height: 18px;
    border: 2px solid #d1d5db;
    border-radius: 4px;
    margin-right: 8px;
    position: relative;
    transition: all 0.2s ease;
    background: transparent;
  }

  .checkbox-v8 input:checked + .checkmark {
    border-color: #d1d5db;
    background: transparent;
  }

  .checkbox-v8 input:checked + .checkmark::after {
    content: '';
    position: absolute;
    left: 5px;
    top: 2px;
    width: 4px;
    height: 8px;
    border: solid #1e3a8a;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  .checkbox-v8 .label-text {
    font-size: 14px;
    color: #374151;
  }

  /* Variant 9: Rounded No Fill Thin Border - Dark Blue */
  .checkbox-v9 {
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
  }

  .checkbox-v9 input {
    display: none;
  }

  .checkbox-v9 .checkmark {
    width: 18px;
    height: 18px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    margin-right: 8px;
    position: relative;
    transition: all 0.2s ease;
    background: transparent;
  }

  .checkbox-v9 input:checked + .checkmark {
    border-color: #1e3a8a;
    background: transparent;
  }

  .checkbox-v9 input:checked + .checkmark::after {
    content: '';
    position: absolute;
    left: 6px;
    top: 3px;
    width: 4px;
    height: 8px;
    border: solid #1e3a8a;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  .checkbox-v9 .label-text {
    font-size: 14px;
    color: #374151;
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

    .checkbox-group {
      flex-direction: column;
      gap: 1rem;
    }
  }
</style>
