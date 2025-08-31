# Tur - Туристическая платформа

Современная веб-платформа для поиска и бронирования туров, построенная на Vue.js 3 + TypeScript (фронтенд) и Ruby on Rails 8 (бэкенд).

## 🚀 Быстрый старт

### Предварительные требования
- Node.js 20+ 
- Ruby 3.3+
- PostgreSQL
- Redis

### Установка

1. **Клонируйте репозиторий:**
```bash
git clone <repository-url>
cd tur
```

2. **Настройте бэкенд:**
```bash
cd backend
bundle install
cp config/database.yml.example config/database.yml
# Настройте database.yml под вашу среду
rails db:create db:migrate db:seed
```

3. **Настройте фронтенд:**
```bash
cd frontend
npm install
cp env.example .env.local
# Настройте переменные окружения
```

4. **Запустите приложение:**
```bash
# Терминал 1 - Бэкенд
cd backend
rails server

# Терминал 2 - Фронтенд  
cd frontend
npm run dev
```

## 🛠 Инструменты для чистоты кода

### Фронтенд (Vue.js + TypeScript)

**Prettier** - автоматическое форматирование кода:
```bash
npm run format          # Форматировать код
npm run format:check    # Проверить форматирование
```

**ESLint** - проверка качества кода:
```bash
npm run lint            # Исправить ошибки автоматически
npm run lint:check      # Проверить код без исправлений
```

**Комбинированные команды:**
```bash
npm run code:fix        # Форматировать + исправить ошибки
npm run code:check      # Проверить форматирование + качество кода
```

### Бэкенд (Ruby on Rails)

**RuboCop** - проверка стиля Ruby кода:
```bash
rake rubocop:fix        # Исправить ошибки автоматически
rake rubocop:check      # Проверить код без исправлений
rake rubocop:all        # Исправить + проверить
```

**Комбинированные команды:**
```bash
rake code:fix           # Исправить стиль кода
rake code:check         # Проверить стиль кода
rake code:all           # Исправить + проверить
```

## 📁 Структура проекта

```
tur/
├── backend/                 # Ruby on Rails API
│   ├── app/
│   │   ├── controllers/     # API контроллеры
│   │   ├── models/         # ActiveRecord модели
│   │   ├── services/       # Бизнес-логика
│   │   └── jobs/          # Фоновые задачи
│   ├── config/
│   └── .rubocop.yml       # Конфигурация RuboCop
├── frontend/               # Vue.js 3 + TypeScript
│   ├── src/
│   │   ├── components/     # Vue компоненты
│   │   ├── views/         # Страницы приложения
│   │   ├── stores/        # Pinia stores
│   │   ├── utils/         # Утилиты
│   │   └── types/         # TypeScript типы
│   ├── .eslintrc.js       # Конфигурация ESLint
│   └── .prettierrc        # Конфигурация Prettier
└── docs/                  # Документация
```

## 🎯 Основные возможности

- 🔍 **Поиск туров** - расширенный поиск с фильтрами
- 🏨 **Информация об отелях** - детальная информация и отзывы
- 📅 **Календарь цен** - динамическое ценообразование
- 🔐 **Аутентификация** - регистрация и вход пользователей
- 📋 **Бронирования** - управление заказами
- 📱 **Адаптивный дизайн** - поддержка мобильных устройств

## 🧪 Тестирование

### Фронтенд
```bash
npm run test:unit         # Unit тесты
npm run type-check        # Проверка типов TypeScript
```

### Бэкенд
```bash
rails test               # Запуск тестов
rails test:system        # Системные тесты
```

## 🚀 Развертывание

### Production
```bash
# Бэкенд
cd backend
RAILS_ENV=production bundle exec rails assets:precompile
RAILS_ENV=production bundle exec rails db:migrate

# Фронтенд
cd frontend
npm run build
```

## 📝 Контрибьюция

1. Форкните репозиторий
2. Создайте ветку для новой функции (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add amazing feature'`)
4. Запустите проверки качества кода:
   ```bash
   # Фронтенд
   npm run code:check
   
   # Бэкенд
   rake code:check
   ```
5. Отправьте изменения (`git push origin feature/amazing-feature`)
6. Откройте Pull Request

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 🤝 Поддержка

Если у вас есть вопросы или проблемы, создайте Issue в репозитории или свяжитесь с командой разработки.
