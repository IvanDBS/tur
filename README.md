# 🚀 MIGO.md - OBS API Integration

Туристический сайт-посредник для бронирования туров через OBS API.

## 🏗️ Архитектура

- **Backend**: Ruby on Rails 8.0 + PostgreSQL + Redis + Sidekiq
- **Frontend**: Vue.js 3 + TypeScript + Tailwind CSS
- **API**: RESTful API с JWT авторизацией
- **Интеграция**: OBS API для поиска туров и отелей

## 🚀 Быстрый старт

### 1. Клонирование и настройка

```bash
git clone <repository-url>
cd tur
```

### 2. Backend настройка

```bash
cd backend

# Установка зависимостей
bundle install

# Создание .env файла
cp env.example .env

# Настройка переменных окружения в .env
OBS_API_BASE_URL=https://test-v2.obs.md
OBS_SITE_EMAIL=your_email@domain.com
OBS_SITE_PASSWORD=your_password

# Создание базы данных
rails db:create db:migrate db:seed

# Запуск сервера
rails server
```

### 3. Frontend настройка

```bash
cd frontend

# Установка зависимостей
npm install

# Запуск dev сервера
npm run dev
```

### 4. Redis и Sidekiq

```bash
# Запуск Redis
redis-server

# Запуск Sidekiq (в отдельном терминале)
cd backend
bundle exec sidekiq
```

## 🔐 Переменные окружения

### Backend (.env)

```bash
# OBS API Credentials
OBS_API_BASE_URL=https://test-v2.obs.md
OBS_SITE_EMAIL=your_email@domain.com
OBS_SITE_PASSWORD=your_password

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/tur_development

# Redis
REDIS_URL=redis://localhost:6379/0

# Rails
RAILS_ENV=development
SECRET_KEY_BASE=your_secret_key_base_here

# Lockbox Encryption
LOCKBOX_MASTER_KEY=your_lockbox_master_key_here

# Frontend
VITE_API_URL=http://localhost:3000/api

# Sidekiq Configuration
SIDEKIQ_WEB_USERNAME=admin
SIDEKIQ_WEB_PASSWORD=password
```

### Frontend (.env)

```bash
VITE_API_URL=http://localhost:3000/api
```

## 🌐 API Endpoints

### Поиск туров

- `GET /api/v1/search/departure_cities` - Города отправления
- `GET /api/v1/search/countries` - Страны назначения
- `GET /api/v1/search/package_templates` - Шаблоны пакетов
- `POST /api/v1/search` - Поиск туров

### Аутентификация

- `POST /api/v1/auth/register` - Регистрация
- `POST /api/v1/auth/login` - Вход
- `DELETE /api/v1/auth/logout` - Выход

## 🔄 Background Jobs

- **SyncHotelsJob**: Синхронизация отелей с OBS API
- **RefreshAvailabilityJob**: Обновление доступности туров
- **MonitorBookingJob**: Мониторинг бронирований
- **ObsHealthCheckJob**: Проверка здоровья OBS API

## 🧪 Тестирование

```bash
# Backend тесты
cd backend
bundle exec rspec

# Frontend тесты
cd frontend
npm run test
```

## 🐳 Docker

```bash
# Запуск всех сервисов
docker-compose up -d

# Остановка
docker-compose down
```

## 📚 Документация

- [OBS API Documentation](docs.part1.md)
- [Booking API](docs.part2.md)
- [Air Tickets API](docs.part3.md)

## 🔧 Разработка

### Структура проекта

```
tur/
├── backend/          # Rails API
├── frontend/         # Vue.js SPA
├── docs/            # API документация
└── docker-compose.yml
```

### Основные сервисы

- **ObsSiteAuthService**: Аутентификация на уровне сайта
- **ObsApiService**: Прямое взаимодействие с OBS API
- **ObsAdapter**: Высокоуровневый интерфейс для OBS API

## 🚨 Безопасность

- Все .env файлы добавлены в .gitignore
- Пароли и ключи не должны попадать в репозиторий
- Используется Lockbox для шифрования чувствительных данных
- JWT токены с ограниченным временем жизни

## 📝 Лицензия

MIT License

## 🤝 Поддержка

По вопросам интеграции с OBS API обращайтесь к команде разработки.
