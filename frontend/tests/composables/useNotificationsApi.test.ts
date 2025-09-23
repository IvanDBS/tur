import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useNotificationsApi, useAdminNotificationsApi } from '@/composables/useNotificationsApi'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock fetch
global.fetch = vi.fn()

describe('useNotificationsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue('mock-token')
  })

  describe('getUserNotifications', () => {
    it('fetches user notifications successfully', async () => {
      const mockResponse = {
        success: true,
        notifications: [
          {
            id: 1,
            title: 'Test Notification',
            message: 'Test message',
            type: 'info',
            delivery_channels: ['in_app'],
            read: false,
            read_at: null,
            created_at: '2023-01-01T00:00:00Z',
            metadata: {}
          }
        ],
        pagination: {
          current_page: 1,
          total_pages: 1,
          total_count: 1,
          per_page: 20
        },
        unread_count: 1
      }

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const { getUserNotifications } = useNotificationsApi()
      const result = await getUserNotifications()

      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/notifications'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token'
          })
        })
      )
    })

    it('handles API errors', async () => {
      ;(fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      const { getUserNotifications } = useNotificationsApi()
      
      await expect(getUserNotifications()).rejects.toThrow()
    })

    it('handles missing token', async () => {
      localStorageMock.getItem.mockReturnValue(null)

      const { getUserNotifications } = useNotificationsApi()
      
      await expect(getUserNotifications()).rejects.toThrow('No authentication token')
    })
  })

  describe('markAsRead', () => {
    it('marks notification as read', async () => {
      const mockResponse = {
        success: true,
        message: 'Notification marked as read'
      }

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const { markAsRead } = useNotificationsApi()
      const result = await markAsRead(1)

      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/notifications/1/mark_read'),
        expect.objectContaining({
          method: 'PATCH'
        })
      )
    })
  })

  describe('markAllAsRead', () => {
    it('marks all notifications as read', async () => {
      const mockResponse = {
        success: true,
        message: 'All notifications marked as read'
      }

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const { markAllAsRead } = useNotificationsApi()
      const result = await markAllAsRead()

      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/notifications/mark_all_read'),
        expect.objectContaining({
          method: 'PATCH'
        })
      )
    })
  })

  describe('deleteNotification', () => {
    it('deletes notification', async () => {
      const mockResponse = {
        success: true,
        message: 'Notification deleted'
      }

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const { deleteNotification } = useNotificationsApi()
      const result = await deleteNotification(1)

      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/notifications/1'),
        expect.objectContaining({
          method: 'DELETE'
        })
      )
    })
  })
})

describe('useAdminNotificationsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue('mock-token')
  })

  describe('getAdminNotifications', () => {
    it('fetches admin notifications with filters', async () => {
      const mockResponse = {
        success: true,
        notifications: [],
        pagination: {
          current_page: 1,
          total_pages: 1,
          total_count: 0,
          per_page: 50
        },
        stats: {
          total: 0,
          unread: 0,
          delivered: 0,
          pending_delivery: 0
        }
      }

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const { getAdminNotifications } = useAdminNotificationsApi()
      const result = await getAdminNotifications({ type: 'info', page: 1 })

      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/admin/notifications?type=info&page=1'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token'
          })
        })
      )
    })
  })

  describe('createNotification', () => {
    it('creates notification for specific user', async () => {
      const mockResponse = {
        success: true,
        message: 'Notification created successfully'
      }

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const { createNotification } = useAdminNotificationsApi()
      const notificationData = {
        title: 'Test',
        message: 'Test message',
        notification_type: 'info' as const,
        delivery_channels: ['in_app'] as const,
        metadata: {}
      }

      const result = await createNotification(notificationData, 1)

      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/admin/notifications'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            notification: {
              ...notificationData,
              user_id: 1
            }
          })
        })
      )
    })
  })

  describe('bulkCreateNotifications', () => {
    it('creates bulk notifications', async () => {
      const mockResponse = {
        success: true,
        message: 'Bulk notification sent: 1 successful, 0 failed',
        results: [
          {
            user_id: 1,
            success: true,
            notification_id: 123
          }
        ],
        stats: {
          total: 1,
          successful: 1,
          failed: 0
        }
      }

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const { bulkCreateNotifications } = useAdminNotificationsApi()
      const bulkData = {
        notification: {
          title: 'Bulk Test',
          message: 'Bulk message',
          notification_type: 'info' as const,
          delivery_channels: ['in_app'] as const,
          metadata: {}
        },
        user_ids: [1],
        delivery_channels: ['in_app'] as const
      }

      const result = await bulkCreateNotifications(bulkData)

      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/admin/notifications/bulk'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(bulkData)
        })
      )
    })
  })
})
