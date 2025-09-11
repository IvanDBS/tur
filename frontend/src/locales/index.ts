import { createI18n } from 'vue-i18n'
import ro from './ro'
import ru from './ru'
import en from './en'
import ua from './ua'
import tr from './tr'

export type SupportedLocale = 'ro' | 'ru' | 'en' | 'ua' | 'tr'

export const supportedLocales: SupportedLocale[] = ['ro', 'ru', 'en', 'ua', 'tr']

export const localeNames: Record<SupportedLocale, string> = {
  ro: 'Română',
  ru: 'Русский',
  en: 'English',
  ua: 'Українська',
  tr: 'Türkçe'
}

const messages = {
  ro,
  ru,
  en,
  ua,
  tr
}

const i18n = createI18n({
  legacy: false,
  locale: 'ro', // Default locale
  fallbackLocale: 'en',
  messages,
  globalInjection: true
})

export default i18n
