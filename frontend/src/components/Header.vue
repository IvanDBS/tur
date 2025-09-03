<template>
  <header class="header">
    <nav class="nav">
      <div class="nav-container">
        <!-- Logo -->
        <router-link to="/" class="logo">
          <span class="logo-text">migo.md</span>
        </router-link>

        <!-- Navigation Links -->
        <div class="nav-links">
          <router-link to="/" class="nav-link">Поиск</router-link>
          <router-link
            v-if="authStore.isAuthenticated"
            to="/bookings"
            class="nav-link"
            >Мои туры</router-link
          >
          <router-link to="/auth-test" class="nav-link"
            >Тест авторизации</router-link
          >
          <router-link to="/obs-test" class="nav-link"
            >Тест OBS API</router-link
          >
          <router-link to="/about" class="nav-link">О нас</router-link>
          <router-link to="/contact" class="nav-link">Контакты</router-link>
        </div>

        <!-- Auth Section -->
        <div class="nav-auth">
          <!-- Authenticated User -->
          <div v-if="authStore.isAuthenticated" class="user-menu">
            <button @click="toggleUserMenu" class="user-btn">
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
              {{ userDisplayName }}
            </button>

            <div v-if="isUserMenuOpen" class="user-dropdown">
              <div class="user-info">
                <div class="user-name">{{ userFullName }}</div>
                <div class="user-email">{{ authStore.currentUser?.email }}</div>
              </div>
              <button @click="handleLogout" class="dropdown-item">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16,17 21,12 16,7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Выйти
              </button>
            </div>
          </div>

          <!-- Guest User -->
          <button v-else @click="handleOpenAuthModal" class="auth-btn">
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

        <!-- Mobile Menu Button -->
        <button class="mobile-menu-btn" @click="toggleMobileMenu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <!-- Mobile Menu -->
      <div
        class="mobile-menu"
        :class="{ 'mobile-menu-open': isMobileMenuOpen }"
      >
        <router-link to="/" class="mobile-link" @click="closeMobileMenu"
          >Поиск</router-link
        >
        <router-link to="/bookings" class="mobile-link" @click="closeMobileMenu"
          >Мои туры</router-link
        >
        <router-link
          to="/auth-test"
          class="mobile-link"
          @click="closeMobileMenu"
          >Тест авторизации</router-link
        >
        <router-link to="/about" class="mobile-link" @click="closeMobileMenu"
          >О нас</router-link
        >
        <router-link to="/contact" class="mobile-link" @click="closeMobileMenu"
          >Контакты</router-link
        >

        <!-- Mobile Auth -->
        <div v-if="authStore.isAuthenticated" class="mobile-user">
          <div class="mobile-user-info">
            <div class="mobile-user-name">{{ userFullName }}</div>
            <div class="mobile-user-email">
              {{ authStore.currentUser?.email }}
            </div>
          </div>
          <button @click="handleLogout" class="mobile-logout-btn">Выйти</button>
        </div>
        <button v-else @click="handleOpenAuthModal" class="mobile-auth-btn">
          Войти
        </button>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { useAuthStore } from '@/stores/auth'
  import { useAuthModal } from '@/composables/useAuthModal'

  // Header component for the application

  const authStore = useAuthStore()
  const { openAuthModal } = useAuthModal()

  const isMobileMenuOpen = ref(false)
  const isUserMenuOpen = ref(false)

  // Wrapper for opening auth modal that also closes mobile menu
  const handleOpenAuthModal = () => {
    openAuthModal()
    closeMobileMenu()
  }

  // Computed
  const userDisplayName = computed(() => {
    const user = authStore.currentUser
    if (!user) return ''

    if (user.firstName) {
      return user.firstName
    } else {
      return user.email.split('@')[0]
    }
  })

  const userFullName = computed(() => {
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
  const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
  }

  const closeMobileMenu = () => {
    isMobileMenuOpen.value = false
  }

  const toggleUserMenu = () => {
    isUserMenuOpen.value = !isUserMenuOpen.value
  }

  const handleLogout = async () => {
    await authStore.logout()
    isUserMenuOpen.value = false
    closeMobileMenu()
  }

  // Close user menu when clicking outside
  const handleClickOutside = (event: Event) => {
    const target = event.target as Element
    if (!target.closest('.user-menu')) {
      isUserMenuOpen.value = false
    }
  }

  // Lifecycle
  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
    // Try to get current user on mount
    authStore.getCurrentUser()
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
</script>

<style scoped>
  .header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 999999;
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(20px);
    background: rgba(255, 255, 255, 0.1);
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .nav {
    width: 100%;
  }

  .nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 72px;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .logo:hover {
    transform: scale(1.02);
  }

  .logo-text {
    font-size: 2.25rem;
    font-weight: 700;
    color: var(--color-primary);
    letter-spacing: -0.02em;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .nav-link {
    color: var(--color-text-soft);
    text-decoration: none;
    font-weight: 500;
    font-size: 0.95rem;
    transition: all 0.2s ease;
    position: relative;
    padding: 0.5rem 0;
  }

  .nav-link:hover {
    color: var(--color-secondary);
    transform: scale(1.02);
  }

  .nav-link.router-link-active {
    color: var(--color-secondary);
  }

  .nav-link.router-link-active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--color-secondary);
    border-radius: 1px;
  }

  .nav-auth {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .auth-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    border: none;
    border-radius: 6px;
    background: var(--color-secondary);
    color: white;
    font-family: var(--font-family);
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px var(--color-secondary-muted);
  }

  .auth-btn:hover {
    transform: scale(1.02);
    background: var(--color-secondary-hover);
  }

  .user-menu {
    position: relative;
  }

  .user-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    border: none;
    border-radius: 6px;
    background: var(--color-secondary);
    color: white;
    font-family: var(--font-family);
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px var(--color-secondary-muted);
  }

  .user-btn:hover {
    transform: scale(1.02);
    background: var(--color-secondary-hover);
  }

  .user-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.5rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(0, 0, 0, 0.1);
    min-width: 200px;
    z-index: 1000;
  }

  .user-info {
    padding: 1rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  .user-name {
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 0.25rem;
  }

  .user-email {
    font-size: 0.875rem;
    color: var(--color-text-soft);
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.75rem 1rem;
    border: none;
    background: none;
    color: var(--color-text);
    font-family: var(--font-family);
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .dropdown-item:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  .mobile-user {
    padding: 1rem;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    margin-top: 1rem;
  }

  .mobile-user-info {
    margin-bottom: 1rem;
  }

  .mobile-user-name {
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 0.25rem;
  }

  .mobile-user-email {
    font-size: 0.875rem;
    color: var(--color-text-soft);
  }

  .mobile-logout-btn {
    width: 100%;
    padding: 0.75rem;
    border: none;
    border-radius: 8px;
    background: #ef4444;
    color: white;
    font-family: var(--font-family);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .mobile-logout-btn:hover {
    background: #dc2626;
  }

  .mobile-menu-btn {
    display: none;
    flex-direction: column;
    gap: 4px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
  }

  .mobile-menu-btn span {
    width: 20px;
    height: 2px;
    background: var(--color-text);
    border-radius: 2px;
    transition: all 0.3s ease;
  }

  .mobile-menu {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    padding: 1rem;
    opacity: 0;
    transform: translateY(-10px);
    transition: all 0.3s ease;
  }

  .mobile-menu-open {
    opacity: 1;
    transform: translateY(0);
  }

  .mobile-link {
    display: block;
    padding: 1rem;
    color: var(--color-text);
    text-decoration: none;
    font-weight: 500;
    border-radius: 12px;
    transition: all 0.2s ease;
    margin-bottom: 0.5rem;
  }

  .mobile-link:hover {
    background: var(--color-secondary-muted);
    color: var(--color-secondary);
  }

  .mobile-auth-btn {
    width: 100%;
    padding: 1rem;
    margin-top: 1rem;
    border: none;
    border-radius: 12px;
    background: var(--color-secondary);
    color: white;
    font-family: var(--font-family);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .mobile-auth-btn:hover {
    background: var(--color-secondary-hover);
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {
    .nav-container {
      padding: 0 1rem;
      height: 64px;
    }

    .nav-links {
      display: none;
    }

    .nav-auth {
      display: none;
    }

    .mobile-menu-btn {
      display: flex;
    }

    .mobile-menu {
      display: block;
    }

    .logo-text {
      font-size: 1.75rem;
    }
  }

  @media (max-width: 480px) {
    .nav-container {
      padding: 0 0.75rem;
    }

    .logo-text {
      font-size: 1.5rem;
    }
  }
</style>
