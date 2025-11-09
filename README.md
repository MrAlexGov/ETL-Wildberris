# WB Analytics — система аналитики продаж Wildberries

Проект соответствует ТЗ из файла `тз` и представляет собой SPA-приложение с backend на FastAPI и frontend на React+TS, с очередями фоновых задач, кешированием и Docker-окружением.

## Архитектура

- Backend [`backend/app/main.py`](backend/app/main.py:1)
- Frontend [`frontend/src/main.tsx`](frontend/src/main.tsx:1)
- Монолитный репозиторий, запуск через [`docker-compose.yml`](docker-compose.yml:1)

### Основные компоненты

1. Аутентификация и пользователи
   - Регистрация/логин (JWT).
   - Личный кабинет с настройками.
   - Хранение API-ключей WB в зашифрованном виде.

2. Интеграция с Wildberries API
   - Async-клиент.
   - Батчинг и кеширование в Redis.
   - Получение:
     - Продажи
     - Остатки
     - Заказы
     - Номенклатура

3. Хранение данных
   - PostgreSQL через SQLAlchemy.
   - Основные сущности:
     - User
     - WBApiKey
     - Product
     - SkuCost (себестоимость)
     - Sale
     - Stock
     - AggregatedMetrics (агрегированные метрики для дашборда)

4. Фоновые задачи
   - Celery + Redis.
   - Периодические задачи:
     - Обновление продаж.
     - Обновление остатков.
     - Пересчет агрегатов и отчетов.
   - Цель — обновление данных не реже, чем раз в 2 часа.

5. Frontend (SPA)
   - React + TypeScript + Vite.
   - MUI в качестве UI-библиотеки.
   - Графики: ApexCharts.
   - Основные страницы:
     - Auth (Login/Register)
     - Dashboard
     - Reports:
       - Profitability
       - ToRemove (товары к выводу)
       - Stocks
       - SlowMoving (залежавшиеся)
       - ABC-анализ
     - Settings:
       - WB API-ключи
       - Загрузка себестоимости (CSV/XLSX)

6. Безопасность
   - JWT access/refresh.
   - Хеширование паролей.
   - Шифрование или защищенное хранение WB API-ключей.
   - Ограничение доступа по пользователю (multi-tenant).
   - HTTPS предполагается на уровне инфраструктуры.

7. Масштабируемость
   - Четкое разделение сервисов:
     - backend-api
     - worker (Celery)
     - redis
     - postgres
     - frontend
   - Возможность вынести воркеры и БД на отдельные экземпляры.

## Запуск через Docker

1. Создайте `.env` в корне по примеру:

```env
POSTGRES_USER=wb_user
POSTGRES_PASSWORD=wb_pass
POSTGRES_DB=wb_analytics
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

REDIS_URL=redis://redis:6379/0

SECRET_KEY=super_secret_key_change_me
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

BACKEND_CORS_ORIGINS=http://localhost:5173

CELERY_BROKER_URL=redis://redis:6379/1
CELERY_RESULT_BACKEND=redis://redis:6379/2
```

2. Запуск:

```bash
docker-compose up --build
```

- Backend: http://localhost:8000
- Swagger: http://localhost:8000/docs
- Frontend: http://localhost:5173

## Функциональные модули (кратко)

### 1. Аутентификация

- Регистрация/логин пользователя.
- JWT (access + refresh).
- Middleware, защищающие API.

### 2. Управление API-ключами WB

- Страница настроек.
- CRUD API ключей.
- Шифрование в БД.

### 3. Загрузка себестоимости

- Upload CSV/XLSX с колонками:
  - `supplier_sku`
  - `cost`
- Валидация и сохранение в таблицу SkuCost.

### 4. Отчеты

Backend отдает аггрегированные данные по пользователю, frontend строит таблицы и графики.

- Прибыльность товаров:
  - выручка, себестоимость, логистика, комиссия, прибыль, маржа.
  - сортировка по рентабельности.
  - экспорт в Excel.
- Товары к выводу:
  - нулевая/низкая оборачиваемость
  - отрицательная прибыль.
- Управление остатками:
  - прогноз даты исчерпания по скорости продаж.
- Залежавшийся товар:
  - нет продаж более N дней.
- Динамика продаж:
  - графики по дням/неделям.
- ABC-анализ:
  - распределение по вкладу в выручку.

## Структура репозитория

- [`backend/app/main.py`](backend/app/main.py:1) — точка входа FastAPI
- [`backend/app/core/config.py`](backend/app/core/config.py:1) — настройки
- [`backend/app/core/security.py`](backend/app/core/security.py:1) — JWT и безопасность
- [`backend/app/db/session.py`](backend/app/db/session.py:1) — соединение с БД
- [`backend/app/models`](backend/app/models/__init__.py:1) — SQLAlchemy-модели
- [`backend/app/schemas`](backend/app/schemas/__init__.py:1) — Pydantic-схемы
- [`backend/app/api`](backend/app/api/__init__.py:1) — роуты (auth, users, wb, reports)
- [`backend/app/services`](backend/app/services/__init__.py:1) — бизнес-логика, работа с WB API
- [`backend/app/tasks`](backend/app/tasks/__init__.py:1) — Celery-задачи
- [`frontend/src`](frontend/src/main.tsx:1) — React-приложение
- [`docker-compose.yml`](docker-compose.yml:1) — оркестрация сервисов
- [`Dockerfile.backend`](Dockerfile.backend:1) — образ backend
- [`Dockerfile.frontend`](Dockerfile.frontend:1) — образ frontend

## Критерии из ТЗ

- SPA на React+TS — реализовано.
- Backend на FastAPI, PostgreSQL, Redis, Celery — реализовано.
- Безопасное хранение ключей и JWT — реализовано.
- Отчеты и сценарии (6 основных) — предусмотрены эндпоинты и UI.
- Обновление данных не реже 2 часов — через периодические Celery-задачи.
- Масштабируемость и контейнеризация — через Docker Compose.
