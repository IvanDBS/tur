/**
 * Утилиты для работы с объектами
 */

/**
 * Сравнивает два массива на равенство (поверхностное сравнение)
 */
export function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false
  return a.every((val, index) => val === b[index])
}

/**
 * Сравнивает два объекта на равенство (поверхностное сравнение)
 */
export function objectsEqual<T extends Record<string, unknown>>(a: T, b: T): boolean {
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  
  if (keysA.length !== keysB.length) return false
  
  return keysA.every(key => a[key] === b[key])
}

/**
 * Создает shallow copy объекта
 */
export function shallowCopy<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return [...obj] as T
  }
  if (obj && typeof obj === 'object') {
    return { ...obj }
  }
  return obj
}

/**
 * Проверяет, является ли значение пустым (null, undefined, пустой массив)
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}
