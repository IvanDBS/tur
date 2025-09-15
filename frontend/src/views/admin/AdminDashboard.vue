<template>
  <div class="admin-dashboard">
    <!-- Admin Content -->
    <main class="admin-content">
      <div class="content-header">
        <div class="header-row">
          <h1 class="content-title">{{ pageTitle }}</h1>
          
          <div class="header-nav">
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
          </div>
          
          <div class="header-spacer"></div>
        </div>
      </div>

      <div class="content-body">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

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

</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background: var(--color-background-soft);
}

/* Admin Content */
.admin-content {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg) 0;
}

.content-header {
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin: 0;
  flex: 1;
}

.header-spacer {
  flex: 1;
}

.header-nav {
  display: flex;
  gap: var(--spacing-sm);
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
  white-space: nowrap;
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

.content-body {
  background: transparent;
  border-radius: 0;
  border: none;
  min-height: 600px;
  width: 100%;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .admin-content {
    padding: var(--spacing-sm) var(--spacing-md) 0;
  }

  .content-header {
    margin-bottom: var(--spacing-sm);
    padding: var(--spacing-sm);
  }


  .header-row {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: flex-start;
  }

  .content-title,
  .header-spacer {
    flex: none;
  }

  .header-nav {
    overflow-x: auto;
    padding-bottom: var(--spacing-xs);
  }
}

@media (max-width: 480px) {
  .admin-content {
    padding: var(--spacing-xs) var(--spacing-sm) 0;
  }

  .content-header {
    margin-bottom: var(--spacing-xs);
    padding: var(--spacing-xs);
  }

  .content-title {
    font-size: var(--font-size-lg);
  }

  .nav-item {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-size-sm);
  }
}
</style>