const { User, userProfile } = require('../models');
const bcrypt = require('bcrypt'); // bcrypt kütüphanesini ekle

// Login işlemi
const jwt = require('jsonwebtoken');
require('dotenv').config(); // .env dosyasını okuyabilmesi için

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (user) {
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (isPasswordValid) {
                // ✅ JWT token oluştur
                const token = jwt.sign(
                    { id: user.id, ehmail: user.email, name: user.name }, // payload
                    process.env.JWT_SECRET,
                    { expiresIn: '2h' } // Token 2 saat geçerli
                );

                return res.status(200).json({
                    message: 'Giriş başarılı!',
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        surname: user.surname,
                        email: user.email,
                        role: user.role // Rolü döndürüyoruz
                    }
                });
            }
        }

        res.status(401).json({ message: 'Hatalı e-posta veya şifre!' });
    } catch (error) {
        console.error('Login hatası:', error);
        res.status(500).json({ message: 'Bir hata oluştu' });
    }
};


// Signup işlemi
exports.signup = async (req, res) => {
    const { 
        name, 
        surname, 
        email, 
        password, 
        passwordAgain } = req.body;
  
    try {
      console.log('Gelen Body:', req.body);
  
      // Tüm alanlar dolu mu kontrolü
      if (!name || !surname || !email || !password ) {
        return res.status(400).json({ message: 'Tüm alanları doldurun!' });
      }
  
      // E-posta zaten kayıtlı mı?
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          message: 'Bu e-posta adresi zaten kayıtlı!',
        });
      }
  
      // Şifreyi hashle 
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Yeni kullanıcı oluştur
      const newUser = await User.create({
        name,
        surname,
        email,
        password: hashedPassword,
        role: 'mentee'
      });
  
      res.status(201).json({
        message: 'Kayıt başarılı!',
        user: {
          id: newUser.id,
          name: newUser.name,
          surname: newUser.surname,
          email: newUser.email
        }
      });
    } catch (error) {
      console.error('🔴 FULL SIGNUP ERROR ▶', {
        message: error.message,
        parent: error.parent && error.parent.message,
        stack: error.stack
      });
      return res.status(500).json({
        message: 'Bir hata oluştu',
        error: error.message,
        detail: error.parent && error.parent.message
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


