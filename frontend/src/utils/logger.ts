/**
 * Централизованная система логирования
 * Автоматически отключается в продакшене
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LoggerConfig {
  level: LogLevel
  enableConsole: boolean
  enableRemote: boolean
}

class Logger {
  private config: LoggerConfig

  constructor() {
    this.config = {
      level: import.meta.env.DEV ? 'debug' : 'error',
      enableConsole: import.meta.env.DEV,
      enableRemote: import.meta.env.PROD
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    }
    return levels[level] >= levels[this.config.level]
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString()
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`
  }

  debug(message: string, ...args: unknown[]): void {
    if (!this.shouldLog('debug')) return
    
    if (this.config.enableConsole) {
      console.debug(this.formatMessage('debug', message), ...args)
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (!this.shouldLog('info')) return
    
    if (this.config.enableConsole) {
      console.info(this.formatMessage('info', message), ...args)
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (!this.shouldLog('warn')) return
    
    if (this.config.enableConsole) {
      console.warn(this.formatMessage('warn', message), ...args)
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (!this.shouldLog('error')) return
    
    if (this.config.enableConsole) {
      console.error(this.formatMessage('error', message), ...args)
    }
  }

  // Метод для логирования API вызовов
  apiCall(method: string, url: string, params?: unknown): void {
    this.debug(`API ${method.toUpperCase()} ${url}`, params)
  }

  // Метод для логирования ошибок API
  apiError(method: string, url: string, error: unknown): void {
    this.error(`API ${method.toUpperCase()} ${url} failed:`, error)
  }
}

// Создаем единственный экземпляр логгера
export const logger = new Logger()

// Экспортируем типы для использования в других файлах
export type { LogLevel, LoggerConfig }
