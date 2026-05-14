# API Testing

Сервер: `http://localhost:3000`

Ниже у каждого эндпоинта один формат:
- запрос
- body, если нужен
- правильный ответ

---

## 1. Health

### Проверка сервера

Запрос:
`GET http://localhost:3000/health`

Правильный ответ `200`:
```json
{
  "success": true,
  "message": "Backend is running"
}
```

---

## 2. Auth

### Регистрация

Запрос:
`POST http://localhost:3000/api/auth/register`

Body:
```json
{
  "email": "ivan@example.com",
  "password": "123456",
  "name": "Иван",
  "lastName": "Петров"
}
```

Правильный ответ `201`:
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

### Вход

Запрос:
`POST http://localhost:3000/api/auth/login`

Body:
```json
{
  "email": "1",
  "password": "1"
}
```

Правильный ответ `200`:
```json
{
  "success": true,
  "user": {
    "id": "1f501552-69ea-4c1d-8e76-23bef11163af",
    "email": "1",
    "name": "Иван",
    "lastName": "Петров"
  }
}
```

---

## 3. Categories

### Все категории

Запрос:
`GET http://localhost:3000/api/categories`

Правильный ответ `200`:
```json
{
  "success": true,
  "data": [
    {
      "id": "<uuid>",
      "slug": "ekonomika",
      "title": "Экономика",
      "color": "#...",
      "_count": {
        "terms": 100,
        "questions": 0
      }
    }
  ]
}
```

### Категория по slug

Запрос:
`GET http://localhost:3000/api/categories/ekonomika`

Правильный ответ `200`:
```json
{
  "success": true,
  "data": {
    "id": "<uuid>",
    "slug": "ekonomika",
    "title": "Экономика",
    "color": "#..."
  }
}
```

---

## 4. Terms

### Все термины

Запрос:
`GET http://localhost:3000/api/terms`

Правильный ответ `200`:
```json
{
  "success": true,
  "data": [
    {
      "id": "<termId>",
      "term": "...",
      "definition": "...",
      "isNew": false,
      "category": {
        "id": "<categoryId>",
        "slug": "ekonomika",
        "title": "Экономика",
        "color": "#..."
      }
    }
  ],
  "total": 400
}
```

### Термины по категории

Запрос:
`GET http://localhost:3000/api/terms?categorySlug=ekonomika`

Правильный ответ `200`:
```json
{
  "success": true,
  "data": [
    {
      "id": "<termId>",
      "category": {
        "slug": "ekonomika",
        "title": "Экономика"
      }
    }
  ],
  "total": 100
}
```

### Только новые термины

Запрос:
`GET http://localhost:3000/api/terms?isNew=true`

Правильный ответ `200`:
```json
{
  "success": true,
  "data": [
    {
      "id": "<termId>",
      "isNew": true
    }
  ],
  "total": 20
}
```

---

## 5. Progress / Glossary

Для этих запросов нужен:
- `userId`: `1f501552-69ea-4c1d-8e76-23bef11163af`
- `termId` из `GET /api/terms`

### Получить весь прогресс

Запрос:
`GET http://localhost:3000/api/progress/glossary?userId=1f501552-69ea-4c1d-8e76-23bef11163af`

Правильный ответ `200`, если прогресс пустой:
```json
{
  "success": true,
  "data": [],
  "total": 0
}
```

### Сохранить выученные термины

Запрос:
`POST http://localhost:3000/api/progress/glossary`

Body:
```json
{
  "userId": "1f501552-69ea-4c1d-8e76-23bef11163af",
  "termIds": ["<termId1>", "<termId2>"]
}
```

Правильный ответ `200`:
```json
{
  "success": true,
  "saved": 2,
  "message": "Сохранено 2 новых терминов"
}
```

Если отправить те же `termIds` ещё раз, правильный ответ такой:
```json
{
  "success": true,
  "saved": 0,
  "message": "Сохранено 0 новых терминов"
}
```

### Сбросить весь прогресс

Запрос:
`DELETE http://localhost:3000/api/progress/glossary`

Body:
```json
{
  "userId": "1f501552-69ea-4c1d-8e76-23bef11163af"
}
```

Правильный ответ `200`:
```json
{
  "success": true,
  "deleted": 2,
  "message": "Сброшено 2 терминов"
}
```

### Сбросить прогресс по одной теме

Запрос:
`DELETE http://localhost:3000/api/progress/glossary/category`

Body:
```json
{
  "userId": "1f501552-69ea-4c1d-8e76-23bef11163af",
  "categorySlug": "ekonomika"
}
```

Правильный ответ `200`:
```json
{
  "success": true,
  "deleted": 2,
  "categorySlug": "ekonomika",
  "message": "Сброшено 2 терминов по теме Экономика"
}
```

---

## 6. Ошибки

### Невалидный userId

Запрос:
`GET http://localhost:3000/api/progress/glossary?userId=не-uuid`

Правильный ответ `400`:
```json
{
  "success": false,
  "message": "userId обязателен и должен быть валидным UUID"
}
```

### Несуществующий userId

Запрос:
`POST http://localhost:3000/api/progress/glossary`

Body:
```json
{
  "userId": "00000000-0000-0000-0000-000000000000",
  "termIds": ["00000000-0000-0000-0000-000000000001"]
}
```

Правильный ответ `404`:
```json
{
  "success": false,
  "message": "Пользователь не найден"
}
```

### Несуществующая категория при сбросе по теме

Запрос:
`DELETE http://localhost:3000/api/progress/glossary/category`

Body:
```json
{
  "userId": "1f501552-69ea-4c1d-8e76-23bef11163af",
  "categorySlug": "unknown-category"
}
```

Правильный ответ `404`:
```json
{
  "success": false,
  "message": "Категория не найдена"
}
```

### Email уже занят

Запрос:
`POST http://localhost:3000/api/auth/register`

Body:
```json
{
  "email": "ivan@example.com",
  "password": "123456",
  "name": "Иван"
}
```

Правильный ответ `409`:
```json
{
  "success": false,
  "message": "Пользователь с таким email уже существует"
}
```

### Неверный пароль

Запрос:
`POST http://localhost:3000/api/auth/login`

Body:
```json
{
  "email": "1",
  "password": "wrong-password"
}
```

Правильный ответ `401`:
```json
{
  "success": false,
  "message": "Неверный email или пароль"
}
```

### Слишком короткий пароль

Запрос:
`POST http://localhost:3000/api/auth/register`

Body:
```json
{
  "email": "short@test.com",
  "password": "123",
  "name": "Тест"
}
```

Правильный ответ `400`:
```json
{
  "success": false,
  "message": "Пароль должен содержать минимум 6 символов"
}
```

---

## 7. Данные для ручного теста прогресса по теме

### Шаг 1. Получить userId

Сначала зарегистрируй пользователя:

Запрос:
`POST http://localhost:3000/api/auth/register`

Body:
```json
{
  "email": "ivan@example.com",
  "password": "123456",
  "name": "Иван",
  "lastName": "Петров"
}
```

Для уже существующего тестового пользователя используй логин:

Запрос:
`POST http://localhost:3000/api/auth/login`

Body:
```json
{
  "email": "1",
  "password": "1"
}
```

Из ответа возьми:
```json
{
  "user": {
    "id": "1f501552-69ea-4c1d-8e76-23bef11163af"
  }
}
```

### Шаг 2. Получить termId одной темы

Запрос:
`GET http://localhost:3000/api/terms?categorySlug=ekonomika`

Из ответа возьми 2 любых `id`:
```json
{
  "data": [
    { "id": "<termId1>" },
    { "id": "<termId2>" }
  ]
}
```

### Шаг 3. Сохранить прогресс по теме

Запрос:
`POST http://localhost:3000/api/progress/glossary`

Body:
```json
{
  "userId": "1f501552-69ea-4c1d-8e76-23bef11163af",
  "termIds": ["<termId1>", "<termId2>"]
}
```

Правильный ответ `200`:
```json
{
  "success": true,
  "saved": 2,
  "message": "Сохранено 2 новых терминов"
}
```

### Шаг 4. Сбросить только тему

Запрос:
`DELETE http://localhost:3000/api/progress/glossary/category`

Body:
```json
{
  "userId": "1f501552-69ea-4c1d-8e76-23bef11163af",
  "categorySlug": "ekonomika"
}
```

Правильный ответ `200`:
```json
{
  "success": true,
  "deleted": 2,
  "categorySlug": "ekonomika",
  "message": "Сброшено 2 терминов по теме Экономика"
}
```

### Шаг 5. Проверить остаток прогресса

Запрос:
`GET http://localhost:3000/api/progress/glossary?userId=1f501552-69ea-4c1d-8e76-23bef11163af`

Если у пользователя были выучены только эти 2 термина, правильный ответ:
```json
{
  "success": true,
  "data": [],
  "total": 0
}
```

---

## 8. Progress / Tests By Category

Для этих запросов нужен:
- `userId`: `1f501552-69ea-4c1d-8e76-23bef11163af`
- `categorySlug` (например, `ekonomika`)
- `questionId` и `selectedOptionId` из категории

Важно:
- у каждого тестового вопроса обязательно должно быть ровно `4` варианта ответа

### Получить questionId и selectedOptionId

Возьми `questionId` и `selectedOptionId` из текущего фронтового теста
или через Prisma Studio (`Question` + `QuestionOption`).

### Сохранить ответ пользователя

Запрос:
`POST http://localhost:3000/api/progress/tests/answer`

Body:
```json
{
  "userId": "1f501552-69ea-4c1d-8e76-23bef11163af",
  "questionId": "<questionId>",
  "selectedOptionId": "<selectedOptionId>"
}
```

Правильный ответ `200`:
```json
{
  "success": true,
  "data": {
    "answerId": "<uuid>",
    "isCorrect": true,
    "answeredAt": "2026-05-14T...",
    "categorySlug": "ekonomika",
    "categoryTitle": "Экономика"
  },
  "message": "Ответ сохранён: верно"
}
```

### Получить прогресс по одной категории

Запрос:
`GET http://localhost:3000/api/progress/tests/category?userId=1f501552-69ea-4c1d-8e76-23bef11163af&categorySlug=ekonomika`

Правильный ответ `200`:
```json
{
  "success": true,
  "data": {
    "categorySlug": "ekonomika",
    "categoryTitle": "Экономика",
    "totalQuestions": 100,
    "answeredQuestions": 12,
    "correctAnswers": 9,
    "progressPercent": 9
  }
}
```

### Получить общий прогресс тестов по всем категориям

Запрос:
`GET http://localhost:3000/api/progress/tests/summary?userId=1f501552-69ea-4c1d-8e76-23bef11163af`

Правильный ответ `200`:
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "categorySlug": "ekonomika",
        "categoryTitle": "Экономика",
        "totalQuestions": 100,
        "answeredQuestions": 12,
        "correctAnswers": 9,
        "progressPercent": 9
      }
    ],
    "totals": {
      "totalQuestions": 400,
      "answeredQuestions": 37,
      "correctAnswers": 26,
      "overallProgressPercent": 7
    }
  }
}
```

### Ошибки для тестового прогресса

Невалидный `userId`:
```json
{
  "success": false,
  "message": "userId обязателен и должен быть валидным UUID"
}
```

Вопрос с некорректным количеством вариантов:
```json
{
  "success": false,
  "message": "Для тестового вопроса должно быть ровно 4 варианта ответа"
}
```

Неизвестная категория:
```json
{
  "success": false,
  "message": "Категория не найдена"
}
```

