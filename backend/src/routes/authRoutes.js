const express = require('express');
const { register, login } = require('../controllers/authController');

const router = express.Router();

/**
 * POST /api/auth/register
 * Регистрация нового пользователя
 */
router.post('/register', register);

/**
 * POST /api/auth/login
 * Вход существующего пользователя
 */
router.post('/login', login);

module.exports = router;
