/**
 * Константы для ID аэропортов
 * Используются вместо магических чисел в коде
 */

export const AIRPORT_IDS = {
  ANTALYA: 50004,
  ISTANBUL: 50005,
  BODRUM: 50006,
  KEMER: 50007,
  ALANYA: 50008,
} as const

export const AIRPORT_NAMES = {
  [AIRPORT_IDS.ANTALYA]: 'ANTALYA',
  [AIRPORT_IDS.ISTANBUL]: 'ISTANBUL',
  [AIRPORT_IDS.BODRUM]: 'BODRUM',
  [AIRPORT_IDS.KEMER]: 'KEMER',
  [AIRPORT_IDS.ALANYA]: 'ALANYA',
} as const

export type AirportId = typeof AIRPORT_IDS[keyof typeof AIRPORT_IDS]
export type AirportName = typeof AIRPORT_NAMES[keyof typeof AIRPORT_NAMES]

/**
 * Получить ID аэропорта по названию пакета
 */
export function getAirportIdByPackageName(packageName: string): AirportId | null {
  const name = packageName.toLowerCase()
  
  if (name.includes('antalya')) return AIRPORT_IDS.ANTALYA
  if (name.includes('istanbul')) return AIRPORT_IDS.ISTANBUL
  if (name.includes('bodrum')) return AIRPORT_IDS.BODRUM
  if (name.includes('kemer')) return AIRPORT_IDS.KEMER
  if (name.includes('alanya')) return AIRPORT_IDS.ALANYA
  
  return null
}

/**
 * Получить название аэропорта по ID
 */
export function getAirportNameById(id: AirportId): AirportName | null {
  return AIRPORT_NAMES[id] || null
}
