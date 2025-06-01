const { Document, User } = require('../models');
const { validateDiplomaInfo } = require('../services/diplomaValidator');

exports.createMentorApplication = async (req, res) => {
  const userId = req.user.id;
  const { 
    name,
    surname, 
    age, 
    degree_number, 
    tcNumber,
    experience_years, 
    why_mentor, 
    industries, 
    skills,
  } = req.body;
  const cvFile = req.file;

  if (!cvFile) {
    return res.status(400).json({ message: 'CV dosyası gereklidir.' });
  }

  try {
    // Kullanıcıyı veritabanından getir
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    // Kullanıcı adını ve soyadını kontrol et
    if (user.name !== name) {
      return res.status(400).json({ message: `İsim uyuşmuyor. Giriş yaptığınız isim: ${user.name}` });
    }
    if (user.surname !== surname) {
      return res.status(400).json({ message: `Soyisim uyuşmuyor. Giriş yaptığınız soyisim: ${user.surname}` });
    }

    // Kullanıcının daha önce başvuru yapıp yapmadığını kontrol et
    const existingApplication = await Document.findOne({
      where: {
        user_id: userId,
        type: 'mentor_application',
        status: 'pending'
      }
    });

    if (existingApplication) {
      return res.status(400).json({
        message: 'Zaten bir mentor başvurunuz bulunmaktadır. Birden fazla başvuru yapamazsınız.'
      });
    }

    const validation = await validateDiplomaInfo({
      tc: tcNumber,
      name,
      surname,
      diploma_number: degree_number
    });

    if (!validation.success) {
      return res.status(400).json({ message: validation.error });
    }

    // Dosya URL'ini oluştur
    const cvUrl = `${req.protocol}://${req.get('host')}/uploads/${cvFile.filename}`;

    // Başvuruyu kaydet
    const document = await Document.create({
      user_id: userId,
      name,
      surname,
      email: user.email, // Kullanıcının email bilgisini kaydediyoruz
      cv_url: cvUrl,
      age,
      degree_number,
      tcNumber,
      experience_years,
      why_mentor,
      industries,
      skills,
      type: 'mentor_application',
      status: 'pending',
    });

    res.status(201).json({ message: 'Başvuru başarıyla oluşturuldu.', document });
  } catch (err) {
    console.error('Başvuru kaydedilemedi:', err);
    res.status(500).json({ message: 'Bir hata oluştu.', error: err.message });
  }
};

exports.checkApplicationStatus = async (req, res) => {
  const userId = req.user.id;

  try {
    const existingApplication = await Document.findOne({
      where: {
        user_id: userId,
        type: 'mentor_application',
        status: 'pending'
      }
    });

    res.status(200).json({ hasApplied: !!existingApplication });
  } catch (err) {
    console.error('Başvuru durumu kontrol edilemedi:', err);
    res.status(500).json({ message: 'Bir hata oluştu.', error: err.message });
  }
};

exports.cancelMentorApplication = async (req, res) => {
  const userId = req.user.id;
  try {
    const application = await Document.findOne({
      where: {
        user_id: userId,
        type: 'mentor_application',
        status: 'pending'
      }
    });

    if (!application) {
      return res.status(404).json({ message: 'Aktif başvuru bulunamadı.' });
    }

    // Başvuruyu tamamen silebilir veya status'unu "rejected" yapabilirsin:
    await application.destroy();

    res.json({ message: 'Başvuru iptal edildi.' });
  } catch (err) {
    console.error('Başvuru iptal edilemedi:', err);
    res.status(500).json({ message: 'Bir hata oluştu.', error: err.message });
  }
};