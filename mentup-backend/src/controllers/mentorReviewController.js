const { MentorReview, Review, Appointment } = require('../models');

exports.createMentorReview = async (req, res) => {
  try {
    const mentee_id = req.user.id;
    const { mentor_id, appointment_id, q1, q2, q3, q4, q5, q6, comment } = req.body;
    // Rating hesapla
    const rating = ((q1 + q2 + q3 + q4 + q5 + q6) / 6).toFixed(2);

    // Aynı mentee aynı appointment için tekrar değerlendirme yapamasın
    const exists = await MentorReview.findOne({ where: { mentee_id, appointment_id } });
    if (exists) return res.status(400).json({ message: "Bu görüşme zaten değerlendirildi." });

    const review = await MentorReview.create({
      mentor_id,
      mentee_id,
      appointment_id,
      q1, q2, q3, q4, q5, q6,
      comment,
      rating
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
    // Mentorun tüm completed/completed+confirmed appointment'larını bul
    const appointments = await Appointment.findAll({
      where: { mentor_id },
      attributes: ['id'],
    });
    const appointmentIds = appointments.map(a => a.id);

    if (!appointmentIds.length) return res.json({ rating: null });

    // Bu appointment'lara ait review'ları bul
    const reviews = await Review.findAll({
      where: { appointment_id: appointmentIds }
    });

    if (!reviews.length) return res.json({ rating: null });

    const avg = (
      reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length
    ).toFixed(2);

    res.json({ rating: avg });
  } catch (err) {
    res.status(500).json({ message: "Rating alınamadı." });
  }
};