const express = require('express');
const { getTerms, getTermById } = require('../controllers/termsController');

const router = express.Router();

/**
 * GET /api/terms
 * Список всех терминов
 * Query params: ?categorySlug=ekonomika&isNew=true
 */
router.get('/', getTerms);

/**
 * GET /api/terms/:id
 * Термин по ID
 */
router.get('/:id', getTermById);

module.exports = router;
