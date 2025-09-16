// Production-safe logger utility
const isDevelopment = import.meta.env.DEV
const isVerbose = import.meta.env.VITE_VERBOSE_LOGGING === 'true'

export const logger = {
  debug: (...args: unknown[]) => {
    if (isDevelopment && isVerbose) {
      console.log('[DEBUG]', ...args)
    }
  },
  
  info: (...args: unknown[]) => {
    if (isDevelopment) {
      console.info('[INFO]', ...args)
    }
  },
  
  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn('[WARN]', ...args)
    }
  },
  
  error: (...args: unknown[]) => {
    // Always log errors, even in production
    console.error('[ERROR]', ...args)
  },
  
  apiCall: (method: string, url: string) => {
    if (isDevelopment) {
      console.log(`[API] ${method} ${url}`)
    }
  },
  
  // Новые методы для более структурированного логирования
  booking: (...args: unknown[]) => {
    if (isDevelopment) {
      console.info('[BOOKING]', ...args)
    }
  },
  
  auth: (...args: unknown[]) => {
    if (isDevelopment) {
      console.info('[AUTH]', ...args)
    }
  }
}