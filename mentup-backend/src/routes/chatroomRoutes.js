const express = require('express');
const router = express.Router();
const { createChatRoom } = require('../controllers/chatroomController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/create', verifyToken, createChatRoom);

module.exports = router;
