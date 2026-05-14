const express = require('express');
const { getCategories, getCategoryBySlug } = require('../controllers/categoriesController');

const router = express.Router();

/**
 * GET /api/categories
 * Список всех категорий
 */
router.get('/', getCategories);

/**
 * GET /api/categories/:slug
 * Категория по slug (например: /api/categories/ekonomika)
 */
router.get('/:slug', getCategoryBySlug);

module.exports = router;
