const { DirectMessage, ChatRoom } = require('../models');

exports.sendMessage = async (req, res) => {
  const sender_id = req.user.id; // JWT'den gelen ID
  const { chatroom_id, content } = req.body;

  try {
    const chatroom = await ChatRoom.findByPk(chatroom_id);
    if (!chatroom) {
      return res.status(404).json({ message: 'Chatroom bulunamadı' });
    }

    const message = await DirectMessage.create({
      sender_id,
      chatroom_id,
      content
    });

    res.status(201).json({ message: 'Mesaj gönderildi', data: message });
  } catch (err) {
    console.error('Mesaj gönderme hatası:', err);
    res.status(500).json({ message: 'Bir hata oluştu.', error: err.message });
  }
};

// Belirli bir chatroom'daki tüm mesajları getir
exports.getMessagesByChatRoom = async (req, res) => {
  const { chatroomId } = req.params;

  try {
    const messages = await DirectMessage.findAll({
      where: { chatroom_id: chatroomId },
      include: {
        association: 'sender',
        attributes: ['id', 'name', 'surname']
      },
      order: [['created_at', 'ASC']]
    });

    res.status(200).json(messages);
  } catch (err) {
    console.error('Mesajlar getirilirken hata:', err);
    res.status(500).json({ message: 'Bir hata oluştu.', error: err.message });
  }
};
