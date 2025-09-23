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
              <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 3c-1.11 0-2 .89-2 2v4c0 1.11.89 2 2 2h4c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2m.2 1.5l1.06 1.05L5.27 9.5L2.74 6.95L3.81 5.9l1.47 1.49M4 13c-1.11 0-2 .89-2 2v4c0 1.11.89 2 2 2h4c1.11 0 2-.89 2-2v-4c0-1.11-.89-2-2-2m-4 2h4v4H4m8-14h10v2H12m0 12v-2h10v2m-10-8h10v2H12Z"/>
              </svg>
              Бронирования
            </router-link>
            
            <router-link 
              to="/admin/users" 
              class="nav-item"
              :class="{ 'nav-item--active': $route.name === 'admin-users' }"
            >
              <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.152 9.032a2.643 2.643 0 1 0 .111-3.881c.182.32.318.669.4 1.038a1.643 1.643 0 1 1-.052 1.83a3.7 3.7 0 0 1-.459 1.013M8.737 5.15a2.643 2.643 0 1 0 .111 3.881a3.7 3.7 0 0 1-.458-1.012a1.642 1.642 0 0 1-3.033-.876a1.643 1.643 0 0 1 2.98-.954c.082-.37.218-.718.4-1.038m-4.036 5.146c-.3.08-.596.18-.891.278l-.254.084a2.63 2.63 0 0 0-1.73 1.843l-.298 2.133c-.113.816.325 1.674 1.22 1.887q.371.091.885.175a.5.5 0 1 0 .159-.988a11 11 0 0 1-.813-.16c-.303-.072-.516-.374-.46-.777l.283-2.049c.141-.52.54-1.05 1.066-1.223c.314-.103 1.094-.25 1.094-.25c.42.25.57.351.57.351a.5.5 0 0 0 .435-.9q-.152-.077-.296-.164c-.297-.176-.58-.344-.97-.24m15.489.278c-.295-.099-.59-.197-.891-.278c-.39-.104-.673.064-.97.24q-.144.087-.296.164a.5.5 0 0 0 .435.9s.15-.101.57-.351c0 0 .78.147 1.094.25c.526.173.924.703 1.066 1.223l.283 2.049c.056.403-.157.705-.46.777q-.335.082-.813.16a.5.5 0 1 0 .16.988q.512-.085.884-.175c.895-.213 1.333-1.07 1.22-1.887l-.299-2.133a2.62 2.62 0 0 0-1.73-1.843z" opacity=".5"/>
                <path d="M12 3.25a3.75 3.75 0 1 0 0 7.5a3.75 3.75 0 0 0 0-7.5M9.75 7a2.25 2.25 0 1 1 4.5 0a2.25 2.25 0 0 1-4.5 0m5.485 4.415c-.61-.173-1.187.034-1.582.297c-.36.238-.942.524-1.653.524s-1.294-.286-1.653-.524c-.396-.263-.973-.47-1.583-.297a12 12 0 0 0-.477.145l-.96.315a3.72 3.72 0 0 0-2.454 2.616l-.01.04l-.408 2.95c-.161 1.164.462 2.393 1.744 2.698c1.17.279 3.052.571 5.8.571c2.749 0 4.631-.292 5.801-.57c1.282-.306 1.906-1.535 1.744-2.698l-.408-2.95l-.01-.04a3.72 3.72 0 0 0-2.455-2.617l-.959-.315q-.237-.077-.477-.146m-.753 1.546c.174-.115.298-.117.345-.103q.21.06.417.127l.96.315c.72.237 1.264.812 1.458 1.523l.397 2.864c.075.544-.21.939-.606 1.033c-1.047.25-2.812.53-5.453.53s-4.407-.28-5.454-.53c-.395-.094-.68-.489-.606-1.033l.397-2.864A2.23 2.23 0 0 1 7.796 13.3l.96-.315q.206-.068.416-.127c.048-.014.17-.012.345.103c.501.333 1.372.775 2.483.775s1.98-.442 2.482-.775"/>
              </svg>
              Пользователи
            </router-link>
            
            <router-link 
              to="/admin/security" 
              class="nav-item"
              :class="{ 'nav-item--active': $route.name === 'admin-security' }"
            >
              <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">
                  <path d="M11.998 2C8.99 2 7.04 4.019 4.734 4.755c-.938.3-1.407.449-1.597.66c-.19.21-.245.519-.356 1.135c-1.19 6.596 1.41 12.694 7.61 15.068c.665.255.998.382 1.61.382s.946-.128 1.612-.383c6.199-2.373 8.796-8.471 7.606-15.067c-.111-.616-.167-.925-.357-1.136s-.658-.36-1.596-.659C16.959 4.019 15.006 2 11.998 2"/>
                  <path d="M10.337 10.38c-1.08 0-1.62.78-1.74 1.26s-.12 2.22-.048 2.94c.24.9.84 1.272 1.428 1.392c.54.048 2.82.03 3.48.03c.96.018 1.68-.342 1.98-1.422c.06-.36.12-2.34-.03-2.94c-.318-.96-1.11-1.26-1.71-1.26zm-.087-.421c0-.06.008-.406.01-.84c0-.398-.034-.78.156-1.13c.71-1.414 2.75-1.27 3.254.17c.087.237.093.612.09.96c-.003.443.006.84.006.84"/>
                </g>
              </svg>
              Безопасность
            </router-link>
            
            <router-link 
              to="/admin/notifications" 
              class="nav-item"
              :class="{ 'nav-item--active': $route.name === 'admin-notifications' }"
            >
              <svg class="nav-icon" width="20" height="20" viewBox="0 0 32 32" fill="currentColor">
                <path d="M16.59 20.41L20.17 24l-3.59 3.59L18 29l5-5l-5-5l-1.41 1.41zm7 0L27.17 24l-3.59 3.59L25 29l5-5l-5-5l-1.41 1.41z"/>
                <path d="M14 23H4V7.91l11.43 7.91a1 1 0 0 0 1.14 0L28 7.91V17h2V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10ZM25.8 7L16 13.78L6.2 7Z"/>
              </svg>
              Уведомления
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
    case 'admin-security':
      return 'Управление безопасностью'
    case 'admin-notifications':
      return 'Управление уведомлениями'
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
  width: 20px;
  height: 20px;
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