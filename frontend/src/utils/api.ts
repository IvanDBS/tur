import { logger } from './logger'

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

class ApiClient {
  private baseURL: string
  private cache = new Map<string, { data: unknown; timestamp: number }>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 минут

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    // Добавляем токен авторизации если есть
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      }
    }

    try {
      logger.debug('API Request:', { url, config })
      const response = await fetch(url, config)
      logger.debug('API Response:', { status: response.status, statusText: response.statusText })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        logger.error('API Error:', errorData)
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const data = await response.json()
      logger.debug('API Success:', data)
      return data
    } catch (error) {
      logger.error('API Request failed:', error)
      // API request failed
      throw error
    }
  }

  // GET запрос с кешированием
  async get<T>(endpoint: string, useCache = true): Promise<T> {
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
    
    const result = await this.request<T>(endpoint, { method: 'GET' })
    
    // Кешируем только успешные GET запросы
    if (useCache) {
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() })
      // Cached
    }
    
    return result
  }

  // POST запрос
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
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
}

export const apiClient = new ApiClient(API_BASE_URL)
