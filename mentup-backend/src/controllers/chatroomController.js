const { ChatRoom, User, Profile } = require('../models');

exports.createChatRoom = async (req, res) => {
  const { user1_id, user2_id } = req.body;

  try {
    // Daha önce aynı ikili chatroom açılmış mı?
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
      // Mentor bilgisi ekle
      const mentor = await User.findByPk(user2_id, {
        attributes: ['id', 'name', 'surname'],
        include: [{ model: Profile, as: 'profile', attributes: ['photo_url'] }]
      });
      return res.status(200).json({
        message: 'Zaten chatroom var',
        chatroom: room,
        mentor: {
          id: mentor.id,
          name: mentor.name + " " + mentor.surname,
          photo: mentor.profile?.photo_url || ""
        }
      });
    }

    // Yeni chatroom oluştur
    const newRoom = await ChatRoom.create();
    await newRoom.addParticipants([user1_id, user2_id]);

    // Mentor bilgisi ekle
    const mentor = await User.findByPk(user2_id, {
      attributes: ['id', 'name', 'surname'],
      include: [{ model: Profile, as: 'profile', attributes: ['photo_url'] }]
    });

    res.status(201).json({
      message: 'Chatroom oluşturuldu',
      chatroom: newRoom,
      mentor: {
        id: mentor.id,
        name: mentor.name + " " + mentor.surname,
        photo: mentor.profile?.photo_url || ""
      }
    });
  } catch (err) {
    console.error('Chatroom oluşturma hatası:', err);
    res.status(500).json({ message: 'Bir hata oluştu.', error: err.message });
  }
};

// Kullanıcının tüm chatroom ve mesajlarını getir
exports.getMyChatRooms = async (req, res) => {
  try {
    // JWT ile gelen kullanıcı id'sini al (örnek: req.user.id)
    const userId = req.user?.id || req.body.user_id || req.query.user_id;
    if (!userId) return res.status(401).json({ message: "Kullanıcı bulunamadı." });

    // Kullanıcının dahil olduğu chatroom'ları bul
    const chatrooms = await ChatRoom.findAll({
      include: [
        {
          model: User,
          as: 'participants',
          attributes: ['id', 'name', 'surname'],
          through: { attributes: [] },
          include: [{ model: Profile, as: 'profile', attributes: ['photo_url'] }]
        }
      ]
    });

    // Sadece kullanıcının dahil olduğu chatroom'lar
    const userChatrooms = chatrooms.filter(room =>
      room.participants.some(p => p.id === userId)
    );

    // Her chatroom için mesajları da ekle
    const result = await Promise.all(userChatrooms.map(async (room) => {
      // Diğer katılımcı (mentor)
      const mentor = room.participants.find(p => p.id !== userId);
      // Mesajları çek
      const messages = await require('../models').DirectMessage.findAll({
        where: { chatroom_id: room.id },
        order: [['created_at', 'ASC']]
      });
      return {
        id: room.id,
        name: mentor ? mentor.name + " " + mentor.surname : "Mentor",
        photo: mentor?.profile?.photo_url || "",
        messages: messages.map(m => ({
          text: m.content,
          sender: m.sender_id === userId ? "user" : "mentor",
          created_at: m.created_at
        }))
      };
    }));

    res.json({ chats: result });
  } catch (err) {
    console.error('Chatroom geçmişi getirilirken hata:', err);
    res.status(500).json({ message: "Bir hata oluştu.", error: err.message });
  }
};