const { User, userProfile } = require('../models');
const bcrypt = require('bcrypt'); // bcrypt kütüphanesini ekle
const EmailService = require('../services/EmailService');
const { signupValidation, loginValidation } = require('../services/userValidation');

// Login işlemi
const jwt = require('jsonwebtoken');
require('dotenv').config(); // .env dosyasını okuyabilmesi için

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('Gelen Login Body:', req.body);

    // Joi validasyonu
    const { error } = loginValidation.validate(req.body, { abortEarly: false });

    if (error) {
      console.error('🛑 Login validation hatası:', error.details);
      return res.status(400).json({ errorCode: 'validation_error' });
    }

    // Kullanıcıyı bul
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.error('🛑 Kullanıcı bulunamadı:', email);
      return res.status(401).json({ errorCode: 'user_not_found' });
    }

    // Şifreyi karşılaştır
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.error('🛑 Hatalı şifre:', email);
      return res.status(401).json({ errorCode: 'wrong_password' });
    }

    // Token oluştur
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Başarılı giriş
    return res.status(200).json({
      message: 'Giriş başarılı!',
      token,
      user: {
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error('🔴 FULL LOGIN ERROR ▶', {
      message: error.message,
      parent: error.parent && error.parent.message,
      stack: error.stack,
    });
    return res.status(500).json({
      errorCode: 'server_error',
    });
  }
};


// Signup işlemi
exports.signup = async (req, res) => {
  const { name, surname, email, password, passwordAgain } = req.body;

  try {
    console.log('Gelen Body:', req.body);

    // Joi validasyonunu çalıştır
    const { error } = signupValidation.validate(req.body, { abortEarly: false });

    if (error) {
      const validationErrors = error.details.map((err) => err.message);
      return res.status(400).json({ message: 'Validasyon hatası', errors: validationErrors });
    }

    // E-posta zaten kayıtlı mı?
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Bu e-posta adresi zaten kayıtlı!' });
    }

    // Şifre eşleşmesi kontrolü (isteğe bağlı ama önerilir)
    if (password !== passwordAgain) {
      return res.status(400).json({ message: 'Şifreler eşleşmiyor!' });
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni kullanıcı oluştur
    const newUser = await User.create({
      name,
      surname,
      email,
      password: hashedPassword,
      role: 'mentee',
    });

    res.status(201).json({
      message: 'Kayıt başarılı!',
      user: {
        id: newUser.id,
        name: newUser.name,
        surname: newUser.surname,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error('🔴 FULL SIGNUP ERROR ▶', {
      message: error.message,
      parent: error.parent && error.parent.message,
      stack: error.stack,
    });
    return res.status(500).json({
      message: 'Bir hata oluştu',
      error: error.message,
      detail: error.parent && error.parent.message,
    });
  }
};

exports.logout = async (req, res) => {
  try {
    // İsteğe bağlı: Token'ı bir kara listeye ekleyebilirsiniz
    // Örneğin: Kara listeyi bir veritabanında veya bellek içinde tutabilirsiniz

    res.status(200).json({ message: 'Çıkış yapıldı.' });
  } catch (err) {
    console.error('Çıkış işlemi sırasında hata:', err);
    res.status(500).json({ message: 'Çıkış işlemi sırasında bir hata oluştu.' });
  }
};

exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(404).json({ message: 'Böyle bir e-posta kayıtlı değil.' });

  // 1️⃣ Token üret (payload: userId)
  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  // 2️⃣ Frontend’deki reset-password sayfanıza yönlendiren link
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  // 3️⃣ Maili yolla
  await EmailService.send(
    email,
    'MentUp: Şifre Sıfırlama',
    `<p>Şifreni sıfırlamak için <a href="${resetLink}">buraya tıklayın</a>.`
    + ` Bu link <strong>${process.env.JWT_EXPIRES_IN}</strong> içinde geçerlidir.</p>`
  );

  return res.json({ message: 'Şifre sıfırlama linki e-postanıza gönderildi.' });
};

// 2) Yeni şifreyi kaydetme (token’lı endpoint)
exports.resetPassword = async (req, res) => {
  // 1) Token’ı al: hem body’den, hem query’den deneyin
  const token = req.body.token || req.query.token;
  if (!token) {
    return res.status(400).json({ message: 'Token gönderilmedi.' });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res
      .status(400)
      .json({ message: 'Geçerli veya süresi dolmuş token.' });
  }

  // 2) Yeni şifreleri al ve kontrol et
  const { password, passwordAgain } = req.body;
  if (!password || password !== passwordAgain) {
    return res.status(400).json({ message: 'Şifreler eşleşmiyor.' });
  }

  // 3) Kullanıcıyı bul ve şifreyi güncelle
  try {
    const user = await User.findByPk(payload.userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }
    const hashed = await bcrypt.hash(password, 10);
    await user.update({ password: hashed });
    return res.status(200).json({ message: 'Şifre değiştirildi.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
};


