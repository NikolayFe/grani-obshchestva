const express = require('express');
const {
  getGlossaryProgress,
  saveGlossaryProgress,
  clearGlossaryProgress,
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
 * DELETE /api/progress/glossary
 * Сбросить прогресс: { userId }
 */
router.delete('/glossary', clearGlossaryProgress);

module.exports = router;
