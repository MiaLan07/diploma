const Joi = require('joi');

const registerSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.base': 'Имя должно быть строкой',
      'string.empty': 'Имя обязательно',
      'string.min': 'Имя должно содержать минимум 2 символа',
      'any.required': 'Поле имя обязательно',
    }),

  lastName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.base': 'Фамилия должна быть строкой',
      'string.empty': 'Фамилия обязательна',
      'string.min': 'Фамилия должна содержать минимум 2 символа',
      'any.required': 'Поле фамилия обязательно',
    }),

  email: Joi.string()
    .trim()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org', 'ru', 'ua'] } })
    .lowercase()
    .required()
    .messages({
      'string.email': 'Некорректный формат email',
      'any.required': 'Email обязателен',
    }),

  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, 'password strength')
    .required()
    .messages({
      'string.pattern.base': 'Пароль должен содержать минимум 8 символов, включая заглавную букву, строчную и цифру',
      'string.min': 'Пароль должен быть минимум 8 символов',
      'any.required': 'Пароль обязателен',
    }),

  phone: Joi.string()
    .trim()
    .pattern(/^\+?[1-9]\d{1,14}$/) // E.164 формат, опционально
    .allow(null, '')
    .messages({
      'string.pattern.base': 'Некорректный формат номера телефона',
    }),
});

const loginSchema = Joi.object({
  email: Joi.string()
    .trim()
    .email({ minDomainSegments: 2 })
    .lowercase()
    .required()
    .messages({
      'string.email': 'Некорректный формат email',
      'any.required': 'Email обязателен',
    }),

  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Пароль обязателен',
    }),
});

// Middleware-функция для валидации
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, {
    abortEarly: false,          // собрать все ошибки, а не остановиться на первой
    allowUnknown: false,        // запретить лишние поля
    stripUnknown: true,         // удалить лишние поля (если allowUnknown: true)
  });

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.context.key,
      message: detail.message,
    }));

    return res.status(400).json({
      success: false,
      message: 'Ошибка валидации',
      errors,
    });
  }

  next();
};

module.exports = {
  registerSchema,
  loginSchema,
  validate,
};