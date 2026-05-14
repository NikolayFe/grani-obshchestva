const express = require('express');
const {
  getGlossaryProgress,
  saveGlossaryProgress,
  clearGlossaryProgress,
  clearGlossaryProgressByCategory,
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

module.exports = router;
