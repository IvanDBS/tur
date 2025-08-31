/**
 * Обрезает строку до указанной длины и добавляет многоточие
 * @param str - исходная строка
 * @param maxLength - максимальная длина
 * @returns обрезанная строка
 */
export const truncate = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}

/**
 * Приводит первую букву строки к верхнему регистру
 * @param str - исходная строка
 * @returns строка с заглавной первой буквой
 */
export const capitalize = (str: string): string => {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Приводит все слова в строке к заглавной первой букве
 * @param str - исходная строка
 * @returns строка с заглавными первыми буквами всех слов
 */
export const capitalizeWords = (str: string): string => {
  if (!str) return str
  return str.split(' ').map(capitalize).join(' ')
}

/**
 * Удаляет лишние пробелы из строки
 * @param str - исходная строка
 * @returns строка без лишних пробелов
 */
export const trimSpaces = (str: string): string => {
  return str.replace(/\s+/g, ' ').trim()
}

/**
 * Проверяет, является ли строка пустой или содержит только пробелы
 * @param str - строка для проверки
 * @returns true если строка пустая
 */
export const isEmpty = (str: string): boolean => {
  return !str || str.trim().length === 0
}

/**
 * Генерирует случайную строку указанной длины
 * @param length - длина строки
 * @returns случайная строка
 */
export const generateRandomString = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Форматирует номер телефона в читаемый вид
 * @param phone - номер телефона
 * @returns отформатированный номер
 */
export const formatPhone = (phone: string): string => {
  if (!phone) return phone

  // Удаляем все нецифровые символы
  const digits = phone.replace(/\D/g, '')

  // Форматируем в зависимости от длины
  if (digits.length === 11) {
    return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`
  }

  if (digits.length === 10) {
    return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8)}`
  }

  return phone
}

/**
 * Проверяет, является ли строка валидным email
 * @param email - email для проверки
 * @returns true если email валиден
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
