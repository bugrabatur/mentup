const { DirectMessage, ChatRoom } = require('../models');
const {Op} = require('sequelize');

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

exports.getUnreadCounts = async (req, res) => {
  try {
    const userId = req.user.id;

    // Kullanıcının üyesi olduğu chatroom'ları bul
    // Eğer ChatRoomUser tablon yoksa, user'ın dahil olduğu chatroom'ları kendi mantığına göre bulmalısın
    const chatrooms = await ChatRoom.findAll({
      include: [{
        model: require('../models').User,
        as: 'participants',
        where: { id: userId }
      }],
      attributes: ['id']
    });

    const chatroomIds = chatrooms.map(c => c.id);

    // Her chatroom için okunmamış mesaj sayısını bul
    const unreadCounts = {};
    for (const chatroomId of chatroomIds) {
      const count = await DirectMessage.count({
        where: {
          chatroom_id: chatroomId,
          is_read: false,
          sender_id: { [Op.ne]: userId } // Kullanıcının göndermediği mesajlar
        }
      });
      unreadCounts[chatroomId] = count;
    }

    // Toplam okunmamış mesaj sayısı
    const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

    res.json({ unreadCounts, totalUnread });
  } catch (err) {
    console.error('Okunmamış mesajlar alınırken hata:', err);
    res.status(500).json({ message: 'Bir hata oluştu.', error: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatroomId } = req.params;

    // Kullanıcının göndermediği ve okunmamış mesajları okunduya çek
    await DirectMessage.update(
      { is_read: true },
      {
        where: {
          chatroom_id: chatroomId,
          is_read: false,
          sender_id: { [Op.ne]: userId }
        }
      }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Okunduya çekilemedi", error: err.message });
  }
};