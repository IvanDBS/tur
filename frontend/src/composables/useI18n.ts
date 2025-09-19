import { useI18n as useVueI18n } from 'vue-i18n'
import { supportedLocales, localeNames, type SupportedLocale } from '@/locales'
import { logger } from '../utils/logger'

export function useI18n() {
  const { locale, t, setLocaleMessage } = useVueI18n()

  const changeLocale = (newLocale: SupportedLocale) => {
    locale.value = newLocale
    localStorage.setItem('preferred-locale', newLocale)
    // Обновляем заголовок страницы
    document.documentElement.lang = newLocale
    // Принудительно обновляем компоненты
  }

  const getCurrentLocale = (): SupportedLocale => {
    return locale.value as SupportedLocale
  }

  const getLocaleName = (localeCode: SupportedLocale): string => {
    return localeNames[localeCode]
  }

  const getAvailableLocales = () => {
    return supportedLocales.map(code => ({
      code,
      name: localeNames[code]
    }))
  }

  // Функции для перевода стран, городов и пакетов
  const translateCountry = (englishName: string): string => {
    return t(`countries.${englishName}`, englishName)
  }

  const translateDepartureCity = (englishName: string): string => {
    return t(`cities.departure.${englishName}`, englishName)
  }

  const translateArrivalCity = (englishName: string): string => {
    return t(`cities.arrival.${englishName}`, englishName)
  }

  const translatePackage = (englishName: string): string => {
    return t(`packages.${englishName}`, englishName)
  }

  // Инициализация локали из localStorage
  const initializeLocale = () => {
    const savedLocale = localStorage.getItem('preferred-locale') as SupportedLocale
    if (savedLocale && supportedLocales.includes(savedLocale)) {
      locale.value = savedLocale
    }
    document.documentElement.lang = locale.value
  }

  return {
    locale,
    t,
    changeLocale,
    getCurrentLocale,
    getLocaleName,
    getAvailableLocales,
    translateCountry,
    translateDepartureCity,
    translateArrivalCity,
    translatePackage,
    initializeLocale
  }
}
