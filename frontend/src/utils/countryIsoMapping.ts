// Маппинг стран к ISO кодам для OBS API
export const countryIsoMapping: Record<string, string> = {
  'EGIPT': 'EG',
  'TURCIA': 'TR', 
  'TÜRKIYE': 'TR',
  'GREECE': 'GR',
  'BULGARIA': 'BG',
  'CYPRUS': 'CY',
  'SPAIN': 'ES',
  'MONTENEGRO': 'ME',
  'UNITED ARAB EMIRATES': 'AE',
  'UAE': 'AE'
}

// Функция для получения ISO кода страны по названию
export const getCountryIsoCode = (countryName: string): string => {
  const upperName = countryName.toUpperCase()
  return countryIsoMapping[upperName] || upperName.substring(0, 2)
}

// Функция для получения ISO кода страны по ID (если есть маппинг)
export const getCountryIsoCodeById = (countryId: number, countryName?: string): string => {
  if (countryName) {
    return getCountryIsoCode(countryName)
  }
  
  // Fallback маппинг по ID (если известны ID стран)
  const idMapping: Record<number, string> = {
    64: 'EG', // Египет
    65: 'TR', // Турция
    66: 'GR', // Греция
    67: 'BG', // Болгария
    68: 'CY', // Кипр
    69: 'ES', // Испания
    70: 'ME', // Черногория
    71: 'AE'  // ОАЭ
  }
  
  return idMapping[countryId] || 'EG' // Fallback к Египту
}
