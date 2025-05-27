const express = require('express');
const router = express.Router();
const { createChatRoom, getMyChatRooms } = require('../controllers/chatroomController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/create', verifyToken, createChatRoom);
router.get('/my', verifyToken, getMyChatRooms);

module.exports = router;
