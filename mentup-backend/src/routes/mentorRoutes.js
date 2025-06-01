const express = require('express');
const router = express.Router();
const { getAllMentors, filterMentors } = require('../controllers/mentorController');
// const { verifyToken } = require('../middlewares/authMiddleware');

// Mentorları listele
router.get('/getMentors', getAllMentors);
router.get('/filterMentors',  filterMentors);

module.exports = router;