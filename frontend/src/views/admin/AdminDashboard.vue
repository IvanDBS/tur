<template>
  <div class="admin-dashboard">
    <div class="admin-layout">
      <!-- Admin Sidebar -->
      <aside class="admin-sidebar">
        <div class="sidebar-header">
          <h2 class="sidebar-title">Админ-панель</h2>
        </div>
        
        <nav class="sidebar-nav">
          <router-link 
            to="/admin/bookings" 
            class="nav-item"
            :class="{ 'nav-item--active': $route.name === 'admin-bookings' }"
          >
            <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Бронирования
          </router-link>
          
          <router-link 
            to="/admin/users" 
            class="nav-item"
            :class="{ 'nav-item--active': $route.name === 'admin-users' }"
          >
            <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Пользователи
          </router-link>
        </nav>
      </aside>

      <!-- Admin Content -->
      <main class="admin-content">
        <div class="content-header">
          <h1 class="content-title">{{ pageTitle }}</h1>
          <div class="content-actions">
            <button class="btn btn--secondary btn--sm" @click="goBack">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5m7-7l-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Назад на сайт
            </button>
          </div>
        </div>

        <div class="content-body">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const pageTitle = computed(() => {
  switch (route.name) {
    case 'admin-bookings':
      return 'Управление бронированиями'
    case 'admin-users':
      return 'Управление пользователями'
    default:
      return 'Админ-панель'
  }
})

const goBack = () => {
  router.push('/')
}
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background: var(--color-background-soft);
}

.admin-layout {
  display: flex;
  min-height: 100vh;
}

.admin-sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid var(--color-border);
  padding: var(--spacing-xl);
  position: fixed;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-header {
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.sidebar-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin: 0;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius);
  text-decoration: none;
  color: var(--color-text-soft);
  font-weight: var(--font-weight-medium);
  transition: var(--transition);
}

.nav-item:hover {
  background: var(--color-background-soft);
  color: var(--color-text);
}

.nav-item--active {
  background: var(--color-secondary-muted);
  color: var(--color-secondary);
}

.nav-icon {
  flex-shrink: 0;
}

.admin-content {
  flex: 1;
  margin-left: 280px;
  padding: var(--spacing-xl);
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.content-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin: 0;
}

.content-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.content-body {
  background: white;
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-border);
  min-height: 600px;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .admin-sidebar {
    width: 100%;
    position: relative;
    height: auto;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
  }

  .admin-content {
    margin-left: 0;
    padding: var(--spacing-md);
  }

  .content-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .sidebar-nav {
    flex-direction: row;
    overflow-x: auto;
  }

  .nav-item {
    white-space: nowrap;
  }
}
</style>
