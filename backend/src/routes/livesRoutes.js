const express = require('express');

const router = express.Router();
const { getLives, consumeLife, setLivesCount } = require('../controllers/livesController');

router.get('/', getLives);
router.post('/consume', consumeLife);
router.post('/set', setLivesCount);

module.exports = router;
