import { logger } from './logger'

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

class ApiClient {
  private baseURL: string
  private cache = new Map<string, { data: unknown; timestamp: number }>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 минут
  private isRefreshing = false
  private refreshPromise: Promise<string> | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit & { skipAuth?: boolean } = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Важно для cookies
      ...options,
    }

    // Добавляем токен авторизации если есть и не пропущена авторизация
    let token = localStorage.getItem('accessToken')
    if (!options.skipAuth) {
      if (token && this.isTokenExpired(token)) {
        // Токен истек, пытаемся обновить
        try {
          token = await this.refreshTokenIfNeeded()
        } catch (error) {
          // Refresh failed, redirect to login
          this.redirectToLogin()
          throw new Error('Session expired')
        }
      }

      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        }
      }
    }

    try {
      const response = await fetch(url, config)

      // Если получили 401, пытаемся обновить токен (только если авторизация не пропущена)
      if (response.status === 401 && token && !options.skipAuth) {
        try {
          const newToken = await this.refreshTokenIfNeeded()
          
          // Повторяем запрос с новым токеном
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${newToken}`,
          }
          
          const retryResponse = await fetch(url, config)
          if (!retryResponse.ok) {
            const errorData = await retryResponse.json().catch(() => ({}))
            logger.error('API Error after retry:', errorData)
            throw new Error(
              errorData.message || `HTTP error! status: ${retryResponse.status}`
            )
          }
          
          const data = await retryResponse.json()
          return data
        } catch (refreshError) {
          // Refresh failed, redirect to login
          this.redirectToLogin()
          throw new Error('Session expired')
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        logger.error('API Error:', errorData)
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const data = await response.json()
      return data
    } catch (error) {
      logger.error('API Request failed:', error)
      throw error
    }
  }

  // GET запрос с кешированием
  async get<T>(endpoint: string, useCache = true, skipAuth = false): Promise<T> {
    const cacheKey = `GET:${endpoint}`
    
    // Проверяем кеш для GET запросов
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!
      const isExpired = Date.now() - cached.timestamp > this.CACHE_TTL
      
      if (!isExpired) {
        // Cache hit
        return cached.data as T
      } else {
        this.cache.delete(cacheKey)
      }
    }
    
    const result = await this.request<T>(endpoint, { method: 'GET', skipAuth })
    
    // Кешируем только успешные GET запросы
    if (useCache) {
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() })
      // Cached
    }
    
    return result
  }

  // POST запрос
  async post<T>(endpoint: string, data?: unknown, skipAuth = false): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      skipAuth,
    })
  }

  // PUT запрос
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // PATCH запрос
  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // DELETE запрос
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // Очистка кеша
  clearCache(pattern?: string) {
    if (pattern) {
      // Очищаем кеш по паттерну
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key)
        }
      }
    } else {
      // Очищаем весь кеш
      this.cache.clear()
    }
    // Cache cleared
  }

  // Получение статистики кеша
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }

  // Проверка истечения токена
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Math.floor(Date.now() / 1000)
      return payload.exp < currentTime
    } catch {
      return true // Если не можем декодировать, считаем истекшим
    }
  }

  // Безопасное обновление токена с защитой от бесконечных циклов
  private async refreshTokenIfNeeded(): Promise<string> {
    // Если уже идет процесс обновления, ждем его завершения
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    // Если нет refresh token, выбрасываем ошибку
    const currentToken = localStorage.getItem('accessToken')
    if (!currentToken) {
      throw new Error('No access token available')
    }

    this.isRefreshing = true
    this.refreshPromise = this.performTokenRefresh()

    try {
      const newToken = await this.refreshPromise
      return newToken
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }

  // Выполнение обновления токена
  private async performTokenRefresh(): Promise<string> {
    try {
      const { AuthApi } = await import('./authApi')
      const refreshResponse = await AuthApi.refreshToken()
      const newToken = refreshResponse.tokens.accessToken
      localStorage.setItem('accessToken', newToken)
      return newToken
    } catch (error) {
      logger.error('Token refresh failed:', error)
      throw error
    }
  }

  // Перенаправление на страницу входа
  private redirectToLogin() {
    localStorage.removeItem('accessToken')
    // Очищаем кеш
    this.clearCache()
    // Перенаправляем на страницу входа
    window.location.href = '/login'
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
