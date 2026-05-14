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

function shuffleArray(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
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

/**
 * Сбросить прогресс глоссария пользователя по одной теме
 * DELETE /api/progress/glossary/category
 * Body: { userId: string, categorySlug: string }
 */
async function clearGlossaryProgressByCategory(req, res) {
  try {
    const { userId, categorySlug } = req.body;

    if (!userId || !isValidUUID(userId)) {
      return res.status(400).json({
        success: false,
        message: 'userId обязателен и должен быть валидным UUID',
      });
    }

    if (!categorySlug || typeof categorySlug !== 'string' || categorySlug.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'categorySlug обязателен',
      });
    }

    const prisma = getPrismaClient();

    const category = await prisma.category.findUnique({
      where: { slug: categorySlug.trim() },
      select: { id: true, title: true, slug: true },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Категория не найдена',
      });
    }

    const terms = await prisma.term.findMany({
      where: { categoryId: category.id },
      select: { id: true },
    });

    const termIds = terms.map((term) => term.id);

    if (termIds.length === 0) {
      return res.status(200).json({
        success: true,
        deleted: 0,
        categorySlug: category.slug,
        message: 'В выбранной категории нет терминов',
      });
    }

    const result = await prisma.userTermProgress.deleteMany({
      where: {
        userId,
        termId: { in: termIds },
      },
    });

    return res.status(200).json({
      success: true,
      deleted: result.count,
      categorySlug: category.slug,
      message: `Сброшено ${result.count} терминов по теме ${category.title}`,
    });
  } catch (error) {
    console.error('Ошибка при сбросе прогресса глоссария по теме:', error);
    return res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Получить тестовые вопросы (по категории или смешанные)
 * GET /api/progress/tests/questions?categorySlug=...&limit=...
 */
async function getTestQuestions(req, res) {
  try {
    const { categorySlug, limit } = req.query;

    const parsedLimit = Number.parseInt(String(limit || '12'), 10);
    const take = Number.isNaN(parsedLimit) ? 12 : Math.max(1, Math.min(parsedLimit, 100));

    const prisma = getPrismaClient();

    const where = {};

    if (categorySlug && typeof categorySlug === 'string' && categorySlug.trim().length > 0) {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug.trim() },
        select: { id: true },
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Категория не найдена',
        });
      }

      where.categoryId = category.id;
    }

    const rawQuestions = await prisma.question.findMany({
      where,
      include: {
        category: {
          select: {
            slug: true,
            title: true,
            color: true,
          },
        },
        options: {
          select: {
            id: true,
            text: true,
            isCorrect: true,
          },
        },
      },
    });

    const validQuestions = rawQuestions.filter((question) => question.options.length === 4);

    const selectedQuestions = shuffleArray(validQuestions).slice(0, take).map((question) => ({
      id: question.id,
      text: question.text,
      source: question.source,
      category: question.category,
      options: shuffleArray(question.options),
    }));

    return res.status(200).json({
      success: true,
      data: selectedQuestions,
      total: selectedQuestions.length,
    });
  } catch (error) {
    console.error('Ошибка при получении тестовых вопросов:', error);
    return res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Сохранить ответ пользователя в тесте по категории
 * POST /api/progress/tests/answer
 * Body: { userId: string, questionId: string, selectedOptionId: string }
 */
async function saveCategoryTestAnswer(req, res) {
  try {
    const { userId, questionId, selectedOptionId } = req.body;

    if (!userId || !isValidUUID(userId)) {
      return res.status(400).json({
        success: false,
        message: 'userId обязателен и должен быть валидным UUID',
      });
    }

    if (!questionId || !isValidUUID(questionId)) {
      return res.status(400).json({
        success: false,
        message: 'questionId обязателен и должен быть валидным UUID',
      });
    }

    if (!selectedOptionId || !isValidUUID(selectedOptionId)) {
      return res.status(400).json({
        success: false,
        message: 'selectedOptionId обязателен и должен быть валидным UUID',
      });
    }

    const prisma = getPrismaClient();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден',
      });
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: {
        id: true,
        categoryId: true,
        category: {
          select: {
            slug: true,
            title: true,
          },
        },
      },
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Вопрос не найден',
      });
    }

    if (!question.categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Вопрос не относится к категории',
      });
    }

    const questionOptions = await prisma.questionOption.findMany({
      where: { questionId },
      select: {
        id: true,
        isCorrect: true,
      },
    });

    if (questionOptions.length !== 4) {
      return res.status(400).json({
        success: false,
        message: 'Для тестового вопроса должно быть ровно 4 варианта ответа',
      });
    }

    const selectedOption = questionOptions.find((option) => option.id === selectedOptionId);

    if (!selectedOption) {
      return res.status(400).json({
        success: false,
        message: 'Выбранный вариант не принадлежит этому вопросу',
      });
    }

    const answer = await prisma.userAnswer.create({
      data: {
        userId,
        questionId,
        selectedOptionId,
        isCorrect: selectedOption.isCorrect,
        testContext: 'category',
      },
      select: {
        id: true,
        isCorrect: true,
        answeredAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        answerId: answer.id,
        isCorrect: answer.isCorrect,
        answeredAt: answer.answeredAt,
        categorySlug: question.category?.slug || null,
        categoryTitle: question.category?.title || null,
      },
      message: answer.isCorrect ? 'Ответ сохранён: верно' : 'Ответ сохранён: неверно',
    });
  } catch (error) {
    console.error('Ошибка при сохранении ответа теста по категории:', error);
    return res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Получить прогресс тестов по одной категории
 * GET /api/progress/tests/category?userId=...&categorySlug=...
 */
async function getCategoryTestProgress(req, res) {
  try {
    const { userId, categorySlug } = req.query;

    if (!userId || !isValidUUID(userId)) {
      return res.status(400).json({
        success: false,
        message: 'userId обязателен и должен быть валидным UUID',
      });
    }

    if (!categorySlug || typeof categorySlug !== 'string' || categorySlug.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'categorySlug обязателен',
      });
    }

    const prisma = getPrismaClient();

    const category = await prisma.category.findUnique({
      where: { slug: categorySlug.trim() },
      select: {
        id: true,
        slug: true,
        title: true,
        _count: {
          select: {
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

    const answers = await prisma.userAnswer.findMany({
      where: {
        userId,
        testContext: 'category',
        question: {
          categoryId: category.id,
        },
      },
      select: {
        questionId: true,
        isCorrect: true,
        answeredAt: true,
      },
      orderBy: {
        answeredAt: 'desc',
      },
    });

    const latestByQuestion = new Map();
    for (const answer of answers) {
      if (!latestByQuestion.has(answer.questionId)) {
        latestByQuestion.set(answer.questionId, answer);
      }
    }

    const totalQuestions = category._count.questions;
    const answeredQuestions = latestByQuestion.size;
    const correctAnswers = Array.from(latestByQuestion.values()).filter((a) => a.isCorrect).length;
    const progressPercent = totalQuestions === 0 ? 0 : Math.round((correctAnswers / totalQuestions) * 100);

    return res.status(200).json({
      success: true,
      data: {
        categorySlug: category.slug,
        categoryTitle: category.title,
        totalQuestions,
        answeredQuestions,
        correctAnswers,
        progressPercent,
      },
    });
  } catch (error) {
    console.error('Ошибка при получении прогресса теста по категории:', error);
    return res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Получить общий прогресс тестов пользователя по всем категориям
 * GET /api/progress/tests/summary?userId=...
 */
async function getTestsSummary(req, res) {
  try {
    const { userId } = req.query;

    if (!userId || !isValidUUID(userId)) {
      return res.status(400).json({
        success: false,
        message: 'userId обязателен и должен быть валидным UUID',
      });
    }

    const prisma = getPrismaClient();

    const categories = await prisma.category.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        _count: {
          select: {
            questions: true,
          },
        },
      },
      orderBy: {
        title: 'asc',
      },
    });

    const answers = await prisma.userAnswer.findMany({
      where: {
        userId,
        testContext: 'category',
        question: {
          categoryId: {
            not: null,
          },
        },
      },
      select: {
        questionId: true,
        isCorrect: true,
        answeredAt: true,
        question: {
          select: {
            categoryId: true,
          },
        },
      },
      orderBy: {
        answeredAt: 'desc',
      },
    });

    const latestByCategory = new Map();

    for (const answer of answers) {
      const categoryId = answer.question?.categoryId;
      if (!categoryId) continue;

      if (!latestByCategory.has(categoryId)) {
        latestByCategory.set(categoryId, new Map());
      }

      const questionMap = latestByCategory.get(categoryId);
      if (!questionMap.has(answer.questionId)) {
        questionMap.set(answer.questionId, answer);
      }
    }

    const categoryStats = categories.map((category) => {
      const questionMap = latestByCategory.get(category.id) || new Map();
      const latestAnswers = Array.from(questionMap.values());

      const totalQuestions = category._count.questions;
      const answeredQuestions = latestAnswers.length;
      const correctAnswers = latestAnswers.filter((a) => a.isCorrect).length;
      const progressPercent = totalQuestions === 0 ? 0 : Math.round((correctAnswers / totalQuestions) * 100);

      return {
        categorySlug: category.slug,
        categoryTitle: category.title,
        totalQuestions,
        answeredQuestions,
        correctAnswers,
        progressPercent,
      };
    });

    const totals = categoryStats.reduce(
      (acc, item) => {
        acc.totalQuestions += item.totalQuestions;
        acc.answeredQuestions += item.answeredQuestions;
        acc.correctAnswers += item.correctAnswers;
        return acc;
      },
      { totalQuestions: 0, answeredQuestions: 0, correctAnswers: 0 }
    );

    const overallProgressPercent =
      totals.totalQuestions === 0 ? 0 : Math.round((totals.correctAnswers / totals.totalQuestions) * 100);

    return res.status(200).json({
      success: true,
      data: {
        categories: categoryStats,
        totals: {
          ...totals,
          overallProgressPercent,
        },
      },
    });
  } catch (error) {
    console.error('Ошибка при получении общего прогресса тестов:', error);
    return res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

module.exports = {
  getGlossaryProgress,
  saveGlossaryProgress,
  clearGlossaryProgress,
  clearGlossaryProgressByCategory,
  getTestQuestions,
  saveCategoryTestAnswer,
  getCategoryTestProgress,
  getTestsSummary,
};
