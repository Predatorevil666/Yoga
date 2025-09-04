# 🧘‍♀️ Yoga Platform

[![Python](https://img.shields.io/badge/-Python_3.12-464646?style=flat&logo=Python&logoColor=56C0C0&color=008080)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/-FastAPI-464646?style=flat&logo=FastAPI&logoColor=56C0C0&color=008080)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/-Next.js_14-464646?style=flat&logo=Next.js&logoColor=56C0C0&color=008080)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-464646?style=flat&logo=PostgreSQL&logoColor=56C0C0&color=008080)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/-Docker-464646?style=flat&logo=Docker&logoColor=56C0C0&color=008080)](https://www.docker.com/)
[![GitHub Actions](https://img.shields.io/badge/-GitHub%20Actions-464646?style=flat&logo=GitHub%20actions&logoColor=56C0C0&color=008080)](https://github.com/features/actions)

Современная платформа для записи на занятия йогой с микросервисной архитектурой, полным стеком мониторинга и автоматизированным CI/CD.

## 📋 Описание проекта

**Yoga Platform** — это комплексное веб-приложение, которое позволяет:
- 📅 Записываться на занятия йогой
- 👨‍🏫 Выбирать подходящих тренеров
- 🏢 Управлять студиями и расписанием (админ-панель)
- 🔐 Безопасно аутентифицироваться и авторизовываться
- 🤖 Взаимодействовать через Telegram Bot

## 🏗️ Архитектура

Проект построен на микросервисной архитектуре с тремя основными сервисами:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Admin Panel   │    │   Application   │    │   Auth Service  │
│  (управление)   │    │  (основной)     │    │ (аутентификация)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │      NGINX      │
                    │ (Reverse Proxy) │
                    └─────────────────┘
```

### Компоненты каждого сервиса:
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL
- **Frontend**: Next.js + TypeScript + Tailwind CSS
- **Database**: Общая PostgreSQL база данных
- **Monitoring**: Prometheus + Grafana + EFK Stack + Sentry

## 🚀 Стек технологий

### Backend
- **🐍 Python 3.12** - основной язык программирования
- **⚡ FastAPI** - современный веб-фреймворк для API
- **🗄️ SQLAlchemy 2.0 + SQLModel** - ORM и валидация данных
- **🔄 Alembic** - система миграций базы данных
- **🦄 Uvicorn** - высокопроизводительный ASGI сервер
- **🔐 JWT + Passlib + BCrypt** - аутентификация и безопасность
- **🤖 Aiogram 3.14** - Telegram Bot фреймворк

### Frontend
- **⚛️ Next.js 14** - React фреймворк с SSR/SSG
- **📘 TypeScript** - типизированный JavaScript
- **🎨 Tailwind CSS** - utility-first CSS фреймворк
- **🧩 Radix UI** - доступные UI компоненты
- **🔄 TanStack Query** - управление состоянием и кэширование
- **📱 TWA SDK** - интеграция с Telegram Web Apps

### База данных
- **🐘 PostgreSQL** - реляционная СУБД
- **📊 Prometheus Client** - метрики приложения

### DevOps & Инфраструктура
- **🐳 Docker + Docker Compose** - контейнеризация
- **🌐 NGINX (OpenResty)** - reverse proxy и load balancer
- **⚙️ GitHub Actions** - CI/CD автоматизация
- **📦 GHCR** - реестр Docker образов
- **🔍 Trivy** - сканирование уязвимостей
- **🏷️ Semantic Release** - автоматизация релизов

### Мониторинг и Логирование
- **📈 Prometheus + Grafana** - метрики и дашборды
- **📝 EFK Stack** (Elasticsearch + Fluentd + Kibana) - логирование
- **🚨 Sentry** - мониторинг ошибок и производительности
- **📋 Structlog** - структурированное логирование

### Качество кода
- **🧪 Pytest** - тестирование Python
- **🔧 Ruff + MyPy** - линтинг и типизация Python
- **✨ ESLint** - линтинг TypeScript/JavaScript
- **📊 Coverage** - покрытие кода тестами

## 🚀 Быстрый старт

### Предварительные требования
- Docker ≥ 20.10
- Docker Compose ≥ 2.x
- Git

### Локальная разработка

1. **Клонирование репозитория**
   ```bash
   git clone https://github.com/Predatorevil666/Yoga.git
   cd Yoga
   ```

2. **Настройка переменных окружения**
   ```bash
   cp .env.example .env
   # Отредактируйте .env файл согласно вашим настройкам
   ```

3. **Запуск сервисов**
   ```bash
   docker-compose up -d
   ```

4. **Применение миграций**
   ```bash
   # Application service
   cd application/backend && alembic upgrade head
   
   # Auth service  
   cd auth/backend && alembic upgrade head
   
   # Admin service
   cd admin/backend && alembic upgrade head
   ```

5. **Загрузка тестовых данных**
   ```bash
   chmod +x run_insert.sh
   ./run_insert.sh
   ```

### Доступ к сервисам

- **🌐 Основное приложение**: http://localhost
- **⚙️ Админ-панель**: http://localhost/admin
- **🔐 Аутентификация**: http://localhost/auth
- **📊 Grafana**: http://localhost:3000
- **📈 Prometheus**: http://localhost:9090
- **📝 Kibana**: http://localhost:5601

## 🔧 Разработка

### Структура проекта
```
yoga/
├── admin/           # Административная панель
│   ├── backend/     # FastAPI backend
│   └── frontend/    # Next.js frontend
├── application/     # Основное приложение
│   ├── backend/     # FastAPI backend
│   └── frontend/    # Next.js frontend
├── auth/           # Сервис аутентификации
│   ├── backend/     # FastAPI backend + Telegram Bot
│   └── frontend/    # Next.js frontend
├── monitoring/     # Мониторинг и логирование
│   ├── efk/        # Elasticsearch + Fluentd + Kibana
│   ├── prometheus-grafana/  # Prometheus + Grafana
│   └── sentry/     # Sentry конфигурация
├── nginx/          # NGINX конфигурация
├── .github/        # GitHub Actions workflows
└── docker-compose.yml
```

### Команды разработки

```bash
# Запуск линтеров
cd application/backend && ruff check . && mypy .
cd application/frontend && npm run lint

# Запуск тестов
cd application/backend && pytest
cd application/frontend && npm test

# Просмотр логов
docker-compose logs -f [service_name]

# Пересборка конкретного сервиса
docker-compose up -d --build [service_name]
```

## 🚀 Продакшен

### CI/CD Pipeline

Проект использует GitHub Actions для автоматизации:

1. **🔍 Code Quality**: Линтинг, типизация, тестирование
2. **🐳 Build**: Сборка Docker образов
3. **🔒 Security**: Сканирование уязвимостей с Trivy
4. **📦 Publish**: Публикация в GHCR
5. **🚀 Deploy**: Автоматическое развертывание
6. **📢 Notify**: Уведомления в Telegram

### Переменные окружения

| Переменная | Описание | Обязательная |
|------------|----------|--------------|
| `POSTGRES_USER` | Пользователь PostgreSQL | ✅ |
| `POSTGRES_PASSWORD` | Пароль PostgreSQL | ✅ |
| `POSTGRES_DB` | Имя базы данных | ✅ |
| `DATABASE_URL` | Строка подключения к БД | ✅ |
| `JWT_SECRET_KEY` | Секретный ключ для JWT | ✅ |
| `TELEGRAM_BOT_TOKEN` | Токен Telegram бота | ✅ |
| `SENTRY_DSN` | DSN для Sentry | ❌ |

### Деплой на сервер

```bash
# Подключение к серверу
ssh user@your-server.com

# Обновление образов
docker pull ghcr.io/predatorevil666/yoga-admin-backend:latest
docker pull ghcr.io/predatorevil666/yoga-admin-frontend:latest
docker pull ghcr.io/predatorevil666/yoga-application-backend:latest
docker pull ghcr.io/predatorevil666/yoga-application-frontend:latest
docker pull ghcr.io/predatorevil666/yoga-auth-backend:latest
docker pull ghcr.io/predatorevil666/yoga-auth-frontend:latest

# Перезапуск сервисов
docker-compose up -d

# Проверка статуса
docker-compose ps
```

## 📊 Мониторинг

### Метрики (Prometheus + Grafana)
- Производительность приложений
- Использование ресурсов
- Бизнес-метрики (регистрации, бронирования)

### Логирование (EFK Stack)
- Централизованный сбор логов
- Поиск и анализ событий
- Алерты на критические ошибки

### Мониторинг ошибок (Sentry)
- Отслеживание исключений
- Анализ производительности
- Уведомления о проблемах

## 🔒 Безопасность

- **🛡️ JWT токены** для аутентификации
- **🔐 BCrypt** хеширование паролей
- **🔍 Trivy** сканирование уязвимостей
- **🌐 NGINX** rate limiting и защита
- **🔒 HTTPS** в продакшене
- **📋 Security headers** для веб-безопасности

## 🤝 Участие в разработке

1. Fork проекта
2. Создайте feature ветку (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add amazing feature'`)
4. Отправьте в ветку (`git push origin feature/amazing-feature`)
5. Создайте Pull Request

### Соглашения о коммитах

Проект использует [Conventional Commits](./COMMIT_CONVENTIONS.md):
- `feat:` - новая функциональность
- `fix:` - исправление ошибок
- `docs:` - обновление документации
- `style:` - форматирование кода
- `refactor:` - рефакторинг
- `test:` - добавление тестов
- `chore:` - обновление зависимостей

## 📝 Лицензия

Этот проект распространяется под лицензией MIT. См. файл [LICENSE](LICENSE) для подробностей.

## 👥 Команда

- **DevOps Engineer**: [Alexander Batogov](https://github.com/Predatorevil666)




