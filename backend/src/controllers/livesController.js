process.env.PRISMA_CLIENT_ENGINE_TYPE = process.env.PRISMA_CLIENT_ENGINE_TYPE || 'library';

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const DAILY_LIVES_MAX = 3;
const DAILY_LIFE_RESTORE_MS = 2 * 60 * 1000; // 2 минуты (тестовый режим)

let prismaClient;

function getPrismaClient() {
  if (!prismaClient) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    prismaClient = new PrismaClient({ adapter });
  }
  return prismaClient;
}

function isValidUUID(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

/**
 * Рассчитывает сколько жизней должно восстановиться, начиная с lastUpdatedAt.
 * Возвращает новый livesCount и новый livesLastUpdatedAt.
 */
function applyRegeneration(livesCount, livesLastUpdatedAt, now) {
  if (livesCount >= DAILY_LIVES_MAX) {
    return { livesCount: DAILY_LIVES_MAX, livesLastUpdatedAt };
  }

  const elapsed = Math.max(0, now - livesLastUpdatedAt.getTime());
  const restoredLives = Math.floor(elapsed / DAILY_LIFE_RESTORE_MS);

  if (restoredLives <= 0) {
    return { livesCount, livesLastUpdatedAt };
  }

  const canRestore = DAILY_LIVES_MAX - livesCount;
  const actualRestored = Math.min(restoredLives, canRestore);
  const newLives = livesCount + actualRestored;
  const advancedBy = actualRestored * DAILY_LIFE_RESTORE_MS;
  const newLastUpdatedAt = new Date(livesLastUpdatedAt.getTime() + advancedBy);

  return { livesCount: newLives, livesLastUpdatedAt: newLastUpdatedAt };
}

/**
 * Формирует ответ в формате DailyLivesStatus.
 */
function toStatusResponse(livesCount, livesLastUpdatedAt, now) {
  if (livesCount >= DAILY_LIVES_MAX) {
    return {
      lives: DAILY_LIVES_MAX,
      maxLives: DAILY_LIVES_MAX,
      msToNextLife: 0,
      nextLifeAt: null,
    };
  }

  const elapsed = Math.max(0, now - livesLastUpdatedAt.getTime());
  const remainder = elapsed % DAILY_LIFE_RESTORE_MS;
  const msToNextLife = DAILY_LIFE_RESTORE_MS - remainder;

  return {
    lives: livesCount,
    maxLives: DAILY_LIVES_MAX,
    msToNextLife,
    nextLifeAt: now + msToNextLife,
  };
}

/**
 * Получить текущий статус жизней.
 * GET /api/lives?userId=...
 */
async function getLives(req, res) {
  try {
    const { userId } = req.query;

    if (!userId || !isValidUUID(userId)) {
      return res.status(400).json({
        success: false,
        message: 'userId обязателен и должен быть валидным UUID',
      });
    }

    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { livesCount: true, livesLastUpdatedAt: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Пользователь не найден' });
    }

    const now = Date.now();
    const regenerated = applyRegeneration(user.livesCount, user.livesLastUpdatedAt, now);

    // Сохраняем в БД если произошло восстановление
    if (
      regenerated.livesCount !== user.livesCount ||
      regenerated.livesLastUpdatedAt.getTime() !== user.livesLastUpdatedAt.getTime()
    ) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          livesCount: regenerated.livesCount,
          livesLastUpdatedAt: regenerated.livesLastUpdatedAt,
        },
      });
    }

    const status = toStatusResponse(regenerated.livesCount, regenerated.livesLastUpdatedAt, now);
    return res.status(200).json({ success: true, data: status });
  } catch (error) {
    console.error('Ошибка при получении жизней:', error);
    return res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
}

/**
 * Списать одну жизнь.
 * POST /api/lives/consume
 * Body: { userId }
 */
async function consumeLife(req, res) {
  try {
    const { userId } = req.body;

    if (!userId || !isValidUUID(userId)) {
      return res.status(400).json({
        success: false,
        message: 'userId обязателен и должен быть валидным UUID',
      });
    }

    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { livesCount: true, livesLastUpdatedAt: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Пользователь не найден' });
    }

    const now = Date.now();
    const regenerated = applyRegeneration(user.livesCount, user.livesLastUpdatedAt, now);

    const newLives = Math.max(0, regenerated.livesCount - 1);
    const newLastUpdatedAt = new Date(now);

    await prisma.user.update({
      where: { id: userId },
      data: { livesCount: newLives, livesLastUpdatedAt: newLastUpdatedAt },
    });

    const status = toStatusResponse(newLives, newLastUpdatedAt, now);
    return res.status(200).json({ success: true, data: status });
  } catch (error) {
    console.error('Ошибка при списании жизни:', error);
    return res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
}

/**
 * Установить жизни в конкретное значение.
 * POST /api/lives/set
 * Body: { userId, lives }
 */
async function setLivesCount(req, res) {
  try {
    const { userId, lives } = req.body;

    if (!userId || !isValidUUID(userId)) {
      return res.status(400).json({
        success: false,
        message: 'userId обязателен и должен быть валидным UUID',
      });
    }

    if (typeof lives !== 'number' || lives < 0 || lives > DAILY_LIVES_MAX) {
      return res.status(400).json({
        success: false,
        message: `lives должно быть числом от 0 до ${DAILY_LIVES_MAX}`,
      });
    }

    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Пользователь не найден' });
    }

    const now = Date.now();
    const newLastUpdatedAt = new Date(now);

    await prisma.user.update({
      where: { id: userId },
      data: { livesCount: lives, livesLastUpdatedAt: newLastUpdatedAt },
    });

    const status = toStatusResponse(lives, newLastUpdatedAt, now);
    return res.status(200).json({ success: true, data: status });
  } catch (error) {
    console.error('Ошибка при установке жизней:', error);
    return res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
}

module.exports = { getLives, consumeLife, setLivesCount };
