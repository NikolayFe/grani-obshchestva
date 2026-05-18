const express = require('express');
const {
  getGlossaryProgress,
  saveGlossaryProgress,
  clearGlossaryProgress,
  clearGlossaryProgressByCategory,
  getTestQuestions,
  saveCategoryTestStageResult,
  getCategoryTestsStageProgress,
  saveCategoryTestAnswer,
  getCategoryTestProgress,
  getTestsSummary,
  getOverallProgress,
} = require('../controllers/progressController');

const router = express.Router();

/**
 * GET /api/progress/glossary?userId=...
 * Получить список выученных терминов пользователя
 */
router.get('/glossary', getGlossaryProgress);

/**
 * POST /api/progress/glossary
 * Сохранить выученные термины: { userId, termIds: string[] }
 */
router.post('/glossary', saveGlossaryProgress);

/**
 * DELETE /api/progress/glossary/category
 * Сбросить прогресс по одной теме: { userId, categorySlug }
 */
router.delete('/glossary/category', clearGlossaryProgressByCategory);

/**
 * DELETE /api/progress/glossary
 * Сбросить прогресс: { userId }
 */
router.delete('/glossary', clearGlossaryProgress);

/**
 * GET /api/progress/tests/questions?categorySlug=...&limit=...
 * Получить тестовые вопросы
 */
router.get('/tests/questions', getTestQuestions);

/**
 * POST /api/progress/tests/stage
 * Сохранить результат этапа тестирования: { userId, categorySlug, stageKey, score, totalQuestions }
 */
router.post('/tests/stage', saveCategoryTestStageResult);

/**
 * GET /api/progress/tests/stage?userId=...&categorySlug=...
 * Получить прогресс этапов тестирования по категории
 */
router.get('/tests/stage', getCategoryTestsStageProgress);

/**
 * POST /api/progress/tests/answer
 * Сохранить ответ пользователя в тесте категории: { userId, questionId, selectedOptionId }
 */
router.post('/tests/answer', saveCategoryTestAnswer);

/**
 * GET /api/progress/tests/category?userId=...&categorySlug=...
 * Получить прогресс тестов по одной категории
 */
router.get('/tests/category', getCategoryTestProgress);

/**
 * GET /api/progress/tests/summary?userId=...
 * Получить общий прогресс тестов по всем категориям
 */
router.get('/tests/summary', getTestsSummary);

/**
 * GET /api/progress/overall?userId=...
 * Общий прогресс по всем модулям
 */
router.get('/overall', getOverallProgress);

module.exports = router;
