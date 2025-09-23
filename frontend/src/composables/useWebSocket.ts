import { ref, readonly, onUnmounted } from 'vue'
import { createConsumer, Consumer } from '@rails/actioncable'
import { useAuthStore } from '@/stores/auth'
import type { Notification as NotificationType } from '@/types/notifications'

interface WebSocketMessage {
  type: 'notification' | 'ping' | 'pong'
  data?: NotificationType | Record<string, unknown>
}

export function useWebSocket() {
  const authStore = useAuthStore()
  const consumer = ref<Consumer | null>(null)
  const subscription = ref<any>(null)
  const isConnected = ref(false)
  const reconnectAttempts = ref(0)
  const maxReconnectAttempts = 5
  const reconnectDelay = ref(1000) // Start with 1 second

  // Event handlers
  const onNotification = ref<((notification: NotificationType) => void) | null>(null)
  const onConnect = ref<(() => void) | null>(null)
  const onDisconnect = ref<(() => void) | null>(null)
  const onError = ref<((error: Event) => void) | null>(null)

  const connect = () => {
    if (!authStore.accessToken) {
      console.warn('No access token available for WebSocket connection')
      return
    }

    try {
      // Create ActionCable consumer with authentication
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000/cable'
      
      consumer.value = createConsumer(wsUrl)
      
      // Subscribe to notifications channel
      subscription.value = consumer.value.subscriptions.create(
        { channel: 'NotificationChannel' },
        {
          connected: handleConnected,
          disconnected: handleDisconnected,
          received: handleReceived,
          rejected: handleRejected
        }
      )
      
    } catch (error) {
      console.error('Failed to create ActionCable connection:', error)
      handleError(error as Event)
    }
  }

  const disconnect = () => {
    if (subscription.value) {
      subscription.value.unsubscribe()
      subscription.value = null
    }
    if (consumer.value) {
      consumer.value.disconnect()
      consumer.value = null
    }
    isConnected.value = false
  }

  const handleConnected = () => {
    console.log('ActionCable connected')
    isConnected.value = true
    reconnectAttempts.value = 0
    reconnectDelay.value = 1000
    
    if (onConnect.value) {
      onConnect.value()
    }
  }

  const handleDisconnected = () => {
    console.log('ActionCable disconnected')
    isConnected.value = false
    
    if (onDisconnect.value) {
      onDisconnect.value()
    }
    
    // Attempt to reconnect
    if (reconnectAttempts.value < maxReconnectAttempts) {
      scheduleReconnect()
    }
  }

  const handleReceived = (data: any) => {
    try {
      if (data.type === 'notification' && data.data) {
        if (onNotification.value) {
          onNotification.value(data.data as NotificationType)
        }
      } else if (data.type === 'ping') {
        // Respond to ping with pong
        subscription.value?.perform('ping')
      }
    } catch (error) {
      console.error('Failed to handle received message:', error)
    }
  }

  const handleRejected = () => {
    console.error('ActionCable subscription rejected')
    isConnected.value = false
    
    if (onError.value) {
      onError.value(new Event('subscription_rejected'))
    }
  }

  const handleError = (error: Event) => {
    console.error('ActionCable error:', error)
    
    if (onError.value) {
      onError.value(error)
    }
  }

  const scheduleReconnect = () => {
    reconnectAttempts.value++
    const delay = Math.min(reconnectDelay.value * Math.pow(2, reconnectAttempts.value - 1), 30000)
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.value}/${maxReconnectAttempts})`)
    
    setTimeout(() => {
      if (reconnectAttempts.value <= maxReconnectAttempts) {
        connect()
      }
    }, delay)
  }

  const sendPing = () => {
    if (subscription.value && isConnected.value) {
      subscription.value.perform('ping')
    } else {
      console.warn('ActionCable not connected, cannot send ping')
    }
  }

  // Public methods
  const setOnNotification = (callback: (notification: NotificationType) => void) => {
    onNotification.value = callback
  }

  const setOnConnect = (callback: () => void) => {
    onConnect.value = callback
  }

  const setOnDisconnect = (callback: () => void) => {
    onDisconnect.value = callback
  }

  const setOnError = (callback: (error: Event) => void) => {
    onError.value = callback
  }

  // Cleanup on unmount
  onUnmounted(() => {
    disconnect()
  })

  return {
    isConnected: readonly(isConnected),
    connect,
    disconnect,
    sendPing,
    setOnNotification,
    setOnConnect,
    setOnDisconnect,
    setOnError
  }
}

// Global WebSocket instance for notifications
let globalWebSocket: ReturnType<typeof useWebSocket> | null = null

export function useGlobalWebSocket() {
  if (!globalWebSocket) {
    globalWebSocket = useWebSocket()
  }
  return globalWebSocket
}
