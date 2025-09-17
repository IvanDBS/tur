import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AuthApi } from '../utils/authApi'
import { logger } from '../utils/logger'
import type { User, LoginCredentials, RegisterCredentials } from '../types/auth'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const currentUser = computed(() => user.value)

  // Actions
  const login = async (credentials: LoginCredentials) => {
    isLoading.value = true
    error.value = null

    // Сначала очищаем старые токены, если они есть
    localStorage.removeItem('accessToken')
    user.value = null

    try {
      const response = await AuthApi.login(credentials)
      
      // Проверяем, не заблокирован ли пользователь
      if (response.user.banned) {
        error.value = 'Ваш аккаунт заблокирован. Обратитесь в службу поддержки.'
        throw new Error('Account is banned')
      }
      
      user.value = response.user

      // Сохраняем только access token в localStorage
      // Refresh token теперь в HttpOnly cookie
      if (response.tokens) {
        localStorage.setItem('accessToken', response.tokens.accessToken)
      }

      return response
    } catch (err: unknown) {
      // Проверяем, является ли ошибка связанной с блокировкой
      if (err instanceof Error) {
        // Проверяем различные варианты ошибки блокировки
        if (err.message.includes('403') || 
            err.message.includes('Forbidden') || 
            err.message.includes('suspended') ||
            err.message.includes('blocked')) {
          error.value = 'Ваш аккаунт заблокирован. Обратитесь в службу поддержки.'
        } else {
          error.value = err.message
        }
      } else {
        error.value = 'Ошибка входа в систему'
      }
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const register = async (credentials: RegisterCredentials) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await AuthApi.register(credentials)
      user.value = response.user

      // Сохраняем только access token в localStorage
      // Refresh token теперь в HttpOnly cookie
      if (response.tokens) {
        localStorage.setItem('accessToken', response.tokens.accessToken)
      }

      return response
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Ошибка регистрации'
      error.value = errorMessage
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      await AuthApi.logout()
    } catch {
      // Logout error handled silently
    } finally {
      // Очищаем состояние
      user.value = null
      localStorage.removeItem('accessToken')
      
      // Очищаем кеш API
      const { apiClient } = await import('../utils/api')
      apiClient.clearCache()
    }
  }

  const getCurrentUser = async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) return null

    try {
      const response = await AuthApi.getCurrentUser()
      
      // Проверяем, не заблокирован ли пользователь
      if (response.user.banned) {
        // Если пользователь заблокирован, выходим из системы
        logger.warn('User is banned, logging out...')
        await logout()
        return null
      }
      
      user.value = response.user
      return response.user
    } catch (err: unknown) {
      // Если токен недействителен или пользователь заблокирован, очищаем состояние
      logger.error('getCurrentUser error:', err)
      user.value = null
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      return null
    }
  }

  const updateProfile = async (userData: Partial<User>) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await AuthApi.updateProfile(userData)
      user.value = response.user
      return response
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Ошибка обновления профиля'
      error.value = errorMessage
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const changePassword = async (data: {
    currentPassword: string
    newPassword: string
  }) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await AuthApi.changePassword(data)
      return response
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Ошибка смены пароля'
      error.value = errorMessage
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const initializeAuth = async () => {
    const token = localStorage.getItem('accessToken')
    if (token && !user.value) {
      await getCurrentUser()
    }
  }

  return {
    // State
    user,
    isLoading,
    error,

    // Getters
    isAuthenticated,
    currentUser,

    // Actions
    login,
    register,
    logout,
    getCurrentUser,
    updateProfile,
    changePassword,
    clearError,
    initializeAuth,
  }
})
