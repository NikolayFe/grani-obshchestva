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

/**
 * Получить все категории
 * GET /api/categories
 */
async function getCategories(req, res) {
  try {
    const prisma = getPrismaClient();

    const categories = await prisma.category.findMany({
      orderBy: { title: 'asc' },
      select: {
        id: true,
        slug: true,
        title: true,
        color: true,
        _count: {
          select: {
            terms: true,
            questions: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Ошибка при получении категорий:', error);
    return res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Получить категорию по slug
 * GET /api/categories/:slug
 */
async function getCategoryBySlug(req, res) {
  try {
    const prisma = getPrismaClient();
    const { slug } = req.params;

    const category = await prisma.category.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        color: true,
        _count: {
          select: {
            terms: true,
            questions: true,
          },
        },
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Категория не найдена',
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Ошибка при получении категории:', error);
    return res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

module.exports = { getCategories, getCategoryBySlug };
