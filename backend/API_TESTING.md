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
3. Создай 3 запроса:

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
