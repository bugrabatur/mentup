const express = require('express');
const router = express.Router();
const mentorReviewController = require('../controllers/mentorReviewController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/mentorReview', verifyToken, mentorReviewController.createMentorReview);
router.get('/mentor/:mentor_id/averageRating', mentorReviewController.getMentorAverageRating);

module.exports = router;