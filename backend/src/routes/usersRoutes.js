const express = require('express');
const { getUserProfile, getRating, recordActivity, getActivity } = require('../controllers/usersController');

const router = express.Router();

router.get('/rating', getRating);
router.get('/:userId', getUserProfile);
router.post('/:userId/activity', recordActivity);
router.get('/:userId/activity', getActivity);

module.exports = router;
