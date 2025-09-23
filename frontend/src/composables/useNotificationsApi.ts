import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { 
  Notification, 
  AdminNotification, 
  NotificationFormData, 
  BulkNotificationData,
  NotificationFilters,
  NotificationResponse,
  AdminNotificationResponse,
  BulkNotificationResponse,
  NotificationStats,
  DeliveryStats
} from '@/types/notifications'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

export function useNotificationsApi() {
  const authStore = useAuthStore()
  const loading = ref(false)
  const error = ref<string | null>(null)

  // User notifications API
  const getUserNotifications = async (filters: NotificationFilters = {}) => {
    loading.value = true
    error.value = null

    try {
      const params = new URLSearchParams()
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.per_page) params.append('per_page', filters.per_page.toString())

      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('No authentication token')
      }

      const response = await fetch(`${API_BASE}/notifications?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: NotificationResponse = await response.json()
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getUnreadCount = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('No authentication token')
      }

      const response = await fetch(`${API_BASE}/notifications/unread_count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.unread_count
    } catch (err) {
      console.error('Failed to get unread count:', err)
      return 0
    }
  }

  const markAsRead = async (notificationId: number) => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('No authentication token')
      }

      const response = await fetch(`${API_BASE}/notifications/${notificationId}/mark_read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      throw err
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('No authentication token')
      }

      const response = await fetch(`${API_BASE}/notifications/mark_all_read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      throw err
    }
  }

  const deleteNotification = async (notificationId: number) => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('No authentication token')
      }

      const response = await fetch(`${API_BASE}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      throw err
    }
  }

  return {
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  }
}

export function useAdminNotificationsApi() {
  const authStore = useAuthStore()
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Admin notifications API
  const getAdminNotifications = async (filters: NotificationFilters = {}) => {
    loading.value = true
    error.value = null

    try {
      const params = new URLSearchParams()
      if (filters.type) params.append('type', filters.type)
      if (filters.event_type) params.append('event_type', filters.event_type)
      if (filters.user_id) params.append('user_id', filters.user_id.toString())
      if (filters.delivered !== undefined) params.append('delivered', filters.delivered.toString())
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.per_page) params.append('per_page', filters.per_page.toString())

      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('No authentication token')
      }

      const response = await fetch(`${API_BASE}/admin/notifications?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: AdminNotificationResponse = await response.json()
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createNotification = async (notificationData: NotificationFormData, userId: number) => {
    loading.value = true
    error.value = null

    try {
      const payload = {
        notification: {
          ...notificationData,
          user_id: userId
        }
      }

      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('No authentication token')
      }

      const response = await fetch(`${API_BASE}/admin/notifications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      throw err
    } finally {
      loading.value = false
    }
  }

  const bulkCreateNotifications = async (bulkData: BulkNotificationData) => {
    loading.value = true
    error.value = null

    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('No authentication token')
      }

      const response = await fetch(`${API_BASE}/admin/notifications/bulk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bulkData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getNotificationStats = async (timeframe?: number) => {
    try {
      const params = new URLSearchParams()
      if (timeframe) params.append('timeframe', timeframe.toString())

      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('No authentication token')
      }

      const response = await fetch(`${API_BASE}/admin/notifications/stats?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      throw err
    }
  }

  const cleanupNotifications = async (days: number = 30) => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('No authentication token')
      }

      const response = await fetch(`${API_BASE}/admin/notifications/cleanup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ days })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      throw err
    }
  }

  return {
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    getAdminNotifications,
    createNotification,
    bulkCreateNotifications,
    getNotificationStats,
    cleanupNotifications
  }
}
