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

// Функция для перевода названия страны
export const translateCountry = (englishName: string): string => {
  return countryTranslations[englishName] || englishName
}

// Функция для перевода названия города отправления
export const translateDepartureCity = (englishName: string): string => {
  return departureCityTranslations[englishName] || englishName
}