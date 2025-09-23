<template>
  <div>
    <div class="notification-dropdown" ref="dropdownRef">
    <button 
      @click="toggleDropdown" 
      class="notification-btn"
      :class="{ 'has-unread': unreadCount > 0 }"
      title="Уведомления"
    >
      <img src="@/assets/icons/bell.svg" alt="Notifications" class="notification-icon" />
      <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
      <!-- WebSocket connection indicator (temporarily disabled) -->
      <!-- <span 
        v-if="!isConnected" 
        class="connection-indicator" 
        title="Нет подключения к серверу"
      ></span> -->
    </button>

    <div v-if="isOpen" class="dropdown-content">
      <div class="dropdown-header">
        <h3>Уведомления</h3>
        <div class="header-actions">
          <button 
            v-if="unreadCount > 0" 
            @click="markAllAsRead" 
            class="mark-all-btn"
            :disabled="loading"
          >
            Отметить все как прочитанные
          </button>
          <button @click="refreshNotifications" class="refresh-btn" :disabled="loading">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23,4 23,10 17,10"></polyline>
              <polyline points="1,20 1,14 7,14"></polyline>
              <path d="M20.49,9A9,9,0,0,0,5.64,5.64L1,10m22,4L18.36,18.36A9,9,0,0,1,3.51,15"></path>
            </svg>
          </button>
        </div>
      </div>

      <div class="notifications-list">
        <div v-if="loading && notifications.length === 0" class="loading-state">
          <div class="loading-spinner"></div>
          <span>Загрузка уведомлений...</span>
        </div>
        
        <div v-else-if="notifications.length === 0" class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 001.414.586H20a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2h.828z"></path>
          </svg>
          <span>Нет уведомлений</span>
        </div>
        
        <div v-else class="notifications">
          <div 
            v-for="notification in notifications" 
            :key="notification.id"
            class="notification-item"
            :class="{ 'unread': !notification.read }"
            @click="handleNotificationClick(notification)"
          >
            <div class="notification-content">
              <div class="notification-header">
                <span :class="['type-indicator', `type-${notification.type}`]"></span>
                <span class="notification-title">{{ notification.title }}</span>
                <span class="notification-time">{{ formatTime(notification.created_at) }}</span>
              </div>
              <div class="notification-message">{{ notification.message }}</div>
            </div>
            <div class="notification-actions">
              <button 
                @click.stop="deleteNotification(notification.id)"
                class="delete-btn"
                title="Удалить"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3,6 5,6 21,6"></polyline>
                  <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="notifications.length > 0" class="dropdown-footer">
        <button @click="viewAllNotifications" class="view-all-btn">
          Показать все уведомления
        </button>
      </div>
    </div>
  </div>

    <!-- Notification View Modal -->
    <UserNotificationModal 
      v-if="showModal && selectedNotification" 
      :notification="selectedNotification"
      @close="closeNotificationModal"
      @deleted="handleNotificationDeleted"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsApi } from '@/composables/useNotificationsApi'
import { useGlobalWebSocket } from '@/composables/useWebSocket'
import type { Notification as NotificationType } from '@/types/notifications'
import UserNotificationModal from '@/components/UserNotificationModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const { 
  loading, 
  error, 
  getUserNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead: markAllAsReadApi,
  deleteNotification: deleteNotificationApi 
} = useNotificationsApi()

// WebSocket functionality
const { 
  isConnected, 
  connect: connectWebSocket, 
  disconnect: disconnectWebSocket, 
  setOnNotification 
} = useGlobalWebSocket()

// State
const isOpen = ref(false)
const notifications = ref<NotificationType[]>([])
const unreadCount = ref(0)
let refreshInterval: NodeJS.Timeout | null = null
const dropdownRef = ref<HTMLElement>()

// Modal state
const showModal = ref(false)
const selectedNotification = ref<NotificationType | null>(null)

// Computed
const hasUnread = computed(() => unreadCount.value > 0)

// Methods
const toggleDropdown = async () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    await loadNotifications()
  }
}

const loadNotifications = async () => {
  try {
    const response = await getUserNotifications({ per_page: 10 })
    notifications.value = response.notifications
    unreadCount.value = response.unread_count
  } catch (err) {
    console.error('Failed to load notifications:', err)
  }
}

const loadUnreadCount = async () => {
  try {
    unreadCount.value = await getUnreadCount()
  } catch (err) {
    console.error('Failed to load unread count:', err)
    // Don't spam console with connection errors or rate limiting
    if (err.message && (err.message.includes('ERR_CONNECTION_REFUSED') || err.message.includes('Rate limit'))) {
      console.warn('Notification service unavailable or rate limited, skipping unread count check')
      return
    }
  }
}

const refreshNotifications = async () => {
  await loadNotifications()
}

const markAllAsRead = async () => {
  try {
    await markAllAsReadApi()
    await loadNotifications()
  } catch (err) {
    console.error('Failed to mark all as read:', err)
  }
}

const handleNotificationClick = async (notification: NotificationType) => {
  if (!notification.read) {
    try {
      await markAsRead(notification.id)
      notification.read = true
      notification.read_at = new Date().toISOString()
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }
  
  // Close dropdown and open notification view modal
  isOpen.value = false
  showNotificationModal(notification)
}

const deleteNotification = async (id: number) => {
  try {
    await deleteNotificationApi(id)
    notifications.value = notifications.value.filter(n => n.id !== id)
    // Update unread count if the deleted notification was unread
    const deletedNotification = notifications.value.find(n => n.id === id)
    if (deletedNotification && !deletedNotification.read) {
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  } catch (err) {
    console.error('Failed to delete notification:', err)
  }
}

const viewAllNotifications = () => {
  isOpen.value = false
  // Navigate to notifications page (would be implemented)
  console.log('Navigate to all notifications page')
}

const showNotificationModal = (notification: NotificationType) => {
  selectedNotification.value = notification
  showModal.value = true
}

const closeNotificationModal = () => {
  showModal.value = false
  selectedNotification.value = null
}

const handleNotificationDeleted = async () => {
  if (selectedNotification.value) {
    await deleteNotification(selectedNotification.value.id)
  }
  closeNotificationModal()
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

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'только что'
  if (diffMins < 60) return `${diffMins}м назад`
  if (diffHours < 24) return `${diffHours}ч назад`
  if (diffDays < 7) return `${diffDays}д назад`
  
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short'
  })
}

// Click outside to close
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

// WebSocket handlers
const handleRealTimeNotification = (notification: NotificationType) => {
  // Add new notification to the top of the list
  notifications.value.unshift(notification)
  
  // Update unread count
  if (!notification.read) {
    unreadCount.value++
  }
  
  // Show browser notification if permission granted
  if (window.Notification && window.Notification.permission === 'granted') {
    new window.Notification(notification.title, {
      body: notification.message,
      icon: '/favicon.ico',
      tag: `notification-${notification.id}`
    })
  }
}

// Watch for authentication changes
watch(
  () => authStore.isAuthenticated,
  async (isAuthenticated, wasAuthenticated) => {
    if (isAuthenticated && !wasAuthenticated) {
      // User just logged in - load notifications
      console.log('User logged in, loading notifications...')
      await loadUnreadCount()
      await loadNotifications()
    } else if (!isAuthenticated && wasAuthenticated) {
      // User logged out - clear notifications
      console.log('User logged out, clearing notifications...')
      notifications.value = []
      unreadCount.value = 0
    }
  },
  { immediate: true }
)

// Lifecycle
onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  
  // Set up WebSocket notification handler
  setOnNotification(handleRealTimeNotification)
  
  // Connect to WebSocket (temporarily disabled)
  // connectWebSocket()
  
  // Load initial unread count and notifications if user is authenticated
  if (authStore.isAuthenticated) {
    try {
      await loadUnreadCount()
      // Also load recent notifications for better UX
      await loadNotifications()
    } catch (err) {
      console.error('Failed to load notifications:', err)
    }
  }
  
  // Set up automatic refresh every 60 seconds (increased from 30 to reduce rate limiting)
  refreshInterval = setInterval(async () => {
    if (authStore.isAuthenticated) {
      try {
        await loadUnreadCount()
      } catch (err) {
        console.error('Failed to refresh unread count:', err)
        // If rate limited or connection refused, stop the interval to prevent spam
        if (err.message && (err.message.includes('ERR_CONNECTION_REFUSED') || err.message.includes('Rate limit'))) {
          console.warn('Stopping notification refresh due to rate limiting or connection issues')
          if (refreshInterval) {
            clearInterval(refreshInterval)
            refreshInterval = null
          }
        }
      }
    }
  }, 60000) // Increased from 30000 to 60000 (1 minute)
  
  // Request notification permission
  if (window.Notification && window.Notification.permission === 'default') {
    window.Notification.requestPermission()
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  disconnectWebSocket()
  
  // Clear refresh interval
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.notification-dropdown {
  position: relative;
  display: inline-block;
}

.notification-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 0.375rem;
  transition: background-color 0.2s ease;
}

.notification-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.notification-btn.has-unread {
  background-color: rgba(59, 130, 246, 0.1);
}

.notification-icon {
  width: 20px;
  height: 20px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.notification-btn:hover .notification-icon {
  opacity: 1;
}

.unread-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: #ef4444;
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 10px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.connection-indicator {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background: #f59e0b;
  border-radius: 50%;
  border: 2px solid white;
}

.dropdown-content {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.1);
  width: 400px;
  max-height: 500px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.dropdown-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.mark-all-btn,
.refresh-btn {
  padding: 0.25rem 0.5rem;
  border: none;
  background: none;
  color: var(--color-primary);
  font-size: 0.75rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.mark-all-btn:hover,
.refresh-btn:hover {
  background-color: rgba(59, 130, 246, 0.1);
}

.mark-all-btn:disabled,
.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-btn {
  padding: 0.25rem;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notifications-list {
  flex: 1;
  overflow-y: auto;
  max-height: 350px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--color-text-soft);
  gap: 0.75rem;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--color-border);
  border-top: 2px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.notifications {
  padding: 0.5rem 0;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-left: 3px solid transparent;
}

.notification-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.notification-item.unread {
  background-color: rgba(59, 130, 246, 0.05);
  border-left-color: var(--color-primary);
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.type-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.type-info { background: #3b82f6; }
.type-success { background: #10b981; }
.type-warning { background: #f59e0b; }
.type-error { background: #ef4444; }
.type-booking_update { background: #8b5cf6; }
.type-system { background: #6b7280; }
.type-admin_message { background: #10b981; }

.notification-title {
  font-weight: 500;
  color: var(--color-text);
  font-size: 0.875rem;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notification-time {
  font-size: 0.75rem;
  color: var(--color-text-soft);
  flex-shrink: 0;
}

.notification-message {
  font-size: 0.8125rem;
  color: var(--color-text-soft);
  line-height: 1.4;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}


.notification-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.notification-item:hover .notification-actions {
  opacity: 1;
}

.delete-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  color: var(--color-text-soft);
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background: #ffebee;
  color: #d32f2f;
}

.dropdown-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  background: var(--color-background-soft);
}

.view-all-btn {
  width: 100%;
  padding: 0.75rem;
  border: none;
  background: var(--color-primary);
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.view-all-btn:hover {
  background: var(--color-primary-hover);
}

@media (max-width: 768px) {
  .dropdown-content {
    width: 320px;
    right: -50px;
  }
  
  .notification-item {
    padding: 0.75rem 1rem;
  }
  
  .dropdown-header {
    padding: 0.75rem 1rem;
  }
  
  .dropdown-footer {
    padding: 0.75rem 1rem;
  }
}

@media (max-width: 480px) {
  .dropdown-content {
    width: 280px;
    right: -80px;
  }
}
</style>
