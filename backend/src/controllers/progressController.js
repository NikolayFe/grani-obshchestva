process.env.PRISMA_CLIENT_ENGINE_TYPE = process.env.PRISMA_CLIENT_ENGINE_TYPE || 'library';

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

let prismaClient;

function getPrismaClient() {
  if (!prismaClient) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    const adapter = new PrismaPg(pool);
    prismaClient = new PrismaClient({ adapter });
  }
  return prismaClient;
}

function isValidUUID(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

/**
 * Получить список выученных терминов пользователя
 * GET /api/progress/glossary?userId=...
 */
async function getGlossaryProgress(req, res) {
  try {
    const { userId } = req.query;

    if (!userId || !isValidUUID(userId)) {
      return res.status(400).json({
        success: false,
        message: 'userId обязателен и должен быть валидным UUID',
      });
    }

    const prisma = getPrismaClient();

    const progress = await prisma.userTermProgress.findMany({
      where: { userId },
      select: { termId: true, learnedAt: true },
      orderBy: { learnedAt: 'asc' },
    });

    return res.status(200).json({
      success: true,
      data: progress.map((p) => p.termId),
      total: progress.length,
    });
  } catch (error) {
    console.error('Ошибка при получении прогресса глоссария:', error);
    return res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Сохранить выученные термины пользователя
 * POST /api/progress/glossary
 * Body: { userId: string, termIds: string[] }
 */
async function saveGlossaryProgress(req, res) {
  try {
    const { userId, termIds } = req.body;

    if (!userId || !isValidUUID(userId)) {
      return res.status(400).json({
        success: false,
        message: 'userId обязателен и должен быть валидным UUID',
      });
    }

    if (!Array.isArray(termIds) || termIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'termIds должен быть непустым массивом',
      });
    }

    const invalidIds = termIds.filter((id) => !isValidUUID(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Обнаружены некорректные termId',
      });
    }

    const prisma = getPrismaClient();

    // Проверяем, что пользователь существует
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден',
      });
    }

    // Upsert всех терминов одним запросом (createMany игнорирует дубликаты через skipDuplicates)
    const result = await prisma.userTermProgress.createMany({
      data: termIds.map((termId) => ({ userId, termId })),
      skipDuplicates: true,
    });

    return res.status(200).json({
      success: true,
      saved: result.count,
      message: `Сохранено ${result.count} новых терминов`,
    });
  } catch (error) {
    console.error('Ошибка при сохранении прогресса глоссария:', error);
    return res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Сбросить прогресс глоссария пользователя
 * DELETE /api/progress/glossary
 * Body: { userId: string }
 */
async function clearGlossaryProgress(req, res) {
  try {
    const { userId } = req.body;

    if (!userId || !isValidUUID(userId)) {
      return res.status(400).json({
        success: false,
        message: 'userId обязателен и должен быть валидным UUID',
      });
    }

    const prisma = getPrismaClient();

    const result = await prisma.userTermProgress.deleteMany({ where: { userId } });

    return res.status(200).json({
      success: true,
      deleted: result.count,
      message: `Сброшено ${result.count} терминов`,
    });
  } catch (error) {
    console.error('Ошибка при сбросе прогресса глоссария:', error);
    return res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

module.exports = { getGlossaryProgress, saveGlossaryProgress, clearGlossaryProgress };
