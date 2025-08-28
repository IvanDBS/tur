<template>
  <header class="header">
    <nav class="nav">
      <div class="nav-container">
        <!-- Logo -->
        <router-link to="/" class="logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="logo-icon">
            <path d="M12 2.5c-1.5 0-3 .5-4.2 1.4L3 8l9 5 9-5-4.8-4.1C15 3 13.5 2.5 12 2.5z" fill="currentColor"/>
            <path d="M3 8v8c0 .8.4 1.5 1 1.9L12 22l8-4.1c.6-.4 1-1.1 1-1.9V8l-9 5-9-5z" fill="currentColor" opacity="0.7"/>
          </svg>
          <span class="logo-text">migo.md</span>
        </router-link>

        <!-- Navigation Links -->
        <div class="nav-links">
          <router-link to="/" class="nav-link">Поиск</router-link>
          <router-link to="/about" class="nav-link">О нас</router-link>
          <router-link to="/contact" class="nav-link">Контакты</router-link>
        </div>

        <!-- Auth Section -->
        <div class="nav-auth">
          <router-link to="/bookings" class="nav-link bookings-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 7H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
              <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            Мои туры
          </router-link>
          
          <button class="auth-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
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
      <div class="mobile-menu" :class="{ 'mobile-menu-open': isMobileMenuOpen }">
        <router-link to="/" class="mobile-link" @click="closeMobileMenu">Поиск</router-link>
        <router-link to="/bookings" class="mobile-link" @click="closeMobileMenu">Мои туры</router-link>
        <router-link to="/about" class="mobile-link" @click="closeMobileMenu">О нас</router-link>
        <router-link to="/contact" class="mobile-link" @click="closeMobileMenu">Контакты</router-link>
        <button class="mobile-auth-btn" @click="closeMobileMenu">Войти</button>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.85);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
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

.logo-icon {
  color: var(--color-ocean);
  filter: drop-shadow(0 2px 4px rgba(59, 130, 246, 0.2));
}

.logo-text {
  font-size: 1.75rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--color-ocean), var(--color-ocean-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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
  color: var(--color-ocean);
}

.nav-link.router-link-active {
  color: var(--color-ocean);
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--color-ocean), var(--color-ocean-light));
  border-radius: 1px;
}

.bookings-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
  border-radius: 25px;
  background: linear-gradient(135deg, var(--color-ocean), var(--color-ocean-light));
  color: white;
  font-family: var(--font-family);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.2);
}

.auth-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(59, 130, 246, 0.3);
  background: linear-gradient(135deg, var(--color-ocean-light), var(--color-ocean));
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
  background: rgba(59, 130, 246, 0.1);
  color: var(--color-ocean);
}

.mobile-auth-btn {
  width: 100%;
  padding: 1rem;
  margin-top: 1rem;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--color-ocean), var(--color-ocean-light));
  color: white;
  font-family: var(--font-family);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mobile-auth-btn:hover {
  background: linear-gradient(135deg, var(--color-ocean-light), var(--color-ocean));
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
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .nav-container {
    padding: 0 0.75rem;
  }
  
  .logo-text {
    font-size: 1.25rem;
  }
}
</style>
