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

// Функции для перевода массивов данных
export const translateCountries = <T extends {label: string, originalLabel?: string}>(
  countries: T[],
  translateCountry: (key: string) => string
): T[] => {
  return countries.map(country => ({
    ...country,
    label: translateCountry(country.originalLabel || country.label)
  }))
}

export const translateDepartureCities = <T extends {label: string, originalLabel?: string}>(
  cities: T[],
  translateDepartureCity: (key: string) => string
): T[] => {
  return cities.map(city => ({
    ...city,
    label: translateDepartureCity(city.originalLabel || city.label)
  }))
}

export const translateArrivalCities = <T extends {label: string, originalLabel?: string}>(
  cities: T[],
  translateArrivalCity: (key: string) => string
): T[] => {
  return cities.map(city => ({
    ...city,
    label: translateArrivalCity(city.originalLabel || city.label)
  }))
}

export const translatePackages = <T extends {label: string, originalLabel?: string}>(
  packages: T[],
  translatePackage: (key: string) => string
): T[] => {
  const translated = packages.map(pkg => ({
    ...pkg,
    label: translatePackage(pkg.originalLabel || pkg.label)
  }))
  
  // Сортируем по алфавиту по переведенному названию
  return translated.sort((a, b) => {
    const aName = a.label || ''
    const bName = b.label || ''
    return aName.localeCompare(bName)
  })
}
