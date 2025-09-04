import { ref, reactive } from 'vue'

export interface Notification {
  id: string
  type: 'error' | 'success' | 'warning'
  title: string
  message?: string
  duration?: number
}

const notifications = ref<Notification[]>([])

export const useNotifications = () => {
  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification: Notification = {
      id,
      duration: 5000,
      ...notification
    }
    
    notifications.value.push(newNotification)
    
    // Auto remove after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }
    
    return id
  }

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const showError = (title: string, message?: string) => {
    return addNotification({ type: 'error', title, message })
  }

  const showSuccess = (title: string, message?: string) => {
    return addNotification({ type: 'success', title, message })
  }

  const showWarning = (title: string, message?: string) => {
    return addNotification({ type: 'warning', title, message })
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    showError,
    showSuccess,
    showWarning
  }
}
