const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

class ApiClient {
  private baseURL: string

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
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // GET запрос
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
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

  // DELETE запрос
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
