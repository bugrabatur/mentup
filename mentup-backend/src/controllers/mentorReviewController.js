const { Review, Appointment } = require('../models');

exports.createMentorReview = async (req, res) => {
  try {
    const { appointment_id, q1, q2, q3, q4, q5, q6, comment } = req.body;
    // Rating hesapla
    const rating = ((q1 + q2 + q3 + q4 + q5 + q6) / 6).toFixed(2);

    // Aynı appointment için tekrar değerlendirme yapmasın
    const exists = await Review.findOne({ where: { appointment_id } });
    if (exists) return res.status(400).json({ message: "Bu görüşme zaten değerlendirildi." });

    // Review tablosuna kaydet
    const review = await Review.create({
      appointment_id,
      rating: rating,
      comment
    });

    res.status(201).json(review);
  } catch (err) {
    console.error("Mentor değerlendirme kaydedilemedi:", err);
    res.status(500).json({ message: "Değerlendirme kaydedilemedi." });
  }
};

exports.getMentorAverageRating = async (req, res) => {
  try {
    const { mentor_id } = req.params;

    // 1. Bu mentora ait tüm appointment'ların id'lerini bul
    const appointments = await Appointment.findAll({
      where: { mentor_id },
      attributes: ['id'],
    });
    const appointmentIds = appointments.map(a => a.id);

    if (!appointmentIds.length) return res.json({ rating: null });

    // 2. Bu appointment'lara ait review'ları bul
    const reviews = await Review.findAll({
      where: { appointment_id: appointmentIds }
    });

    if (!reviews.length) return res.json({ rating: null });

    // 3. Ortalama rating'i hesapla
    const avg = (
      reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length
    ).toFixed(2);

    res.json({ rating: avg });
  } catch (err) {
    res.status(500).json({ message: "Rating alınamadı." });
  }
};