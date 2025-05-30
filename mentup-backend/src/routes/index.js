const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const profileRoutes = require('./profileRoutes');
const applyMentorshipRoutes = require('./applyMentorshipRoutes');
const adminPanelRoutes = require('./adminPanelRoutes');
const userRoleRoutes = require('./userRoleRoutes');
const mentorRoutes = require('./mentorRoutes');
const availabilitySlotRoutes = require('./availabilitySlotRoutes');
const mentorReviewRoutes = require('./mentorReviewRoutes');
const messageRoutes = require('./messageRoutes');

// Health-check
router.get('/', (req, res) => {
  res.send('API is working');
});

// Auth işlemleri (signup, login, profile)
router.use('/auth', authRoutes);

router.use('/profile', profileRoutes);

router.use('/mentor', applyMentorshipRoutes, mentorRoutes);

router.use('/mentor/availability', availabilitySlotRoutes);

router.use('/admin', adminPanelRoutes);

router.use('/user-role', userRoleRoutes);

router.use('/reviews', mentorReviewRoutes);

router.use('/message', messageRoutes);



module.exports = router;
