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
        model: User,
        as: 'sender',
        attributes: ['id', 'name', 'surname'],
        include: {
          model: Profile,
          as: 'profile',
          attributes: ['photo_url']
        }
      },
      order: [['created_at', 'ASC']]
    });

    // Her mesajı sadeleştirip created_at'i de ekle
    const mapped = messages.map(m => ({
      id: m.id,
      text: m.content,
      sender: m.sender_id === req.user.id ? "user" : "mentor",
      created_at: m.created_at
    }));

    res.status(200).json(mapped);
  } catch (err) {
    console.error('Mesajlar getirilirken hata:', err);
    res.status(500).json({ message: 'Bir hata oluştu.', error: err.message });
  }
};
