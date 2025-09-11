import { translateCountry, translateDepartureCity, translateArrivalCity, translatePackage, sortCountriesByPopularity } from '../utils/countryTranslations'
import type { Country, DepartureCity, ArrivalCity, Package } from '../types/search'
import { useI18n } from './useI18n'

/**
 * Composable для локализации стран, городов и пакетов
 * Переводит названия стран, городов отправления, городов прилета и пакетов с английского на русский язык
 */
export const useCountryLocalization = () => {
  // Получаем доступ к текущей локали
  const { getCurrentLocale } = useI18n()
  
  /**
   * Переводит название страны на русский язык
   * @param englishName - название страны на английском
   * @returns название страны на русском или оригинальное название, если перевод не найден
   */
  const translateCountryName = (englishName: string): string => {
    return translateCountry(englishName)
  }

  /**
   * Переводит название города отправления на русский язык
   * @param englishName - название города на английском
   * @returns название города на русском или оригинальное название, если перевод не найден
   */
  const translateDepartureCityName = (englishName: string): string => {
    return translateDepartureCity(englishName)
  }

  /**
   * Переводит название города прилета на русский язык
   * @param englishName - название города на английском
   * @returns название города на русском или оригинальное название, если перевод не найден
   */
  const translateArrivalCityName = (englishName: string): string => {
    return translateArrivalCity(englishName)
  }

  /**
   * Переводит название пакета на русский язык
   * @param englishName - название пакета на английском
   * @returns название пакета на русском или оригинальное название, если перевод не найден
   */
  const translatePackageName = (englishName: string): string => {
    return translatePackage(englishName)
  }

  /**
   * Переводит массив стран на русский язык и сортирует по популярности
   * @param countries - массив стран с английскими названиями
   * @returns массив стран с русскими названиями, отсортированный по популярности
   */
  const translateCountries = (countries: Country[]): Country[] => {
    const translated = countries.map(country => ({
      ...country,
      originalName: country.name, // Сохраняем оригинальное название
      originalLabel: country.label, // Сохраняем оригинальное название
      name: country.name ? translateCountryName(country.name) : country.name,
      label: country.label ? translateCountryName(country.label) : country.label
    }))
    
    // Возвращаем без сортировки (сортировка будет применена в useObsApi)
    return translated
  }

  /**
   * Переводит массив городов отправления на русский язык
   * @param cities - массив городов с английскими названиями
   * @returns массив городов с русскими названиями
   */
  const translateDepartureCities = (cities: DepartureCity[]): DepartureCity[] => {
    return cities.map(city => ({
      ...city,
      name: city.name ? translateDepartureCityName(city.name) : city.name,
      label: city.label ? translateDepartureCityName(city.label) : city.label
    }))
  }

  /**
   * Переводит опции стран для селекторов
   * @param countries - массив стран
   * @returns массив опций с переведенными названиями
   */
  const translateCountryOptions = (countries: Country[]) => {
    return countries.map(country => ({
      value: country,
      label: translateCountryName(country.label || country.name || `Country ${country.id}`)
    }))
  }

  /**
   * Переводит массив городов прилета на русский язык
   * @param cities - массив городов с английскими названиями
   * @returns массив городов с русскими названиями
   */
  const translateArrivalCities = (cities: ArrivalCity[]): ArrivalCity[] => {
    return cities.map(city => ({
      ...city,
      name: city.name ? translateArrivalCityName(city.name) : city.name,
      label: city.label ? translateArrivalCityName(city.label) : city.label
    }))
  }

  /**
   * Переводит массив пакетов на русский язык и сортирует по алфавиту
   * @param packages - массив пакетов с английскими названиями
   * @returns массив пакетов с русскими названиями, отсортированный по алфавиту
   */
  const translatePackages = (packages: Package[]): Package[] => {
    const translated = packages.map(pkg => ({
      ...pkg,
      name: pkg.name ? translatePackageName(pkg.name) : pkg.name,
      label: pkg.label ? translatePackageName(pkg.label) : pkg.label
    }))
    
    // Сортируем по алфавиту с учетом текущей локали
    const currentLocale = getCurrentLocale()
    return translated.sort((a, b) => {
      const aName = a.label || a.name || ''
      const bName = b.label || b.name || ''
      return aName.localeCompare(bName, currentLocale)
    })
  }

  /**
   * Переводит опции городов отправления для селекторов
   * @param cities - массив городов
   * @returns массив опций с переведенными названиями
   */
  const translateDepartureCityOptions = (cities: DepartureCity[]) => {
    return cities.map(city => ({
      value: city,
      label: translateDepartureCityName(city.label || city.name || `City ${city.id}`)
    }))
  }

  /**
   * Переводит опции городов прилета для селекторов
   * @param cities - массив городов
   * @returns массив опций с переведенными названиями
   */
  const translateArrivalCityOptions = (cities: ArrivalCity[]) => {
    return cities.map(city => ({
      value: city,
      label: translateArrivalCityName(city.label || city.name || `City ${city.id}`)
    }))
  }

  /**
   * Переводит опции пакетов для селекторов
   * @param packages - массив пакетов
   * @returns массив опций с переведенными названиями
   */
  const translatePackageOptions = (packages: Package[]) => {
    return packages.map(pkg => ({
      value: pkg,
      label: translatePackageName(pkg.label || pkg.name || `Package ${pkg.id}`)
    }))
  }

  return {
    translateCountryName,
    translateCountries,
    translateCountryOptions,
    translateDepartureCityName,
    translateDepartureCities,
    translateDepartureCityOptions,
    translateArrivalCityName,
    translateArrivalCities,
    translateArrivalCityOptions,
    translatePackageName,
    translatePackages,
    translatePackageOptions
  }
}
