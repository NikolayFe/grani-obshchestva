# API Testing

Сервер: `http://localhost:3000`
Тестовый пользователь: `a9553614-2e31-4429-ba7a-bd1206b93bc8`

---

## Health

### GET /health

Ответ `200`:
```json
{
  "success": true,
  "message": "Backend is running"
}
```

---

## Auth

### POST /api/auth/register

Body:
```json
{
  "email": "ivan@example.com",
  "password": "123456",
  "name": "Иван",
  "lastName": "Петров"
}
```

Ответ `201`:
```json
{
  "success": true,
  "user": {
    "id": "<uuid>",
    "email": "ivan@example.com",
    "name": "Иван",
    "lastName": "Петров"
  }
}
```

---

### POST /api/auth/login

Body:
```json
{
  "email": "test@test.com",
  "password": "123456"
}
```

Ответ `200`:
```json
{
  "success": true,
  "user": {
    "id": "<uuid>",
    "email": "test@test.com",
    "name": "Тест",
    "lastName": null,
    "xpTotal": 0,
    "streakDays": 0
  }
}
```

---

## Categories

### GET /api/categories

Ответ `200`:
```json
{
  "success": true,
  "data": [
    {
      "id": "<uuid>",
      "slug": "ekonomika",
      "title": "Экономика",
      "color": "#F97316",
      "_count": { "terms": 100, "questions": 100 }
    }
  ]
}
```

---

### GET /api/categories/:slug

Пример: `/api/categories/ekonomika`

Ответ `200`:
```json
{
  "success": true,
  "data": {
    "id": "<uuid>",
    "slug": "ekonomika",
    "title": "Экономика",
    "color": "#F97316"
  }
}
```

---

## Terms

### GET /api/terms

Query-параметры (все опциональны):
- `categorySlug=ekonomika` — только термины категории
- `isNew=true` — только новые термины

Ответ `200`:
```json
{
  "success": true,
  "data": [
    {
      "id": "<uuid>",
      "term": "ВВП",
      "definition": "Валовый внутренний продукт...",
      "isNew": false,
      "category": {
        "id": "<uuid>",
        "slug": "ekonomika",
        "title": "Экономика",
        "color": "#F97316"
      }
    }
  ],
  "total": 400
}
```

---

### GET /api/terms/:id

Ответ `200`:
```json
{
  "success": true,
  "data": {
    "id": "<uuid>",
    "term": "ВВП",
    "definition": "Валовый внутренний продукт...",
    "isNew": false,
    "category": { "id": "<uuid>", "slug": "ekonomika", "title": "Экономика", "color": "#F97316" }
  }
}
```

---

## Lives

### GET /api/lives?userId=<uuid>

Ответ `200`:
```json
{
  "success": true,
  "data": {
    "lives": 3,
    "maxLives": 3,
    "msToNextLife": 0,
    "nextLifeAt": null
  }
}
```

> Жизнь восстанавливается каждые 2 минуты (тестовый режим).
> `msToNextLife` = 0 когда жизни на максимуме.

---

### POST /api/lives/consume

Body:
```json
{ "userId": "<uuid>" }
```

Ответ `200`:
```json
{
  "success": true,
  "data": {
    "lives": 2,
    "maxLives": 3,
    "msToNextLife": 120000,
    "nextLifeAt": 1234567890000
  }
}
```

Ошибка `400` если жизней нет:
```json
{ "success": false, "message": "Нет жизней" }
```

---

### POST /api/lives/set

Body:
```json
{ "userId": "<uuid>", "lives": 3 }
```

Ответ `200`:
```json
{
  "success": true,
  "data": { "lives": 3, "maxLives": 3, "msToNextLife": 0, "nextLifeAt": null }
}
```

---

## Users

### GET /api/users/:userId

Ответ `200`:
```json
{
  "success": true,
  "data": {
    "id": "<uuid>",
    "email": "test@test.com",
    "name": "Тест",
    "lastName": null,
    "xpTotal": 0,
    "streakDays": 0,
    "livesCount": 3
  }
}
```

---

### GET /api/users/rating?period=week&userId=<uuid>

Query-параметры:
- `period` — `week` или `allTime` (по умолчанию)
- `userId` — UUID текущего пользователя (пометит `isCurrentUser: true`)

Ответ `200`:
```json
{
  "success": true,
  "data": {
    "period": "week",
    "summary": "Смотри, кто набрал больше всего XP за эту неделю.",
    "leaderboard": [
      {
        "id": "<uuid>",
        "place": 1,
        "name": "Иван П.",
        "xp": 1500,
        "streakDays": 7,
        "isCurrentUser": false
      }
    ]
  }
}
```

---

### POST /api/users/:userId/activity

Нет body. Записывает активность за сегодня и обновляет streak.

Ответ `200`:
```json
{ "success": true }
```

---

### GET /api/users/:userId/activity?period=week

Query-параметры:
- `period` — `week` (7 дней, по умолчанию) или `month` (4 недели)

Ответ `200` (period=week):
```json
{
  "success": true,
  "data": {
    "mode": "week",
    "activeDays": 3,
    "totalDays": 7,
    "streak": 2,
    "days": [
      { "id": 1, "label": "Пн", "active": true, "current": false },
      { "id": 7, "label": "Вс", "active": true, "current": true }
    ]
  }
}
```

Ответ `200` (period=month):
```json
{
  "success": true,
  "data": {
    "mode": "month",
    "activeDays": 12,
    "totalDays": 30,
    "streak": 2,
    "weeks": [
      { "week": 1, "activeDays": 3, "days": [true, false, true, false, false, false, false] }
    ]
  }
}
```

---

## Progress — Глоссарий

### GET /api/progress/glossary?userId=<uuid>

Ответ `200`:
```json
{
  "success": true,
  "data": { "learnedTermIds": ["<uuid>", "<uuid>"] }
}
```

---

### POST /api/progress/glossary

Body:
```json
{ "userId": "<uuid>", "termIds": ["<uuid>", "<uuid>"] }
```

Ответ `200`:
```json
{ "success": true, "data": { "saved": 2 } }
```

---

### DELETE /api/progress/glossary/category

Body:
```json
{ "userId": "<uuid>", "categorySlug": "ekonomika" }
```

Ответ `200`:
```json
{ "success": true }
```

---

### DELETE /api/progress/glossary

Body:
```json
{ "userId": "<uuid>" }
```

Ответ `200`:
```json
{ "success": true }
```

---

## Progress — Тесты

### GET /api/progress/tests/questions?categorySlug=ekonomika&stageKey=basic_1

Query-параметры:
- `categorySlug` — обязателен
- `stageKey` — `basic_1`, `basic_2` или `final_3`

Ответ `200`:
```json
{
  "success": true,
  "data": {
    "stageKey": "basic_1",
    "questionCount": 25,
    "questions": [
      {
        "id": "<uuid>",
        "text": "Что такое ВВП?",
        "options": [
          { "id": "<uuid>", "text": "Валовый внутренний продукт", "isCorrect": true },
          { "id": "<uuid>", "text": "Другой вариант", "isCorrect": false }
        ]
      }
    ]
  }
}
```

---

### POST /api/progress/tests/stage

Body:
```json
{
  "userId": "<uuid>",
  "categorySlug": "ekonomika",
  "stageKey": "basic_1",
  "score": 22,
  "totalQuestions": 25
}
```

> `passed` = true если score/totalQuestions >= 80%.
> Веса этапов: `basic_1` = 5, `basic_2` = 5, `final_3` = 40 (максимум 50 на категорию).

Ответ `200`:
```json
{
  "success": true,
  "data": {
    "categorySlug": "ekonomika",
    "passed": true,
    "score": 22,
    "percent": 88,
    "testsProgressPercent": 5,
    "stages": [
      {
        "stageKey": "basic_1",
        "title": "Тест 1",
        "difficulty": 1,
        "questionCount": 25,
        "minPercent": 80,
        "weightPercent": 5,
        "passed": true,
        "score": 22,
        "totalQuestions": 25,
        "completedAt": "2025-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

### GET /api/progress/tests/stage?userId=<uuid>&categorySlug=ekonomika

Ответ `200`:
```json
{
  "success": true,
  "data": {
    "categorySlug": "ekonomika",
    "categoryTitle": "Экономика",
    "testsProgressPercent": 10,
    "passedStages": 2,
    "totalStages": 3,
    "stages": [
      {
        "stageKey": "basic_1",
        "title": "Тест 1",
        "difficulty": 1,
        "questionCount": 25,
        "minPercent": 80,
        "weightPercent": 5,
        "passed": true,
        "score": 22,
        "totalQuestions": 25,
        "completedAt": "2025-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

### POST /api/progress/tests/answer

Body:
```json
{
  "userId": "<uuid>",
  "questionId": "<uuid>",
  "selectedOptionId": "<uuid>"
}
```

Ответ `200`:
```json
{
  "success": true,
  "data": { "isCorrect": true, "correctOptionId": "<uuid>" }
}
```

---

### GET /api/progress/tests/category?userId=<uuid>&categorySlug=ekonomika

Ответ `200`:
```json
{
  "success": true,
  "data": {
    "categorySlug": "ekonomika",
    "categoryTitle": "Экономика",
    "totalQuestions": 100,
    "answeredQuestions": 50,
    "correctAnswers": 44,
    "progressPercent": 10,
    "testsProgressPercent": 10,
    "stages": []
  }
}
```

---

### GET /api/progress/tests/summary?userId=<uuid>

Ответ `200`:
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "categorySlug": "ekonomika",
        "categoryTitle": "Экономика",
        "totalQuestions": 100,
        "answeredQuestions": 50,
        "correctAnswers": 44,
        "progressPercent": 10,
        "testsProgressPercent": 10,
        "stages": []
      }
    ],
    "totals": {
      "totalQuestions": 400,
      "answeredQuestions": 50,
      "correctAnswers": 44,
      "overallProgressPercent": 3
    }
  }
}
```

---

### GET /api/progress/overall?userId=<uuid>

Считает **50% глоссарий + 50% тесты** по всем 4 категориям.

Ответ `200`:
```json
{
  "success": true,
  "data": {
    "overallPercent": 2,
    "categoriesTotal": 4,
    "categoriesDone": 0,
    "modulesLeft": 4,
    "currentCategorySlug": "grazhdanskoe-pravo",
    "currentCategoryTitle": "Гражданское право"
  }
}
```

> `categoriesDone` — категории где все 3 этапа теста пройдены.
> `currentCategorySlug` — первая незавершённая категория.

---

## Сводная таблица

| Метод | URL | Описание |
|-------|-----|----------|
| `GET` | `/health` | Проверка сервера |
| `POST` | `/api/auth/register` | Регистрация |
| `POST` | `/api/auth/login` | Вход |
| `GET` | `/api/categories` | Все категории |
| `GET` | `/api/categories/:slug` | Категория по slug |
| `GET` | `/api/terms` | Термины (фильтры: categorySlug, isNew) |
| `GET` | `/api/terms/:id` | Термин по ID |
| `GET` | `/api/lives` | Жизни пользователя |
| `POST` | `/api/lives/consume` | Списать жизнь |
| `POST` | `/api/lives/set` | Установить жизни (отладка) |
| `GET` | `/api/users/:userId` | Профиль пользователя |
| `GET` | `/api/users/rating` | Рейтинг (period, userId) |
| `POST` | `/api/users/:userId/activity` | Записать активность сегодня |
| `GET` | `/api/users/:userId/activity` | Данные активности (period) |
| `GET` | `/api/progress/glossary` | Выученные термины |
| `POST` | `/api/progress/glossary` | Сохранить выученные термины |
| `DELETE` | `/api/progress/glossary/category` | Сбросить прогресс категории |
| `DELETE` | `/api/progress/glossary` | Сбросить весь прогресс глоссария |
| `GET` | `/api/progress/tests/questions` | Вопросы теста (categorySlug, stageKey) |
| `POST` | `/api/progress/tests/stage` | Сохранить результат этапа |
| `GET` | `/api/progress/tests/stage` | Прогресс этапов категории |
| `POST` | `/api/progress/tests/answer` | Сохранить ответ |
| `GET` | `/api/progress/tests/category` | Прогресс тестов одной категории |
| `GET` | `/api/progress/tests/summary` | Сводка тестов всех категорий |
| `GET` | `/api/progress/overall` | Общий прогресс по всем модулям |