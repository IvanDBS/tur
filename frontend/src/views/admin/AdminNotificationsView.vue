<template>
  <div class="admin-notifications">
    <div class="page-header">
      <h1>Управление уведомлениями</h1>
      <div class="header-actions">
        <button @click="showCreateModal = true" class="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Отправить уведомление
        </button>
        <button @click="showBulkModal = true" class="btn btn-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          Массовая рассылка
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">Всего уведомлений</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 6v6l4 2"></path>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.unread }}</div>
          <div class="stat-label">Непрочитанных</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 12l2 2 4-4"></path>
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.delivered }}</div>
          <div class="stat-label">Доставлено</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 6v6l4 2"></path>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.pending_delivery }}</div>
          <div class="stat-label">Ожидают доставки</div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filters-row">
        <select v-model="filters.type" @change="loadNotifications" class="filter-select">
          <option value="">Все типы</option>
          <option value="info">Информация</option>
          <option value="success">Успех</option>
          <option value="warning">Предупреждение</option>
          <option value="error">Ошибка</option>
          <option value="booking_update">Обновление бронирования</option>
          <option value="system">Система</option>
          <option value="admin_message">Сообщение админа</option>
        </select>
        
        <select v-model="filters.event_type" @change="loadNotifications" class="filter-select">
          <option value="">Все события</option>
          <option value="user_registered">Регистрация пользователя</option>
          <option value="booking_created">Создание бронирования</option>
          <option value="booking_confirmed">Подтверждение бронирования</option>
          <option value="booking_cancelled">Отмена бронирования</option>
          <option value="admin_message">Сообщение админа</option>
        </select>
        
        <select v-model="filters.delivered" @change="loadNotifications" class="filter-select">
          <option value="">Все</option>
          <option value="true">Доставлено</option>
          <option value="false">Не доставлено</option>
        </select>
        
        <button @click="resetFilters" class="btn btn-outline">Сбросить</button>
      </div>
    </div>

    <!-- Notifications Table -->
    <div class="table-container">
      <table class="notifications-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Пользователь</th>
            <th>Заголовок</th>
            <th>Тип</th>
            <th>Каналы</th>
            <th>Статус</th>
            <th>Создано</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="loading-row">
            <td colspan="8" class="text-center">Загрузка...</td>
          </tr>
          <tr v-else-if="notifications.length === 0">
            <td colspan="8" class="text-center">Уведомления не найдены</td>
          </tr>
          <tr v-else v-for="notification in notifications" :key="notification.id">
            <td>{{ notification.id }}</td>
            <td>
              <div class="user-info">
                <div class="user-name">{{ notification.user.name }}</div>
                <div class="user-email">{{ notification.user.email }}</div>
              </div>
            </td>
            <td>
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-message">{{ notification.message }}</div>
            </td>
            <td>
              <span :class="['type-badge', `type-${notification.type}`]">
                {{ getTypeLabel(notification.type) }}
              </span>
            </td>
            <td>
              <div class="channels-list">
                <span 
                  v-for="channel in notification.delivery_channels" 
                  :key="channel"
                  :class="['channel-badge', `channel-${channel}`]"
                >
                  {{ getChannelLabel(channel) }}
                </span>
              </div>
            </td>
            <td>
              <div class="status-info">
                <span v-if="notification.read" class="status-badge read">
                  Прочитано
                </span>
                <span v-else :class="['status-badge', notification.delivered ? 'delivered' : 'pending']">
                  {{ notification.delivered ? 'Доставлено' : 'Ожидает' }}
                </span>
              </div>
            </td>
            <td>{{ formatDate(notification.created_at) }}</td>
            <td>
              <div class="action-buttons">
                <button @click="viewNotification(notification)" class="btn-icon" title="Просмотр">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
                <button @click="deleteNotification(notification.id)" class="btn-icon btn-danger" title="Удалить">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.total_pages > 1" class="pagination">
      <button 
        @click="changePage(pagination.current_page - 1)"
        :disabled="pagination.current_page <= 1"
        class="btn btn-outline"
      >
        Назад
      </button>
      
      <span class="pagination-info">
        Страница {{ pagination.current_page }} из {{ pagination.total_pages }}
      </span>
      
      <button 
        @click="changePage(pagination.current_page + 1)"
        :disabled="pagination.current_page >= pagination.total_pages"
        class="btn btn-outline"
      >
        Вперед
      </button>
    </div>

    <!-- Create Notification Modal -->
    <NotificationCreateModal 
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @created="handleNotificationCreated"
    />

    <!-- Bulk Notification Modal -->
    <NotificationBulkModal 
      v-if="showBulkModal"
      @close="showBulkModal = false"
      @created="handleBulkNotificationCreated"
    />

    <!-- View Notification Modal -->
    <NotificationViewModal 
      v-if="selectedNotification"
      :notification="selectedNotification"
      @close="selectedNotification = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAdminNotificationsApi } from '@/composables/useNotificationsApi'
import type { AdminNotification, NotificationFilters } from '@/types/notifications'
import NotificationCreateModal from '@/components/admin/NotificationCreateModal.vue'
import NotificationBulkModal from '@/components/admin/NotificationBulkModal.vue'
import NotificationViewModal from '@/components/admin/NotificationViewModal.vue'

const { 
  loading, 
  error, 
  getAdminNotifications, 
  getNotificationStats,
  cleanupNotifications 
} = useAdminNotificationsApi()

// State
const notifications = ref<AdminNotification[]>([])
const stats = ref({
  total: 0,
  unread: 0,
  delivered: 0,
  pending_delivery: 0,
  by_type: {},
  by_event: {},
  recent_24h: 0
})
const pagination = ref({
  current_page: 1,
  total_pages: 1,
  total_count: 0,
  per_page: 20
})
const filters = ref<NotificationFilters>({
  type: '',
  event_type: '',
  delivered: '',
  page: 1,
  per_page: 20
})

// Modals
const showCreateModal = ref(false)
const showBulkModal = ref(false)
const selectedNotification = ref<AdminNotification | null>(null)

// Methods
const loadNotifications = async () => {
  try {
    const response = await getAdminNotifications(filters.value)
    notifications.value = response.notifications
    pagination.value = response.pagination
    stats.value = response.stats
  } catch (err) {
    console.error('Failed to load notifications:', err)
  }
}

const loadStats = async () => {
  try {
    const response = await getNotificationStats()
    stats.value = response.stats
  } catch (err) {
    console.error('Failed to load stats:', err)
  }
}

const changePage = (page: number) => {
  filters.value.page = page
  loadNotifications()
}

const resetFilters = () => {
  filters.value = {
    type: '',
    event_type: '',
    delivered: '',
    page: 1,
    per_page: 20
  }
  loadNotifications()
}

const viewNotification = (notification: AdminNotification) => {
  selectedNotification.value = notification
}

const deleteNotification = async (id: number) => {
  if (confirm('Вы уверены, что хотите удалить это уведомление?')) {
    try {
      // TODO: Implement delete API call
      console.log('Delete notification:', id)
      loadNotifications()
    } catch (err) {
      console.error('Failed to delete notification:', err)
    }
  }
}

const handleNotificationCreated = () => {
  showCreateModal.value = false
  loadNotifications()
  loadStats()
}

const handleBulkNotificationCreated = () => {
  showBulkModal.value = false
  loadNotifications()
  loadStats()
}

// Utility functions
const getTypeLabel = (type: string) => {
  const labels = {
    info: 'Информация',
    success: 'Успех',
    warning: 'Предупреждение',
    error: 'Ошибка',
    booking_update: 'Бронирование',
    system: 'Система',
    admin_message: 'Админ'
  }
  return labels[type as keyof typeof labels] || type
}

const getChannelLabel = (channel: string) => {
  const labels = {
    in_app: 'В приложении',
    email: 'Email',
    sms: 'SMS',
    push: 'Push',
    webhook: 'Webhook'
  }
  return labels[channel as keyof typeof labels] || channel
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('ru-RU')
}

// Lifecycle
onMounted(() => {
  loadNotifications()
  loadStats()
})
</script>

<style scoped>
.admin-notifications {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--color-primary-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--color-text-soft);
  margin-top: 0.25rem;
}

.filters-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filters-row {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: white;
  font-size: 0.875rem;
  min-width: 150px;
}

.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.notifications-table {
  width: 100%;
  border-collapse: collapse;
}

.notifications-table th {
  background: var(--color-background-soft);
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
}

.notifications-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
  vertical-align: top;
}

.notifications-table tr:hover {
  background: var(--color-background-soft);
}

.user-info {
  min-width: 150px;
}

.user-name {
  font-weight: 500;
  color: var(--color-text);
}

.user-email {
  font-size: 0.875rem;
  color: var(--color-text-soft);
}

.notification-title {
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 0.25rem;
}

.notification-message {
  font-size: 0.875rem;
  color: var(--color-text-soft);
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.type-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.type-info { background: #e3f2fd; color: #1976d2; }
.type-success { background: #e8f5e8; color: #2e7d32; }
.type-warning { background: #fff3e0; color: #f57c00; }
.type-error { background: #ffebee; color: #d32f2f; }
.type-booking_update { background: #f3e5f5; color: #7b1fa2; }
.type-system { background: #f5f5f5; color: #616161; }
.type-admin_message { background: #e8f5e8; color: #2e7d32; }

.channels-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.channel-badge {
  display: inline-block;
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  font-size: 0.625rem;
  font-weight: 500;
  background: var(--color-background-soft);
  color: var(--color-text-soft);
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.delivered {
  background: #e8f5e8;
  color: #2e7d32;
}

.status-badge.pending {
  background: #fff3e0;
  color: #f57c00;
}

.status-badge.read {
  background: #e3f2fd;
  color: #1976d2;
}

.read-status {
  font-size: 0.75rem;
  color: var(--color-text-soft);
  margin-top: 0.25rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: var(--color-background-soft);
  color: var(--color-text-soft);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: var(--color-primary-muted);
  color: var(--color-primary);
}

.btn-icon.btn-danger:hover {
  background: #ffebee;
  color: #d32f2f;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.pagination-info {
  font-size: 0.875rem;
  color: var(--color-text-soft);
}

.loading-row td {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-soft);
}

.text-center {
  text-align: center;
}

@media (max-width: 768px) {
  .admin-notifications {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-select {
    min-width: auto;
  }
  
  .notifications-table {
    font-size: 0.875rem;
  }
  
  .notifications-table th,
  .notifications-table td {
    padding: 0.75rem 0.5rem;
  }
}
</style>
