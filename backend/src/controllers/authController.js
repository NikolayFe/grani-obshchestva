process.env.PRISMA_CLIENT_ENGINE_TYPE = process.env.PRISMA_CLIENT_ENGINE_TYPE || 'library';

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

let prismaClient;

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getPrismaClient() {
  if (!prismaClient) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const adapter = new PrismaPg(pool);

    prismaClient = new PrismaClient({
      adapter,
    });
  }

  return prismaClient;
}

/**
 * Регистрация нового пользователя
 * POST /api/auth/register
 * Body: { email, password, name, lastName }
 */
async function register(req, res) {
  try {
    const prisma = getPrismaClient();
    const { email, password, name, lastName } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    // Валидация входных данных
    if (!normalizedEmail || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password и name являются обязательными полями',
      });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Некорректный формат email',
      });
    }

    // Проверка минимальной длины пароля
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Пароль должен содержать минимум 6 символов',
      });
    }

    // Проверка, не существует ли уже пользователь с таким email
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Пользователь с таким email уже зарегистрирован',
      });
    }

    // Создание нового пользователя
    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password,
        name,
        lastName: lastName || null,
        createdAt: new Date(),
        xpTotal: 0,
        streakDays: 0,
        lastActivityDate: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        lastName: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Регистрация успешна',
      user: newUser,
    });
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    return res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Вход пользователя
 * POST /api/auth/login
 * Body: { email, password }
 */
async function login(req, res) {
  try {
    const prisma = getPrismaClient();
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    // Валидация входных данных
    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email и password являются обязательными полями',
      });
    }

    // Поиск пользователя
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        lastName: true,
        password: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Неверный email или пароль',
      });
    }

    // Проверка пароля
    const passwordMatch = user.password === password;

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Неверный email или пароль',
      });
    }

    // Удаление пароля из ответа
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      message: 'Вход выполнен успешно',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Ошибка при входе:', error);
    return res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

module.exports = {
  register,
  login,
};
