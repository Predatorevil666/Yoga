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

