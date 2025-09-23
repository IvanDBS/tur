import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useWebSocket } from '@/composables/useWebSocket'

// Mock ActionCable
const mockConsumer = {
  subscriptions: {
    create: vi.fn()
  },
  disconnect: vi.fn()
}

const mockSubscription = {
  unsubscribe: vi.fn(),
  perform: vi.fn()
}

vi.mock('@rails/actioncable', () => ({
  createConsumer: vi.fn(() => mockConsumer)
}))

// Mock auth store
const mockAuthStore = {
  accessToken: 'mock-token',
  currentUser: { id: 1, email: 'test@example.com' }
}

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => mockAuthStore
}))

describe('useWebSocket', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockConsumer.subscriptions.create.mockReturnValue(mockSubscription)
  })

  describe('connect', () => {
    it('creates ActionCable consumer and subscribes to notifications', () => {
      const { connect } = useWebSocket()
      
      connect()
      
      expect(mockConsumer.subscriptions.create).toHaveBeenCalledWith(
        { channel: 'NotificationChannel' },
        expect.objectContaining({
          connected: expect.any(Function),
          disconnected: expect.any(Function),
          received: expect.any(Function),
          rejected: expect.any(Function)
        })
      )
    })

    it('does not connect without access token', () => {
      mockAuthStore.accessToken = null
      
      const { connect } = useWebSocket()
      
      connect()
      
      expect(mockConsumer.subscriptions.create).not.toHaveBeenCalled()
    })
  })

  describe('disconnect', () => {
    it('unsubscribes and disconnects consumer', () => {
      const { connect, disconnect } = useWebSocket()
      
      connect()
      disconnect()
      
      expect(mockSubscription.unsubscribe).toHaveBeenCalled()
      expect(mockConsumer.disconnect).toHaveBeenCalled()
    })
  })

  describe('event handlers', () => {
    it('handles connection events', () => {
      const { connect, setOnConnect } = useWebSocket()
      const onConnectCallback = vi.fn()
      
      setOnConnect(onConnectCallback)
      connect()
      
      // Simulate connection
      const subscriptionCall = mockConsumer.subscriptions.create.mock.calls[0]
      const handlers = subscriptionCall[1]
      
      handlers.connected()
      
      expect(onConnectCallback).toHaveBeenCalled()
    })

    it('handles disconnection events', () => {
      const { connect, setOnDisconnect } = useWebSocket()
      const onDisconnectCallback = vi.fn()
      
      setOnDisconnect(onDisconnectCallback)
      connect()
      
      // Simulate disconnection
      const subscriptionCall = mockConsumer.subscriptions.create.mock.calls[0]
      const handlers = subscriptionCall[1]
      
      handlers.disconnected()
      
      expect(onDisconnectCallback).toHaveBeenCalled()
    })

    it('handles received notifications', () => {
      const { connect, setOnNotification } = useWebSocket()
      const onNotificationCallback = vi.fn()
      
      setOnNotification(onNotificationCallback)
      connect()
      
      // Simulate notification received
      const subscriptionCall = mockConsumer.subscriptions.create.mock.calls[0]
      const handlers = subscriptionCall[1]
      
      const notificationData = {
        type: 'notification',
        data: {
          id: 1,
          title: 'Test',
          message: 'Test message',
          type: 'info',
          created_at: '2023-01-01T00:00:00Z'
        }
      }
      
      handlers.received(notificationData)
      
      expect(onNotificationCallback).toHaveBeenCalledWith(notificationData.data)
    })

    it('handles ping messages', () => {
      const { connect } = useWebSocket()
      
      connect()
      
      // Simulate ping received
      const subscriptionCall = mockConsumer.subscriptions.create.mock.calls[0]
      const handlers = subscriptionCall[1]
      
      handlers.received({ type: 'ping' })
      
      expect(mockSubscription.perform).toHaveBeenCalledWith('ping')
    })

    it('handles rejection events', () => {
      const { connect, setOnError } = useWebSocket()
      const onErrorCallback = vi.fn()
      
      setOnError(onErrorCallback)
      connect()
      
      // Simulate rejection
      const subscriptionCall = mockConsumer.subscriptions.create.mock.calls[0]
      const handlers = subscriptionCall[1]
      
      handlers.rejected()
      
      expect(onErrorCallback).toHaveBeenCalled()
    })
  })

  describe('sendPing', () => {
    it('sends ping when connected', () => {
      const { connect, sendPing } = useWebSocket()
      
      connect()
      sendPing()
      
      expect(mockSubscription.perform).toHaveBeenCalledWith('ping')
    })

    it('does not send ping when disconnected', () => {
      const { sendPing } = useWebSocket()
      
      sendPing()
      
      expect(mockSubscription.perform).not.toHaveBeenCalled()
    })
  })

  describe('reconnection', () => {
    it('attempts to reconnect on disconnection', async () => {
      vi.useFakeTimers()
      
      const { connect } = useWebSocket()
      connect()
      
      // Simulate disconnection
      const subscriptionCall = mockConsumer.subscriptions.create.mock.calls[0]
      const handlers = subscriptionCall[1]
      
      handlers.disconnected()
      
      // Fast-forward time to trigger reconnection
      vi.advanceTimersByTime(1000)
      
      // Should attempt to reconnect
      expect(mockConsumer.subscriptions.create).toHaveBeenCalledTimes(2)
      
      vi.useRealTimers()
    })
  })
})
