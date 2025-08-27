# 🏖️ OBS Tour Booking Service

Современный сервис бронирования туров через OBS API

## ✨ Особенности

- 🚀 **Rails 8 API-only** с YJIT оптимизацией
- ⚡ **Vue.js 3** с TypeScript и Tailwind CSS
- 🐳 **Docker Compose** для быстрого развертывания
- 🔄 **CI/CD** с GitHub Actions
- 📊 **Sidekiq** для фоновых задач
- 🔒 **Безопасность** с шифрованием и rate limiting

## 🏗️ Архитектура

```
tur/
├── backend/          # Rails 8 API-only
│   ├── app/
│   │   ├── controllers/api/v1/  # API контроллеры
│   │   ├── models/              # ActiveRecord модели
│   │   └── services/            # Бизнес-логика
│   └── config/                  # Конфигурация
├── frontend/         # Vue.js 3 SPA
│   ├── src/
│   │   ├── components/          # Vue компоненты
│   │   ├── views/               # Страницы
│   │   └── stores/              # Pinia stores
│   └── public/                  # Статические файлы
├── docker-compose.yml           # Docker окружение
├── .github/workflows/           # CI/CD pipeline
└── docs/                        # Документация
```

## 🚀 Быстрый старт

### Docker Compose (Рекомендуется)

```bash
# 1. Клонируйте репозиторий
git clone <repo>
cd tur

# 2. Настройте переменные окружения
cp env.example .env
# Отредактируйте .env с вашими OBS API credentials

# 3. Запустите все сервисы
docker-compose up -d

# 4. Откройте приложение
# Frontend: http://localhost:5173
# Backend API: http://localhost:3000
# Sidekiq Web UI: http://localhost:3000/sidekiq
```

### Локальная разработка

```bash
# Backend
cd backend
bundle install
cp config/database.yml.example config/database.yml
rails db:create db:migrate db:seed
rails server

# Frontend (в новом терминале)
cd frontend
npm install
npm run dev
```

## 📡 API Endpoints

- `GET /api/v1/health` - Проверка здоровья сервиса
- `GET /up` - Rails health check

*Дополнительные эндпоинты будут добавлены в следующих этапах*

## 🛠️ Технологический стек

### Backend
- **Ruby 3.1.6** + **Rails 8** (API-only)
- **PostgreSQL 17** - основная база данных
- **Redis 7** - кеширование и сессии
- **Sidekiq** - фоновые задачи
- **Faraday** - HTTP клиент для OBS API
- **RSpec** - тестирование

### Frontend
- **Vue.js 3** + **TypeScript**
- **Vite** - сборщик
- **Tailwind CSS** - стилизация
- **Pinia** - управление состоянием
- **Vue Router** - маршрутизация
- **Vitest** - тестирование

### DevOps
- **Docker & Docker Compose**
- **GitHub Actions** - CI/CD
- **RuboCop & ESLint** - линтеры
- **Brakeman** - проверка безопасности

## 📚 Документация

- [Development Guide](docs/development.md) - Руководство по разработке
- [OBS API Documentation](docs/TOCO-TOUR-V1.22.10.pdf) - Документация OBS API
- [Project Roadmap](docs/obs_road_map.pdf) - План развития проекта

## 🔧 Команды разработки

```bash
# Backend
bundle exec rspec          # Тесты
bundle exec rubocop        # Линтер
bundle exec brakeman       # Безопасность
bundle exec sidekiq        # Фоновые задачи

# Frontend
npm run test:unit          # Тесты
npm run lint               # Линтер
npm run type-check         # TypeScript
npm run build              # Сборка
```

## 📋 Статус проекта

- ✅ **Этап 1**: Подготовка окружения
- 🔄 **Этап 2**: Rails инфраструктура (в процессе)
- ⏳ **Этап 3**: Авторизация OBS API
- ⏳ **Этап 4**: Адаптер к OBS API
- ⏳ **Этап 5**: Схема базы данных
- ⏳ **Этап 6**: Фоновые задачи
- ⏳ **Этап 7**: Frontend UI
- ⏳ **Этап 8**: MVP

## 🤝 Участие в разработке

1. Форкните репозиторий
2. Создайте feature branch
3. Внесите изменения
4. Запустите тесты и линтеры
5. Создайте Pull Request

## 📄 Лицензия

MIT License
