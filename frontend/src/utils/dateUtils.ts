/**
 * Форматирует дату в формат DD.MM
 * @param dateString - строка даты
 * @returns отформатированная дата
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit'
  })
}

/**
 * Форматирует дату и время в формат DD.MM.YYYY HH:MM
 * @param dateString - строка даты
 * @returns отформатированная дата и время
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Возвращает правильное склонение для слова "ночь" в зависимости от количества
 * @param count - количество ночей
 * @returns правильное склонение
 */
export const getNightWord = (count: number): string => {
  if (count === 1) return 'ночь'
  if (count >= 2 && count <= 4) return 'ночи'
  return 'ночей'
}

/**
 * Проверяет, является ли дата сегодняшней
 * @param dateString - строка даты
 * @returns true если дата сегодня
 */
export const isToday = (dateString: string): boolean => {
  const today = new Date()
  const date = new Date(dateString)
  return today.toDateString() === date.toDateString()
}

/**
 * Проверяет, является ли дата в прошлом
 * @param dateString - строка даты
 * @returns true если дата в прошлом
 */
export const isPast = (dateString: string): boolean => {
  const today = new Date()
  const date = new Date(dateString)
  return date < today
}

/**
 * Добавляет дни к дате
 * @param dateString - исходная дата
 * @param days - количество дней для добавления
 * @returns новая дата
 */
export const addDays = (dateString: string, days: number): Date => {
  const date = new Date(dateString)
  date.setDate(date.getDate() + days)
  return date
}
