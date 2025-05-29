const { Appointment, User, AvailabilitySlot } = require('../models');
const { Op } = require("sequelize");

// Görüşme talebi oluşturma
exports.createAppointment = async (req, res) => {
  try {
    const { mentor_id, scheduled_date, start_time, end_time, description } = req.body;
    const mentee_id = req.user.id; // Giriş yapan mentee'nin ID'si

    // Mentorun varlığını kontrol et
    const mentor = await User.findOne({ where: { id: mentor_id, role: 'mentor' } });
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor bulunamadı.' });
    }

    // Randevu oluştur
    const appointment = await Appointment.create({
      mentor_id,
      mentee_id,
      scheduled_date,
      start_time,
      end_time,
      description,
      status: 'pending',
    });

    res.status(201).json(appointment);
  } catch (err) {
    console.error('Randevu oluşturulamadı:', err);
    res.status(500).json({ message: 'Randevu oluşturulurken hata oluştu.' });
  }
};

// Görüşme talebi durumunu güncelleme
exports.updateAppointmentStatus = async (req, res) => {
  try {
	const { appointment_id } = req.params;
	const { status } = req.body;

	// Geçerli durumları kontrol et
	const validStatuses = ['pending', 'accepted', 'rejected', 'cancelled', 'completed'];
	if (!validStatuses.includes(status)) {
	  return res.status(400).json({ message: 'Geçersiz durum.' });
	}

	// Randevuyu güncelle
	const appointment = await Appointment.findByPk(appointment_id);
	if (!appointment) {
	  return res.status(404).json({ message: 'Randevu bulunamadı.' });
	}

	appointment.status = status;
	await appointment.save();

	res.status(200).json(appointment);
  } catch (err) {
	console.error('Randevu durumu güncellenemedi:', err);
	res.status(500).json({ message: 'Randevu durumu güncellenirken hata oluştu.' });
  }
};

// Mentorun gelen taleplerini listeleme
exports.getMentorAppointments = async (req, res) => {
  try {
    // --- BURAYA EKLE ---
    const now = new Date();
    const today = now.toISOString().slice(0, 10); // YYYY-MM-DD
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM

    await Appointment.update(
      { status: 'completed' },
      {
        where: {
          status: 'confirmed',
          [Op.or]: [
            { scheduled_date: { [Op.lt]: today } },
            {
              scheduled_date: today,
              end_time: { [Op.lte]: currentTime }
            }
          ]
        }
      }
    );
    // --- EKLEME BİTTİ ---

    const mentor_id = req.user.id; // Giriş yapan mentorun ID'si

    const appointments = await Appointment.findAll({
      where: { mentor_id },
      include: [
        {
          model: User,
          as: 'mentee',
          attributes: ['id', 'name', 'surname', 'email'],
          include: [
            {
              model: require('../models').Profile,
              as: 'profile',
              attributes: ['bio', 'photo_url', 'skills'],
            },
          ],
        },
      ],
    });

    res.status(200).json(appointments);
  } catch (err) {
    console.error('Mentorun randevuları alınamadı:', err);
    res.status(500).json({ message: 'Randevular alınırken hata oluştu.' });
  }
};

// Mentee'nin gönderdiği talepleri listeleme
exports.getMenteeAppointments = async (req, res) => {
  try {
    // --- BURAYA EKLE ---
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const currentTime = now.toTimeString().slice(0, 5);

    await Appointment.update(
      { status: 'completed' },
      {
        where: {
          status: 'confirmed',
          [Op.or]: [
            { scheduled_date: { [Op.lt]: today } },
            {
              scheduled_date: today,
              end_time: { [Op.lte]: currentTime }
            }
          ]
        }
      }
    );
    // --- EKLEME BİTTİ ---

    const mentee_id = req.user.id; // Giriş yapan mentee'nin ID'si

    const appointments = await Appointment.findAll({
      where: { mentee_id },
      include: [
        { 
          model: User, 
          as: 'mentor', 
          attributes: ['id', 'name', 'surname', 'email'],
          include: [
            {
              model: require('../models').Profile,
              as: 'profile',
              attributes: ['bio', 'photo_url', 'skills'],
            },
          ],
        },
      ],
    });

    res.status(200).json(appointments);
  } catch (err) {
    console.error('Mentee randevuları alınamadı:', err);
    res.status(500).json({ message: 'Randevular alınırken hata oluştu.' });
  }
};

// Mentee kendi talebini iptal eder
exports.cancelMenteeAppointment = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const mentee_id = req.user.id;

    // Sadece kendi talebini iptal edebilsin
    const appointment = await Appointment.findOne({
      where: { id: appointment_id, mentee_id }
    });

    if (!appointment) {
      return res.status(404).json({ message: "Talep bulunamadı veya yetkiniz yok." });
    }

    appointment.status = "cancelled";
    await appointment.save();

    res.status(200).json({ message: "Talep iptal edildi.", appointment });
  } catch (err) {
    console.error("Talep iptal edilemedi:", err);
    res.status(500).json({ message: "Talep iptal edilirken hata oluştu." });
  }
};

// Mentor gelen talebi reddeder
exports.rejectMentorAppointment = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const mentor_id = req.user.id;

    // Sadece kendi gelen talebini reddedebilsin
    const appointment = await Appointment.findOne({
      where: { id: appointment_id, mentor_id }
    });

    if (!appointment) {
      return res.status(404).json({ message: "Talep bulunamadı veya yetkiniz yok." });
    }

    appointment.status = "rejected";
    await appointment.save();

    res.status(200).json({ message: "Talep reddedildi.", appointment });
  } catch (err) {
    console.error("Talep reddedilemedi:", err);
    res.status(500).json({ message: "Talep reddedilirken hata oluştu." });
  }
};

exports.confirmMentorAppointment = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const mentor_id = req.user.id;

    // Sadece kendi gelen talebini onaylayabilsin
    const appointment = await Appointment.findOne({
      where: { id: appointment_id, mentor_id }
    });

    if (!appointment) {
      return res.status(404).json({ message: "Talep bulunamadı veya yetkiniz yok." });
    }

    appointment.status = "confirmed";
    await appointment.save();

    // AvailabilitySlot tablosundan ilgili slotu sil
    await AvailabilitySlot.destroy({
      where: {
        user_id: mentor_id,
        date: appointment.scheduled_date,
        start_time: appointment.start_time,
        end_time: appointment.end_time
      }
    });

    res.status(200).json({ message: "Talep onaylandı.", appointment });
  } catch (err) {
    console.error("Talep onaylanamadı:", err);
    res.status(500).json({ message: "Talep onaylanırken hata oluştu." });
  }
};

exports.getMentorUpcomingAppointments = async (req, res) => {
  try {
    const mentor_id = req.user.id;
    const appointments = await Appointment.findAll({
      where: { mentor_id, status: "confirmed" },
      include: [
        {
          model: User,
          as: 'mentee',
          attributes: ['id', 'name', 'surname', 'email'],
          include: [
            {
              model: require('../models').Profile,
              as: 'profile',
              attributes: ['bio', 'photo_url', 'skills'],
            },
          ],
        },
      ],
      order: [['scheduled_date', 'ASC'], ['start_time', 'ASC']]
    });
    res.status(200).json(appointments);
  } catch (err) {
    console.error('Planlanan görüşmeler alınamadı:', err);
    res.status(500).json({ message: 'Planlanan görüşmeler alınırken hata oluştu.' });
  }
};

exports.getMenteeUpcomingAppointments = async (req, res) => {
  try {
    const mentee_id = req.user.id;
    const appointments = await Appointment.findAll({
      where: { mentee_id, status: "confirmed" },
      include: [
        {
          model: User,
          as: 'mentor',
          attributes: ['id', 'name', 'surname', 'email'],
          include: [
            {
              model: require('../models').Profile,
              as: 'profile',
              attributes: ['bio', 'photo_url', 'skills'],
            },
          ],
        },
      ],
      order: [['scheduled_date', 'ASC'], ['start_time', 'ASC']]
    });
    res.status(200).json(appointments);
  } catch (err) {
    console.error('Planlanan görüşmeler alınamadı:', err);
    res.status(500).json({ message: 'Planlanan görüşmeler alınırken hata oluştu.' });
  }
};

exports.getMentorPastAppointments = async (req, res) => {
  try {
    // --- BURAYA EKLE ---
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const currentTime = now.toTimeString().slice(0, 5);

    await Appointment.update(
      { status: 'completed' },
      {
        where: {
          status: 'confirmed',
          [Op.or]: [
            { scheduled_date: { [Op.lt]: today } },
            {
              scheduled_date: today,
              end_time: { [Op.lte]: currentTime }
            }
          ]
        }
      }
    );
    // --- EKLEME BİTTİ ---

    const mentor_id = req.user.id;
    const appointments = await Appointment.findAll({
      where: {
        mentor_id,
        status: 'completed'
      },
      include: [
        {
          model: User,
          as: 'mentee',
          attributes: ['id', 'name', 'surname', 'email'],
          include: [
            {
              model: require('../models').Profile,
              as: 'profile',
              attributes: ['bio', 'photo_url', 'skills'],
            },
          ],
        },
      ],
      order: [['scheduled_date', 'DESC'], ['start_time', 'DESC']]
    });

    res.status(200).json(appointments);
  } catch (err) {
    console.error('Geçmiş görüşmeler alınamadı:', err);
    res.status(500).json({ message: 'Geçmiş görüşmeler alınırken hata oluştu.' });
  }
};

// Mentee'nin geçmiş (tamamlanmış) görüşmeleri
exports.getMenteePastAppointments = async (req, res) => {
  try {
    // --- BURAYA EKLE ---
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const currentTime = now.toTimeString().slice(0, 5);

    await Appointment.update(
      { status: 'completed' },
      {
        where: {
          status: 'confirmed',
          [Op.or]: [
            { scheduled_date: { [Op.lt]: today } },
            {
              scheduled_date: today,
              end_time: { [Op.lte]: currentTime }
            }
          ]
        }
      }
    );
    // --- EKLEME BİTTİ ---

    const mentee_id = req.user.id;
    const appointments = await Appointment.findAll({
      where: {
        mentee_id,
        status: 'completed'
      },
      include: [
        {
          model: User,
          as: 'mentor',
          attributes: ['id', 'name', 'surname', 'email'],
          include: [
            {
              model: require('../models').Profile,
              as: 'profile',
              attributes: ['bio', 'photo_url', 'skills'],
            },
          ],
        },
      ],
      order: [['scheduled_date', 'DESC'], ['start_time', 'DESC']]
    });
    res.status(200).json(appointments);
  } catch (err) {
    console.error('Mentee geçmiş randevuları alınamadı:', err);
    res.status(500).json({ message: 'Geçmiş randevular alınırken hata oluştu.' });
  }
};