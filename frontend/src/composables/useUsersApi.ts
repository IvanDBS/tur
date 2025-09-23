import { ref, readonly } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { apiClient } from '@/utils/api'

export interface User {
  id: number
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  admin: boolean
  banned: boolean
  created_at: string
  last_sign_in_at: string | null
  sign_in_count: number
  bookings_count: number
  search_queries_count: number
}

export interface UsersResponse {
  success: boolean
  message: string
  data: {
    users: User[]
    pagination: {
      current_page: number
      total_pages: number
      total_count: number
      per_page: number
    }
  }
}

export interface UserFilters {
  role?: 'admin' | 'user'
  status?: 'banned' | 'active'
  search?: string
  sort_field?: string
  sort_direction?: 'asc' | 'desc'
  page?: number
  per_page?: number
}

export function useUsersApi() {
  const authStore = useAuthStore()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getUsers = async (filters: UserFilters = {}): Promise<UsersResponse> => {
    loading.value = true
    error.value = null

    try {
      const params = new URLSearchParams()
      
      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString())
        }
      })

      const endpoint = `/admin/users?${params.toString()}`
      const data: UsersResponse = await apiClient.get<UsersResponse>(endpoint)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users'
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  const getUserById = async (id: number): Promise<User> => {
    loading.value = true
    error.value = null

    try {
      const endpoint = `/admin/users/${id}`
      const data = await apiClient.get<{ data: { user: User } }>(endpoint)
      return data.data.user
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user'
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  const searchUsers = async (query: string, limit: number = 20): Promise<User[]> => {
    try {
      const response = await getUsers({
        search: query,
        per_page: limit
      })
      return response.data.users
    } catch (err) {
      console.error('Failed to search users:', err)
      return []
    }
  }

  const getFilteredUsers = async (filters: {
    registration_date?: string
    has_bookings?: boolean
    is_active?: boolean
  }): Promise<User[]> => {
    try {
      const userFilters: UserFilters = {
        per_page: 100 // Get more users for filtering
      }

      // Map frontend filters to API filters
      if (filters.registration_date) {
        // This would need backend support for date filtering
        // For now, we'll use search as a workaround
        userFilters.search = filters.registration_date
      }

      if (filters.has_bookings !== undefined) {
        // This would need backend support for booking count filtering
        // For now, we'll get all users and filter on frontend
      }

      if (filters.is_active !== undefined) {
        userFilters.status = filters.is_active ? 'active' : 'banned'
      }

      const response = await getUsers(userFilters)
      let users = response.data.users

      // Frontend filtering for features not yet supported by backend
      if (filters.has_bookings !== undefined) {
        users = users.filter(user => 
          filters.has_bookings ? user.bookings_count > 0 : user.bookings_count === 0
        )
      }

      return users
    } catch (err) {
      console.error('Failed to get filtered users:', err)
      return []
    }
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    getUsers,
    getUserById,
    searchUsers,
    getFilteredUsers
  }
}
