/**
 * Форматирует дату в формат DD.MM
 * @param dateString - строка даты
 * @returns отформатированная дата
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
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
    minute: '2-digit',
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

/**
 * Форматирует дату с днем недели в формате DD.MM.YYYY (День)
 * @param dateString - строка даты
 * @returns отформатированная дата с днем недели
 */
export const formatDateWithDay = (dateString: string): string => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
    const dayName = dayNames[date.getDay()]
    const formattedDate = date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
    return `${formattedDate} (${dayName})`
  } catch {
    return dateString
  }
}

/**
 * Форматирует дату в короткий формат DD.MM
 * @param dateString - строка даты
 * @returns отформатированная дата
 */
export const formatDateShort = (dateString: string): string => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit'
    })
  } catch {
    return dateString
  }
}

/**
 * Форматирует дату в полный формат DD.MM.YYYY
 * @param dateString - строка даты
 * @returns отформатированная дата
 */
export const formatDateFull = (dateString: string): string => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch {
    return dateString
  }
}

/**
 * Рассчитывает длительность между временем отправления и прибытия
 * @param departure - объект с временем отправления
 * @param arrival - объект с временем прибытия
 * @returns строка с длительностью в формате "Xч Yм"
 */
export const calculateDuration = (
  departure: { time: string }, 
  arrival: { time: string }
): string => {
  if (!departure?.time || !arrival?.time) return ''
  
  try {
    const depTime = new Date(`2000-01-01T${departure.time}`)
    const arrTime = new Date(`2000-01-01T${arrival.time}`)
    
    // Если время прибытия меньше времени отправления, значит это следующий день
    if (arrTime < depTime) {
      arrTime.setDate(arrTime.getDate() + 1)
    }
    
    const diffMs = arrTime.getTime() - depTime.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffHours > 0) {
      return `${diffHours}ч ${diffMinutes}м`
    } else {
      return `${diffMinutes}м`
    }
  } catch {
    return ''
  }
}

/**
 * Форматирует время в формате HH:MM
 * @param timeString - строка времени
 * @returns отформатированное время
 */
export const formatTime = (timeString: string): string => {
  if (!timeString) return ''
  try {
    const time = new Date(`2000-01-01T${timeString}`)
    return time.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return timeString
  }
}
