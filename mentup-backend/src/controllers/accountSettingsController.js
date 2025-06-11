const bcrypt = require('bcrypt');
const { User } = require('../models');
const { accountSettingsValidation } = require('../services/userValidation');


// Mevcut şifreyi kontrol etme
exports.checkCurrentPassword = async (req, res) => {
  const { currentPassword } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    // Şifreyi karşılaştır
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mevcut şifre yanlış.' });
    }

    return res.status(200).json({ isValid: true });
  } catch (err) {
    console.error("Şifre doğrulama hatası:", err);
    return res.status(500).json({ message: 'Sunucuda bir hata oluştu.' });
  }
};

// E-posta bilgisini al
exports.getOwnEmail = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'email'],
    });

    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

    res.status(200).json(user);
  } catch (err) {
    console.error("E-posta verisi alınamadı:", err);
    res.status(500).json({ message: 'Bir hata oluştu.', error: err.message });
  }
};

// Şifreyi güncelleme
exports.updateOwnPassword = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword, confirmPassword } = req.body;

  try {
    // Joi validasyonu
    const { error } = accountSettingsValidation.validate(req.body, { abortEarly: false });
    if (error) {
      console.error('🛑 Şifre güncelleme validasyon hatası:', error.details);
      return res.status(400).json({ errorCode: 'validation_error' });
    }

    // Kullanıcıyı çek
    const user = await User.findByPk(userId);
    if (!user) {
      console.error('🛑 Kullanıcı bulunamadı:', userId);
      return res.status(404).json({ errorCode: 'user_not_found' });
    }

    // Mevcut şifre kontrolü
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      console.error('🛑 Mevcut şifre yanlış');
      return res.status(400).json({ errorCode: 'wrong_current_password' });
    }

    // Yeni şifreyi hash’le ve kaydet
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    return res.status(200).json({ message: 'Şifre başarıyla güncellendi.' });
  } catch (err) {
    console.error('🔴 Şifre güncelleme sunucu hatası:', err);
    return res.status(500).json({ errorCode: 'server_error' });
  }
};
