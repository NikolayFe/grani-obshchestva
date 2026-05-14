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
 * Получить термины (опционально фильтр по категории)
 * GET /api/terms
 * Query: ?categorySlug=ekonomika&isNew=true
 */
async function getTerms(req, res) {
  try {
    const prisma = getPrismaClient();
    const { categorySlug, isNew } = req.query;

    const where = {};

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (isNew === 'true') {
      where.isNew = true;
    }

    const terms = await prisma.term.findMany({
      where,
      orderBy: { term: 'asc' },
      select: {
        id: true,
        term: true,
        definition: true,
        isNew: true,
        category: {
          select: {
            id: true,
            slug: true,
            title: true,
            color: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: terms,
      total: terms.length,
    });
  } catch (error) {
    console.error('Ошибка при получении терминов:', error);
    return res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Получить термин по ID
 * GET /api/terms/:id
 */
async function getTermById(req, res) {
  try {
    const prisma = getPrismaClient();
    const { id } = req.params;

    const term = await prisma.term.findUnique({
      where: { id },
      select: {
        id: true,
        term: true,
        definition: true,
        isNew: true,
        category: {
          select: {
            id: true,
            slug: true,
            title: true,
            color: true,
          },
        },
      },
    });

    if (!term) {
      return res.status(404).json({
        success: false,
        message: 'Термин не найден',
      });
    }

    return res.status(200).json({
      success: true,
      data: term,
    });
  } catch (error) {
    console.error('Ошибка при получении термина:', error);
    return res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

module.exports = { getTerms, getTermById };
