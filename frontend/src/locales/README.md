# Система переводов (i18n)

## Обзор

Система переводов использует Vue i18n для поддержки многоязычности. Поддерживаются следующие языки:
- **RO** - Румынский (по умолчанию)
- **RU** - Русский
- **EN** - Английский
- **UA** - Украинский
- **TR** - Турецкий

## Структура файлов

```
src/locales/
├── index.ts          # Главная конфигурация i18n
├── ro/index.ts       # Румынские переводы
├── ru/index.ts       # Русские переводы
├── en/index.ts       # Английские переводы
├── ua/index.ts       # Украинские переводы
├── tr/index.ts       # Турецкие переводы
└── README.md         # Этот файл
```

## Использование

### В компонентах Vue

```vue
<template>
  <div>
    <h1>{{ $t('common.search') }}</h1>
    <p>{{ $t('search.title') }}</p>
  </div>
</template>

<script setup>
import { useI18n } from '@/composables/useI18n'

const { t, changeLocale, getCurrentLocale } = useI18n()

// Программное использование
const searchText = t('common.search')
</script>
```

### В composables

```typescript
import { useI18n } from '@/composables/useI18n'

export function useMyComposable() {
  const { t, translateCountry, translateCity } = useI18n()
  
  const translatedCountry = translateCountry('TÜRKIYE')
  const translatedCity = translateCity('ANTALYA')
  
  return { translatedCountry, translatedCity }
}
```

## Структура переводов

### Общие переводы (common)
- `search` - Поиск
- `loading` - Загрузка
- `error` - Ошибка
- `success` - Успех
- и т.д.

### Навигация (navigation)
- `home` - Главная
- `search` - Поиск
- `bookings` - Бронирования
- и т.д.

### Поиск (search)
- `title` - Заголовок поиска
- `destination` - Направление
- `departure` - Отправление
- и т.д.

### Страны (countries)
Ключи соответствуют английским названиям стран:
- `TÜRKIYE` - Турция
- `EGYPT` - Египет
- `GREECE` - Греция
- и т.д.

### Города (cities)
#### Города отправления (departure)
- `CHISINAU` - Кишинёв

#### Города прилета (arrival)
- `ANTALYA` - Анталья
- `ISTANBUL` - Стамбул
- `BARCELONA` - Барселона
- и т.д.

### Пакеты (packages)
Ключи соответствуют английским названиям пакетов:
- `ANTALYA FULL` - Анталья (✈️ Перелет + 🏨 Отель)
- `EGEE FULL` - Бодрум (✈️ Перелет + 🏨 Отель)
- и т.д.

## Добавление новых переводов

1. Откройте файл соответствующего языка (например, `ru/index.ts`)
2. Добавьте новый ключ в нужную секцию
3. Добавьте переводы для всех поддерживаемых языков

Пример:
```typescript
// В ru/index.ts
export default {
  common: {
    // ... существующие переводы
    newKey: 'Новый перевод'
  }
}

// В en/index.ts
export default {
  common: {
    // ... существующие переводы
    newKey: 'New translation'
  }
}
```

## Переключатель языка

Компонент `LanguageSwitcher` автоматически отображается в шапке сайта и позволяет пользователям выбирать язык. Выбранный язык сохраняется в localStorage.

## API интеграция

Система переводов интегрирована с API через:
- `useObsApi` - автоматически переводит данные от API
- `utils/translations.ts` - утилиты для перевода массивов данных

## Тестирование

Для тестирования системы переводов перейдите на страницу `/i18n-test`, где можно:
- Переключать языки
- Видеть переводы в реальном времени
- Проверять все секции переводов

## Планы развития

1. **Постепенное добавление переводов** - переводы добавляются по одному языку
2. **Расширение переводов** - добавление новых секций по мере необходимости
3. **Автоматические переводы** - интеграция с сервисами автоматического перевода
4. **Локализация дат и чисел** - поддержка различных форматов дат и чисел
