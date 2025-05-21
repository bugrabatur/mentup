const { ChatRoom, ChatRoomUser, User } = require('../models');

// Yeni chatroom oluştur + iki kullanıcıyı dahil et
exports.createChatRoom = async (req, res) => {
  const { user1_id, user2_id } = req.body;

  try {
    // Daha önce aynı ikili chatroom açmış mı? Kontrol
    const existingRooms = await ChatRoom.findAll({
      include: {
        model: User,
        as: 'participants',
        where: { id: [user1_id, user2_id] },
        through: { attributes: [] }
      }
    });

    const room = existingRooms.find(r => r.participants.length === 2);
    if (room) {
      console.log("🟡 Zaten var olan chatroom bulundu:", room.toJSON());
      return res.status(200).json({ message: 'Zaten chatroom var', chatroom: room });
    }

    // ✅ ChatRoom oluştur
    const newRoom = await ChatRoom.create();

    // 🔵 Log: Oluşturulan oda bilgisi (oluştu ama sorun burada olabilir)
    console.log("🟢 Oluşturulan yeni chatroom:", newRoom.toJSON());

    // Katılımcıları ekle
    await newRoom.addParticipants([user1_id, user2_id]);

    res.status(201).json({ message: 'Chatroom oluşturuldu', chatroom: newRoom });
  } catch (err) {
    console.error('🔴 Chatroom oluşturma hatası:', err);
    res.status(500).json({ message: 'Bir hata oluştu.', error: err.message });
  }
};
