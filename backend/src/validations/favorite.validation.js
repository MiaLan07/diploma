const Joi = require('joi');

const favoriteParamsSchema = Joi.object({
  propertyId: Joi.number().integer().positive().required(),
});

const validateFavoriteParams = (req, res, next) => {
  const { error, value } = favoriteParamsSchema.validate(req.params, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map(d => ({ field: d.context.key, message: d.message }));
    return res.status(400).json({ success: false, message: 'Ошибка валидации', errors });
  }

  req.params = value;
  next();
};

module.exports = { validateFavoriteParams };