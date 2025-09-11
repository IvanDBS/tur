// Словарь переводов стран с английского на русский
export const countryTranslations: Record<string, string> = {
  'BULGARIA': 'Болгария',
  'CYPRUS': 'Кипр',
  'EGYPT': 'Египет',
  'GREECE': 'Греция',
  'MONTENEGRO': 'Черногория',
  'SPAIN': 'Испания',
  'TÜRKIYE': 'Турция',
  'UNITED ARAB EMIRATES': 'Арбаские Эмираты (ОАЭ)',
}

// Словарь переводов городов отправления с английского на русский
export const departureCityTranslations: Record<string, string> = {
  'CHISINAU': 'Кишинёв',
}

// Словарь переводов городов прилета с английского на русский
export const arrivalCityTranslations: Record<string, string> = {
  // Турция
  'ANTALYA': 'Анталья',
  'BODRUM': 'Бодрум',
  'DALAMAN': 'Даламан',
  'ISTANBUL': 'Стамбул',
  
  // Египет
  'SHARM EL SHEIKH': 'Шарм-эль-Шейх',
  'HURGHADA': 'Хургада',
  
  // Греция
  'HERAKLION': 'Ираклион',
  
  // Испания
  'BARCELONA': 'Барселона',
  'PALMA DE MALLORCA': 'Пальма-де-Мальорка',
}

// Словарь переводов пакетов с английского на русский
export const packageTranslations: Record<string, string> = {
  // Турция
  'EGEE FULL': 'Бодрум (✈️ Перелет + 🏨 Отель) ',
  'EGEE NO AVIA': 'Бодрум (🏨 Только отель) ',
  'ANTALYA FULL': 'Анталья ( ✈️ Перелет + 🏨 Отель)  ',
  'ANTALYA NO AVIA': 'Анталья (🏨 Только отель) ',
  'ISTANBUL NO AVIA': 'Стамбул (🏨 Только отель) ',
  
  // Египет
  'SHARM-EL-SHEIKH FULL': 'Шарм-эль-Шейх (✈️ Перелет + 🏨 Отель)',
  'SHARM-EL-SHEIKH NO AVIA': 'Шарм-эль-Шейх (🏨 Только отель)',
  'HURGHADA FULL': 'Хургада (✈️ Перелет + 🏨 Отель)',
  'HURGHADA NO AVIA': 'Хургада (🏨 Только отель)',
  
  // Греция
  'CRETE FULL': 'Крит (✈️ Перелет + 🏨 Отель)',
  'GREECE NO AVIA': 'Греция (🏨 Только отель)',
  'CRETE NO AVIA': 'Крит (🏨 Только отель)',
  
  // Болгария
  'BULGARIA NO BUS': 'Болгария (🏨 Только отель)',
  
  // Кипр
  'CYPRUS FULL': 'Кипр (✈️ Перелет + 🏨 Отель)',
  'CYPRUS NO AVIA': 'Кипр (🏨 Только отель)',
  
  // Черногория
  'MONTENEGRO FULL': 'Черногория (✈️ Перелет + 🏨 Отель)',
  'MONTENEGRO NO AVIA': 'Черногория (🏨 Только отель)',
  
  // Испания
  'BARCELONA FULL': 'Барселона (✈️ Перелет + 🏨 Отель)',
  'BARCELONA NO AVIA': 'Барселона (🏨 Только отель)',
  'PALMA DE MALLORCA FULL': 'Пальма-де-Мальорка\n(✈️ Перелет + 🏨 Отель)',
  'PALMA DE MALLORCA NO AVIA': 'Пальма-де-Мальорка\n(🏨 Только отель)',
  
  // ОАЭ
  'EMIRATES NO AVIA': 'ОАЭ (🏨 Только отель)',
}

// Функция для перевода названия страны
export const translateCountry = (englishName: string): string => {
  return countryTranslations[englishName] || englishName
}

// Функция для перевода названия города отправления
export const translateDepartureCity = (englishName: string): string => {
  return departureCityTranslations[englishName] || englishName
}

// Функция для перевода названия города прилета
export const translateArrivalCity = (englishName: string): string => {
  return arrivalCityTranslations[englishName] || englishName
}

// Функция для перевода названия пакета
export const translatePackage = (englishName: string): string => {
  return packageTranslations[englishName] || englishName
}

// Порядок стран по популярности (от самых популярных к менее популярным)
export const countryPriorityOrder = [
  'TÜRKIYE',           // Турция - #1 по популярности
  'EGYPT',             // Египет - #2 
  'GREECE',            // Греция - #3
  'SPAIN',             // Испания - #4
  'UNITED ARAB EMIRATES', // ОАЭ - #5
  'CYPRUS',            // Кипр - #6
  'MONTENEGRO',        // Черногория - #7
  'BULGARIA'           // Болгария - #8
]

// Функция для сортировки стран по популярности
export const sortCountriesByPopularity = (countries: Array<{label?: string, name?: string, originalLabel?: string, originalName?: string}>) => {
  return countries.sort((a, b) => {
    // Используем оригинальные английские названия для сортировки
    const aOriginal = a.originalLabel || a.originalName || a.label || a.name || ''
    const bOriginal = b.originalLabel || b.originalName || b.label || b.name || ''
    
    const aIndex = countryPriorityOrder.indexOf(aOriginal)
    const bIndex = countryPriorityOrder.indexOf(bOriginal)
    
    // Если страна не найдена в списке приоритетов, ставим её в конец
    const aPriority = aIndex === -1 ? 999 : aIndex
    const bPriority = bIndex === -1 ? 999 : bIndex
    
    return aPriority - bPriority
  })
}