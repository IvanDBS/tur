import { apiClient } from '@/utils/api'

export function useAdminApi() {
  // IP Management API
  const getBlockedIps = async () => {
    return apiClient.get('/admin/ip_management/blocked')
  }

  const getWhitelistedIps = async () => {
    return apiClient.get('/admin/ip_management/whitelisted')
  }

  const blockIp = async (data: { ip: string; reason?: string; duration?: number }) => {
    return apiClient.post('/admin/ip_management/block', data)
  }

  const unblockIp = async (ip: string) => {
    return apiClient.delete(`/admin/ip_management/unblock/${ip}`)
  }

  const whitelistIp = async (data: { ip: string; reason?: string }) => {
    return apiClient.post('/admin/ip_management/whitelist', data)
  }

  const removeWhitelist = async (ip: string) => {
    return apiClient.delete(`/admin/ip_management/remove-whitelist/${ip}`)
  }

  const getSecurityStatistics = async () => {
    return apiClient.get('/admin/ip_management/statistics')
  }

  const cleanupExpired = async () => {
    return apiClient.post('/admin/ip_management/cleanup')
  }

  // Existing admin API methods
  const getAdminStats = async () => {
    return apiClient.get('/admin/stats')
  }

  const getAdminBookings = async (params?: any) => {
    return apiClient.get('/admin/bookings', params)
  }

  const getAdminBookingDetails = async (id: string) => {
    return apiClient.get(`/admin/bookings/${id}`)
  }

  const updateBookingStatus = async (id: string, status: string) => {
    return apiClient.patch(`/admin/bookings/${id}/status`, { status })
  }

  const syncBookingStatus = async (id: string) => {
    return apiClient.post(`/admin/bookings/${id}/sync`)
  }

  const syncAllBookings = async () => {
    return apiClient.post('/admin/bookings/sync_all')
  }

  const getObsBookingDetails = async (id: string, orderId?: string, orderNumber?: string, operatorId?: string) => {
    const params = new URLSearchParams()
    if (orderId) params.append('order_id', orderId)
    if (orderNumber) params.append('order_number', orderNumber)
    if (operatorId) params.append('operator_id', operatorId)
    
    const endpoint = params.toString() 
      ? `/admin/bookings/${id}/obs-details?${params.toString()}`
      : `/admin/bookings/${id}/obs-details`
    return apiClient.get(endpoint)
  }

  const getAdminUsers = async (params?: any) => {
    return apiClient.get('/admin/users', params)
  }

  const getAdminUser = async (id: string) => {
    return apiClient.get(`/admin/users/${id}`)
  }

  const updateAdminUser = async (id: string, data: any) => {
    return apiClient.put(`/admin/users/${id}`, data)
  }

  const deleteAdminUser = async (id: string) => {
    return apiClient.delete(`/admin/users/${id}`)
  }

  return {
    // IP Management
    getBlockedIps,
    getWhitelistedIps,
    blockIp,
    unblockIp,
    whitelistIp,
    removeWhitelist,
    getSecurityStatistics,
    cleanupExpired,
    
    // Existing admin methods
    getAdminStats,
    getAdminBookings,
    getAdminBookingDetails,
    updateBookingStatus,
    syncBookingStatus,
    syncAllBookings,
    getObsBookingDetails,
    getAdminUsers,
    getAdminUser,
    updateAdminUser,
    deleteAdminUser
  }
}