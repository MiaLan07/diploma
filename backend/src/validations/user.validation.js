const Joi = require('joi');

const changeEmailSchema = Joi.object({
  newEmail: Joi.string().email().required().messages({
    'string.email': 'Некорректный email',
    'any.required': 'Новый email обязателен'
  }),
});

const verifyEmailSchema = Joi.object({
  code: Joi.string().length(6).required().messages({
    'string.length': 'Код должен содержать 6 символов'
  }),
});

const changePhoneSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .required()
    .messages({
      'string.pattern.base': 'Некорректный формат номера телефона'
    }),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
});

const validateBody = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { 
    abortEarly: false,          // собрать все ошибки, а не первую
    stripUnknown: true          // удалять неизвестные поля
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Ошибка валидации',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  req.body = value; // заменяем body на валидированные и приведённые данные
  next();
};

module.exports = {
  changeEmailSchema,
  verifyEmailSchema,
  changePhoneSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  validateBody,
};