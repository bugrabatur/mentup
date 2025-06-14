const Joi = require('joi');

// Signup Validation Schema
const signupValidation = Joi.object({
    name: Joi.string().min(3).max(50).required().messages({
        'string.empty': 'İsim boş olamaz.',
        'string.min': 'İsim en az 3 karakter olmalıdır.',
        'string.max': 'İsim en fazla 50 karakter olabilir.',
        'any.required': 'İsim alanı zorunludur.',
    }),
    surname: Joi.string().min(3).max(50).required().messages({
        'string.empty': 'Soyisim boş olamaz.',
        'string.min': 'Soyisim en az 3 karakter olmalıdır.',
        'string.max': 'Soyisim en fazla 50 karakter olabilir.',
        'any.required': 'Soyisim alanı zorunludur.',
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Geçerli bir e-posta adresi giriniz.',
        'any.required': 'E-posta adresi zorunludur.',
    }),
    password: Joi.string().min(4).max(20).required().messages({
        'string.min': 'Şifre en az 6 karakter olmalıdır.',
        'string.max': 'Şifre en fazla 20 karakter olabilir.',
        'any.required': 'Şifre alanı zorunludur.',
    }),
    passwordAgain: Joi.any().valid(Joi.ref('password')).required().messages({
        'any.only': 'Şifreler eşleşmiyor.',
        'any.required': 'Şifre tekrar alanı zorunludur.',
    }),
});

// Login Validation Schema
const loginValidation = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Geçerli bir e-posta adresi giriniz.',
        'any.required': 'E-posta adresi zorunludur.',
    }),
    password: Joi.string().min(4).required().messages({
        'string.min': 'Şifre en az 6 karakter olmalıdır.',
        'any.required': 'Şifre alanı zorunludur.',
    }),
});

const accountSettingsValidation = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Mevcut şifre zorunludur.',
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.min': 'Yeni şifre en az 6 karakter olmalıdır.',
    'any.required': 'Yeni şifre zorunludur.',
  }),
  confirmPassword: Joi.any().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Yeni şifreler eşleşmiyor.',
    'any.required': 'Şifre tekrar alanı zorunludur.',
  }),
});

module.exports = { signupValidation, loginValidation, accountSettingsValidation };