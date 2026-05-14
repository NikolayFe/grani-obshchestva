# API Testing (кратко)

## 1) Запуск

```powershell
Set-Location "C:\Users\Tuchka\Desktop\Тренажёр по обществознанию\mobile-app\backend"
npm run dev
```

Важно: копируй только команды, без префикса приглашения вида `PS C:\...>`.

Сервер: `http://localhost:3000`

## 2) Остановка

Если сервер запущен в текущем окне терминала:

- Нажми `Ctrl + C`

Если сервер запущен в фоне и `Ctrl + C` не помогает:

```powershell
$connections = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($connections) {
  $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique | Where-Object { $_ -ne 0 }
  $pids | ForEach-Object { Stop-Process -Id $_ -Force }
}
```

## 3) Проверка health

```bash
Invoke-RestMethod http://localhost:3000/health
```

Если команда не отвечает, сначала проверь, что сервер запущен в этом же каталоге: `npm run dev`.

Быстрый вариант одной командой (запуск + health + остановка):

```powershell
Start-Job -ScriptBlock { Set-Location "C:\Users\Tuchka\Desktop\Тренажёр по обществознанию\mobile-app\backend"; npm run dev }; Start-Sleep -Seconds 8; Invoke-RestMethod -Uri http://localhost:3000/health; Get-Job | Stop-Job; Get-Job | Remove-Job
```

## 4) Регистрация

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"ivan@example.com","password":"password123","name":"Иван","lastName":"Петров"}'
```

Ожидается: `201` и `success: true`.

## 5) Вход

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ivan@example.com","password":"password123"}'
```

Ожидается: `200` и `success: true`.

## 6) Быстрые проверки ошибок

- Короткий пароль при регистрации: ожидается `400`.
- Повторная регистрация того же email: ожидается `409`.
- Неверный пароль при входе: ожидается `401`.

## 7) Коротко для Postman

1. Создай Collection: `Backend Auth`.
2. Добавь переменную коллекции: `baseUrl = http://localhost:3000`.
3. Создай 3 запроса для авторизации:

### Health

- Method: `GET`
- URL: `{{baseUrl}}/health`

### Register

- Method: `POST`
- URL: `{{baseUrl}}/api/auth/register`
- Headers: `Content-Type: application/json`
- Body (raw JSON):

```json
{
  "email": "ivan@example.com",
  "password": "password123",
  "name": "Иван",
  "lastName": "Петров"
}
```

Ожидается: `201`, `success: true`.

### Login

- Method: `POST`
- URL: `{{baseUrl}}/api/auth/login`
- Headers: `Content-Type: application/json`
- Body (raw JSON):

```json
{
  "email": "ivan@example.com",
  "password": "password123"
}
```

Ожидается: `200`, `success: true`.

4. Добавь ещё 4 запроса для проверки категорий и терминов:

### Categories

- Method: `GET`
- URL: `{{baseUrl}}/api/categories`

### Category by slug

- Method: `GET`
- URL: `{{baseUrl}}/api/categories/ekonomika`

### Terms

- Method: `GET`
- URL: `{{baseUrl}}/api/terms`

### Terms by category

- Method: `GET`
- URL: `{{baseUrl}}/api/terms?categorySlug=ekonomika`

### New terms only

- Method: `GET`
- URL: `{{baseUrl}}/api/terms?isNew=true`

Для удобства в Postman можно назвать их так:

- `GET Health`
- `POST Register`
- `POST Login`
- `GET Categories`
- `GET Category By Slug`
- `GET Terms`
- `GET Terms By Category`
- `GET New Terms`

## 8) Проверка категорий и терминов

### Список категорий

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/categories" -Method GET
```

Ожидается: `200`, список из 4 категорий и поле `_count.terms` у каждой.

### Категория по slug

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/categories/ekonomika" -Method GET
```

Ожидается: `200`, объект категории `Экономика`.

### Все термины

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/terms" -Method GET
```

Ожидается: `200`, `total: 400`.

### Термины по категории

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/terms?categorySlug=ekonomika" -Method GET
```

Ожидается: `200`, `total: 100`, и все термины с категорией `Экономика`.

### Только новые термины

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/terms?isNew=true" -Method GET
```

Ожидается: `200`, `total: 20`.

## 9) Быстрый набор проверок одной командой

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/" -Method GET;
Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET;
Invoke-RestMethod -Uri "http://localhost:3000/api/categories" -Method GET;
Invoke-RestMethod -Uri "http://localhost:3000/api/categories/ekonomika" -Method GET;
Invoke-RestMethod -Uri "http://localhost:3000/api/terms?categorySlug=ekonomika" -Method GET;
Invoke-RestMethod -Uri "http://localhost:3000/api/terms?isNew=true" -Method GET
```
