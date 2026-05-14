const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Маршруты
try {
	const authRoutes = require('./routes/authRoutes');
	app.use('/api/auth', authRoutes);
} catch (error) {
	console.error('Auth routes не загружены:', error.message);
}

// Проверка здоровья сервера
app.get('/health', (req, res) => {
	res.status(200).json({
		success: true,
		message: 'Backend is running',
		timestamp: new Date().toISOString(),
	});
});

// Маршрут по умолчанию
app.get('/', (req, res) => {
	res.status(200).json({
		success: true,
		message: 'Grani Obshchestva Backend API',
		version: '1.0.0',
		endpoints: {
			health: 'GET /health',
			register: 'POST /api/auth/register',
			login: 'POST /api/auth/login',
		},
	});
});

// Обработка 404
app.use((req, res) => {
	res.status(404).json({
		success: false,
		message: 'Маршрут не найден',
	});
});

// Обработка ошибок
app.use((err, req, res, next) => {
	console.error('Ошибка:', err);
	res.status(err.status || 500).json({
		success: false,
		message: err.message || 'Внутренняя ошибка сервера',
	});
});

// Запуск сервера
app.listen(PORT, () => {
	console.log(`Backend сервер запущен на http://localhost:${PORT}`);
	console.log(`Окружение: ${process.env.NODE_ENV || 'development'}`);
});
