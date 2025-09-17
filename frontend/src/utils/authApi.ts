import { apiClient } from './api'
import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  User,
} from '../types/auth'

export class AuthApi {
  // Вход в систему
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/sign_in', credentials)
  }

  // Регистрация
  static async register(
    credentials: RegisterCredentials
  ): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/sign_up', credentials)
  }

  // Выход из системы
  static async logout(): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>('/auth/sign_out')
  }

  // Получение текущего пользователя
  static async getCurrentUser(): Promise<{ user: User }> {
    return apiClient.get<{ user: User }>('/auth/me')
  }

  // Обновление профиля пользователя
  static async updateProfile(userData: Partial<User>): Promise<{ user: User }> {
    return apiClient.put<{ user: User }>('/auth/profile', userData)
  }

  // Смена пароля
  static async changePassword(data: {
    currentPassword: string
    newPassword: string
  }): Promise<{ message: string }> {
    return apiClient.put<{ message: string }>('/auth/change_password', data)
  }

  // Обновление токена
  static async refreshToken(): Promise<{ tokens: { accessToken: string; expiresIn: number } }> {
    return apiClient.post<{ tokens: { accessToken: string; expiresIn: number } }>('/auth/refresh')
  }
}
