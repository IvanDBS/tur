import { ref } from 'vue'
import { apiClient } from '../utils/api'
import { logger } from '../utils/logger'
import type { AdminBookingsResponse, AdminStatsResponse, AdminUsersResponse, AdminUserUpdateRequest } from '../types/admin'

export const useAdminApi = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const clearError = () => {
    error.value = null
  }

  const setError = (message: string) => {
    error.value = message
    logger.error('Admin API Error:', message)
  }

  // Get all bookings with filters and pagination
  const getBookings = async (params: {
    page?: number
    per_page?: number
    status?: string
    search?: string
    sort_field?: string
    sort_direction?: 'asc' | 'desc'
  } = {}) => {
    try {
      loading.value = true
      clearError()

      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.per_page) queryParams.append('per_page', params.per_page.toString())
      if (params.status) queryParams.append('status', params.status)
      if (params.search) queryParams.append('search', params.search)
      if (params.sort_field) queryParams.append('sort_field', params.sort_field)
      if (params.sort_direction) queryParams.append('sort_direction', params.sort_direction)

      const url = `/admin/bookings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      
      logger.apiCall('GET', url)
      const response = await apiClient.get<AdminBookingsResponse>(url)
      
      logger.info('Bookings loaded successfully:', response)
      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load bookings'
      setError(message)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get booking details
  const getBookingDetails = async (bookingId: number) => {
    try {
      loading.value = true
      clearError()

      logger.apiCall('GET', `/admin/bookings/${bookingId}`)
      const response = await apiClient.get(`/admin/bookings/${bookingId}`)
      
      logger.info('Booking details loaded successfully:', response)
      return response as any
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load booking details'
      setError(message)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get OBS booking details with pricing information
  const getObsBookingDetails = async (bookingHash: string) => {
    try {
      loading.value = true
      clearError()

      logger.apiCall('GET', `/admin/bookings/${bookingHash}/obs-details`)
      const response = await apiClient.get(`/admin/bookings/${bookingHash}/obs-details`)
      
      logger.info('OBS booking details loaded successfully:', response)
      return response as any
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load OBS booking details'
      setError(message)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update booking status
  const updateBookingStatus = async (bookingId: number, status: string) => {
    try {
      loading.value = true
      clearError()

      const requestData = { status }

      logger.apiCall('PATCH', `/admin/bookings/${bookingId}/status`)
      const response = await apiClient.patch(`/admin/bookings/${bookingId}/status`, requestData)
      
      logger.info('Booking status updated successfully:', response)
      return response as any
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update booking status'
      setError(message)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get admin statistics
  const getStats = async () => {
    try {
      loading.value = true
      clearError()

      logger.apiCall('GET', '/admin/stats')
      const response = await apiClient.get<AdminStatsResponse>('/admin/stats')
      
      logger.info('Stats loaded successfully:', response)
      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load stats'
      setError(message)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get all users with filters and pagination
  const getUsers = async (params: {
    page?: number
    per_page?: number
    role?: string
    status?: string
    search?: string
    sort_field?: string
    sort_direction?: 'asc' | 'desc'
  } = {}) => {
    try {
      loading.value = true
      clearError()

      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.per_page) queryParams.append('per_page', params.per_page.toString())
      if (params.role) queryParams.append('role', params.role)
      if (params.status) queryParams.append('status', params.status)
      if (params.search) queryParams.append('search', params.search)
      if (params.sort_field) queryParams.append('sort_field', params.sort_field)
      if (params.sort_direction) queryParams.append('sort_direction', params.sort_direction)

      const url = `/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      
      logger.apiCall('GET', url)
      const response = await apiClient.get<AdminUsersResponse>(url)
      
      logger.info('Users loaded successfully:', response)
      return response.data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load users'
      setError(message)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update user status (admin/banned)
  const updateUserStatus = async (userId: number, updates: AdminUserUpdateRequest) => {
    try {
      loading.value = true
      clearError()

      logger.apiCall('PATCH', `/admin/users/${userId}`)
      const response = await apiClient.patch(`/admin/users/${userId}`, updates)
      
      logger.info('User status updated successfully:', response)
      return response.data.user
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update user status'
      setError(message)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Sync all bookings
  const syncAllBookings = async () => {
    try {
      loading.value = true
      clearError()

      logger.apiCall('POST', '/admin/bookings/sync_all')
      const response = await apiClient.post('/admin/bookings/sync_all')
      
      logger.info('All bookings sync initiated successfully:', response)
      return response.data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sync all bookings'
      setError(message)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Sync single booking
  const syncBooking = async (bookingId: number) => {
    try {
      loading.value = true
      clearError()

      logger.apiCall('POST', `/admin/bookings/${bookingId}/sync`)
      const response = await apiClient.post(`/admin/bookings/${bookingId}/sync`)
      
      logger.info('Booking sync initiated successfully:', response)
      return response.data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sync booking'
      setError(message)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    clearError,
    getBookings,
    getBookingDetails,
    getObsBookingDetails,
    updateBookingStatus,
    getStats,
    getUsers,
    updateUserStatus,
    syncAllBookings,
    syncBooking
  }
}
