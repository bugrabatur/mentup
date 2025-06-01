const { User, Profile, Mentor, Document } = require('../models');
const { Op } = require('sequelize');

// Tüm mentorları getir (kullanıcı ve profil joinli)
exports.getAllMentors = async (req, res) => {
  try {
    const mentors = await User.findAll({
      where: { role: 'mentor' },
      attributes: ['id', 'name', 'surname', 'email'],
      include: [
        {
          model: Profile,
          as: 'profile',
          attributes: ['photo_url', 'bio', 'skills'],
          required: false // <-- Eksik profile olsa da gelsin
        },
        {
          model: Document,
          as: 'documents',
          attributes: ['industries'],
          required: false // <-- Eksik document olsa da gelsin
        }
      ]
    });
    res.status(200).json(mentors);
  } catch (err) {
    console.error('Mentorlar alınamadı:', err);
    res.status(500).json({ message: 'Mentorlar alınırken hata oluştu.' });
  }
};

// Filtreli mentorları getir (mentors view + profile join)
exports.filterMentors = async (req, res) => {
  try {
    const { skills } = req.query;
    const skillArr = skills
      ? skills.split(',').map(s => s.trim()).filter(s => s !== "")
      : [];

    // mentors view'dan mentorları çek, profile tablosundan fotoğrafı joinle
    const mentors = await Mentor.findAll({
      attributes: ['user_id', 'name', 'surname', 'bio', 'industries', 'skills'],
      include: [
        {
          model: Profile,
          as: 'profile',
          attributes: ['photo_url'],
          required: false
        }
      ]
    });

    // skills alanı JSON string olduğu için JS ile filtrele
    const filteredMentors = skillArr.length > 0
      ? mentors.filter(mentor => {
          try {
            // skills alanı null, undefined, boş string veya geçersizse false döndür
            if (!mentor.skills || mentor.skills === "null" || mentor.skills === "") return false;
            const mentorSkills = JSON.parse(mentor.skills);
            if (!Array.isArray(mentorSkills)) return false;
            return skillArr.some(skill => mentorSkills.includes(skill));
          } catch (e) {
            console.error("JSON parse hatası:", mentor.skills, e.message);
            return false;
          }
        })
      : mentors;

    res.status(200).json(filteredMentors);
  } catch (err) {
    console.error('Mentor filtreleme hatası:', err.message, err.stack);
    res.status(500).json({ message: 'Mentorlar alınırken hata oluştu.' , error: err.message });
  }
};