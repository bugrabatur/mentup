const express = require('express');
const router = express.Router();
const { sendMessage, getMessagesByChatRoom, getUnreadCounts, markAsRead } = require('../controllers/messageController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/send', verifyToken, sendMessage);
router.get('/chatroom/:chatroomId', verifyToken, getMessagesByChatRoom);
router.get('/unread-counts', verifyToken, getUnreadCounts);
router.post('/chatroom/:chatroomId/mark-read', verifyToken, markAsRead);

module.exports = router;
