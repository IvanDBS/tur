# Booking Configuration System

## Overview

Эта система конфигурации заменяет хардкод значений в коде на гибкую и настраиваемую систему.

## Files

### `bookingConfig.ts`
Основной файл конфигурации, содержащий:
- **DEFAULTS**: Значения по умолчанию для всех полей бронирования
- **EXTRACTION_PRIORITY**: Приоритетные пути для извлечения данных из различных структур

### `bookingDefaults.ts` (legacy)
Файл для обратной совместимости, реэкспортирует конфигурацию.

## Usage

### Изменение значений по умолчанию

```typescript
// В bookingConfig.ts
export const BOOKING_CONFIG = {
  DEFAULTS: {
    ROOM_TYPE: 'Стандартный номер', // Изменить здесь
    MEAL_PLAN: 'Все включено',      // Изменить здесь
    // ...
  }
}
```

### Добавление новых путей извлечения данных

```typescript
// В bookingConfig.ts
EXTRACTION_PRIORITY: {
  ROOM_TYPE: [
    'tour_details.room_type',
    'tour_details.accommodation.room.name',
    'new_path.room.name', // Добавить новый путь
    // ...
  ]
}
```

### Использование в компонентах

```typescript
import { BOOKING_DEFAULTS, extractDataByPriority } from '../config/bookingConfig'

const getRoomType = () => {
  const data = { tour_details, customer_data }
  return extractDataByPriority(
    data, 
    BOOKING_DEFAULTS.EXTRACTION_PRIORITY.ROOM_TYPE, 
    BOOKING_DEFAULTS.DEFAULTS.ROOM_TYPE
  )
}
```

## Benefits

1. **Нет хардкода**: Все значения вынесены в конфигурацию
2. **Гибкость**: Легко изменить значения по умолчанию
3. **Расширяемость**: Легко добавить новые пути извлечения данных
4. **Централизация**: Вся конфигурация в одном месте
5. **Типизация**: TypeScript поддержка с `as const`

## Migration

Старый код:
```typescript
return value || 'Стандартный номер' // Хардкод
```

Новый код:
```typescript
return extractDataByPriority(data, paths, BOOKING_DEFAULTS.DEFAULTS.ROOM_TYPE)
```
