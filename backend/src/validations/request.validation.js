const Joi = require('joi');

const createRequestSchema = Joi.object({
  propertyId: Joi.number().integer().positive().required(),
  message:    Joi.string().max(2000).allow(null, ''),
});

const statusUpdateSchema = Joi.object({
  status: Joi.string()
    .valid('new', 'viewed', 'in_progress', 'closed', 'rejected')
    .required(),
});

const paramsIdSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const validateCreate = (req, res, next) => {
  const { error, value } = createRequestSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, errors: error.details });
  req.body = value;
  next();
};

const validateStatus = (req, res, next) => {
  const { error, value } = statusUpdateSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, errors: error.details });
  req.body = value;
  next();
};

const validateIdParam = (req, res, next) => {
  const { error, value } = paramsIdSchema.validate(req.params);
  if (error) return res.status(400).json({ success: false, errors: error.details });
  req.params = value;
  next();
};

const requestQuerySchema = Joi.object({
  status: Joi.string().valid('new', 'viewed', 'in_progress', 'closed', 'rejected'),
  propertyId: Joi.number().integer().positive(),
  userId:     Joi.number().integer().positive(), // только для админа
  page:       Joi.number().integer().min(1).default(1),
  limit:      Joi.number().integer().min(1).max(100).default(10),
  sortBy:     Joi.string().valid('createdAt', 'updatedAt', 'status').default('createdAt'),
  order:      Joi.string().valid('asc', 'desc').default('desc'),
});

const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      errors: error.details.map(d => ({ field: d.path.join('.'), message: d.message })),
    });
  }
  req.query = value; // очищенные и приведённые типы данные
  next();
};

module.exports = {
  validateCreate,
  validateStatus,
  validateIdParam,
  requestQuerySchema,
  validateQuery,
};