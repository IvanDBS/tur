import { translateCountry, translateDepartureCity } from '../utils/countryTranslations'
import type { Country, DepartureCity } from '../types/search'

/**
 * Composable для локализации стран и городов
 * Переводит названия стран и городов отправления с английского на русский язык
 */
export const useCountryLocalization = () => {
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
   * Переводит массив стран на русский язык
   * @param countries - массив стран с английскими названиями
   * @returns массив стран с русскими названиями
   */
  const translateCountries = (countries: Country[]): Country[] => {
    return countries.map(country => ({
      ...country,
      name: country.name ? translateCountryName(country.name) : country.name,
      label: country.label ? translateCountryName(country.label) : country.label
    }))
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

  return {
    translateCountryName,
    translateCountries,
    translateCountryOptions,
    translateDepartureCityName,
    translateDepartureCities,
    translateDepartureCityOptions
  }
}
