const express = require('express');
const router = express.Router();
const { sendMessage, getMessagesByChatRoom } = require('../controllers/messageController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/send', verifyToken, sendMessage);
router.get('/chatroom/:chatroomId', verifyToken, getMessagesByChatRoom);

module.exports = router;
