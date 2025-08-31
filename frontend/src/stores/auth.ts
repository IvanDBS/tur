import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AuthApi } from '../utils/authApi'
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

    try {
      const response = await AuthApi.login(credentials)
      user.value = response.user

      // Сохраняем токен в localStorage
      if (response.tokens) {
        localStorage.setItem('accessToken', response.tokens.accessToken)
        localStorage.setItem('refreshToken', response.tokens.refreshToken)
      }

      return response
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Ошибка входа в систему'
      error.value = errorMessage
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

      // Сохраняем токен в localStorage
      if (response.tokens) {
        localStorage.setItem('accessToken', response.tokens.accessToken)
        localStorage.setItem('refreshToken', response.tokens.refreshToken)
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
      localStorage.removeItem('refreshToken')
    }
  }

  const getCurrentUser = async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) return null

    try {
      const response = await AuthApi.getCurrentUser()
      user.value = response.user
      return response.user
    } catch {
      // Если токен недействителен, очищаем состояние
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
  }
})
