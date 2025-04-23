# Название проекта: Yoga

Доступен по адресу:

## Описание проекта Yoga

Приложение, с помощью которого люди могут записаться на занятия по йоги, выбрать подходящего тренера и т.д.

## Технологии
[![Python](https://img.shields.io/badge/-Python-464646?style=flat&logo=Python&logoColor=56C0C0&color=008080)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-464646?style=flat&logo=PostgreSQL&logoColor=56C0C0&color=008080)](https://www.postgresql.org/)
[![Nginx](https://img.shields.io/badge/-NGINX-464646?style=flat&logo=NGINX&logoColor=56C0C0&color=008080)](https://nginx.org/ru/)
[![Docker](https://img.shields.io/badge/-Docker-464646?style=flat&logo=Docker&logoColor=56C0C0&color=008080)](https://www.docker.com/)
[![Docker-compose](https://img.shields.io/badge/-Docker%20compose-464646?style=flat&logo=Docker&logoColor=56C0C0&color=008080)](https://www.docker.com/)
[![GitHub%20Actions](https://img.shields.io/badge/-GitHub%20Actions-464646?style=flat&logo=GitHub%20actions&logoColor=56C0C0&color=008080)](https://github.com/features/actions)

### Развертывание проекта на локальном компьютере в Docker-контейнерах:

#### Применение миграций:

- Для основного приложения:

```bash
    cd application/backend
    alembic upgrade head
```
 - Для сервиса аутентификации:

```bash
    cd auth/backend
    alembic upgrade head
```
#### Загрузка тестовых данных:

 - Убедитесь, что в файле .env правильно настроены параметры подключения к базе данных
 - Скрипт run_insert.sh должен быть исполняемым:
 
```bash
    chmod +x run_insert.sh
```

## Развертывание на сервере

### 1. Предварительные требования

- Операционная система: Ubuntu 22.04 LTS (или аналог)
- Docker ≥ 20.10
- Docker Compose ≥ 2.x (если используется)
- Открытые порты:
  - 80 (NGINX)
  - 8005, 8002, 8000 (backend-сервисы)
  - 3000, 3001, 3002, 3003 (frontend-сервисы)
  - 5432 (PostgreSQL)

### 2. Переменные окружения

| Переменная               | Описание                                        | Источник                     |
|--------------------------|-------------------------------------------------|------------------------------|
| POSTGRES_USER            | Пользователь PostgreSQL                         | GitHub Actions Secrets      |
| POSTGRES_PASSWORD        | Пароль PostgreSQL                               | GitHub Actions Secrets      |
| POSTGRES_DB              | Имя базы данных                                 | GitHub Actions Secrets      |
| DATABASE_URL             | Основная строка подключения к БД                | GitHub Actions Secrets      |
| TEST_DATABASE_URL        | Строка подключения к тестовой БД                | GitHub Actions Secrets      |
| AUTH_BACKEND_DB_URL      | Подключение к БД для auth-сервиса               | GitHub Actions Secrets      |
| DB_URL                   | Подключение к БД для application/admin сервисов | GitHub Actions Secrets      |
| ECHO_SQL                 | Флаг (True/False) для логирования SQL           | GitHub Actions env          |
| PYTHONPATH               | Путь Python модулей                             | GitHub Actions env          |
| API_URL                  | Базовый URL для frontend                        | GitHub Actions Secrets      |
| NGINX_PORT               | Порт NGINX                                      | GitHub Actions env          |
| AUTH_BACKEND_PORT        | Порт auth-backend                               | GitHub Actions env          |
| BACKEND_PORT             | Порт application-backend                        | GitHub Actions env          |
| FRONTEND_PORT            | Порт application-frontend                       | GitHub Actions env          |
| AUTH_FRONTEND_PORT       | Порт auth-frontend                              | GitHub Actions env          |
| ADMIN_BACKEND_PORT       | Порт admin-backend                              | GitHub Actions env          |
| ADMIN_FRONTEND_PORT      | Порт admin-frontend                             | GitHub Actions env          |

### 3. CI/CD Pipeline

- **CI**: линтинг, сборка и тесты бэкенда (`backend_tests`), проверка фронтенда (`frontend_test`).
- **CD (Delivery)**: сборка Docker-образов и пуш в GHCR (`build_backends_and_push_to_ghcr`, `build_frontends_and_push_to_ghcr`).
- **Approval Gate**: в job `deploy_to_vps` можно добавить `environment: production` для ручного одобрения перед деплоем.

### 4. Ручной деплой на VPS

```bash
ssh <user>@<VPS_HOST>

# Клонирование репозитория
git clone https://github.com/<org>/<repo>.git && cd <repo>

# Обновление образов и запуск
docker pull ghcr.io/<org>/yoga-application-backend:latest
docker pull ghcr.io/<org>/yoga-application-frontend:latest
# … pull других образов …
docker-compose -f docker-compose.yml up -d

# Проверка логов
docker-compose logs -f nginx
```

### 5. Откат (Rollback)

```bash
# Переключиться на предыдущий тег образа
docker pull ghcr.io/<org>/yoga-application-backend:<previous-tag>
docker-compose -f docker-compose.yml up -d
```

### 6. Контакты

- DevOps:  [Alexander Batogov](https://github.com/Predatorevil666)


