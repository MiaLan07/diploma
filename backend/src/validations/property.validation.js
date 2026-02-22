const Joi = require('joi');

const createPropertySchema = Joi.object({
  operationId:      Joi.number().integer().positive().required(),
  propertyTypeId:   Joi.number().integer().positive().required(),
  housingTypeId:    Joi.number().integer().positive().allow(null),

  price:            Joi.number().precision(2).positive().required(),
  area:             Joi.number().precision(2).positive().min(1).allow(null),

  totalArea:        Joi.number().precision(2).positive().min(1).allow(null),
  livingArea:       Joi.number().precision(2).positive().min(1).allow(null),
  kitchenArea:      Joi.number().precision(2).positive().min(1).allow(null),

  roomsCount:       Joi.number().integer().min(0).allow(null),
  floor:            Joi.number().integer().min(-10).allow(null),
  totalFloors:      Joi.number().integer().min(1).allow(null),

  condition:        Joi.string().max(100).allow(null, ''),
  renovation:       Joi.string().max(100).allow(null, ''),
  renovationYear:   Joi.number().integer().min(1800).max(2105).allow(null),

  parking:          Joi.string().max(50).allow(null, ''),
  balcony:          Joi.string().max(100).allow(null, ''),
  bathroom:         Joi.string().max(100).allow(null, ''),
  windows:          Joi.string().max(100).allow(null, ''),
  view:             Joi.string().max(100).allow(null, ''),
  ownership:        Joi.string().max(100).allow(null, ''),

  hasElevator:      Joi.boolean().allow(null),
  yearBuilt:        Joi.number().integer().min(1800).max(2105).allow(null),

  address:          Joi.string().max(255).required(),
  shortDescription: Joi.string().max(500).allow(null, ''),
  fullDescription:  Joi.string().max(10000).allow(null, ''),

  encumbrance:      Joi.boolean().allow(null),
  mortgagePossible: Joi.boolean().allow(null),
  readyToMove:      Joi.boolean().allow(null),
  bargaining:       Joi.boolean().allow(null),

  status:           Joi.string().valid('draft', 'active', 'archived').optional().default('active'),
});

const updatePropertySchema = Joi.object({
  operationId:      Joi.number().integer().positive(),
  propertyTypeId:   Joi.number().integer().positive(),
  housingTypeId:    Joi.number().integer().positive().allow(null),

  price:            Joi.number().precision(2).positive(),
  area:             Joi.number().precision(2).positive().min(1).allow(null),

  totalArea:        Joi.number().precision(2).positive().min(1).allow(null),
  livingArea:       Joi.number().precision(2).positive().min(1).allow(null),
  kitchenArea:      Joi.number().precision(2).positive().min(1).allow(null),

  roomsCount:       Joi.number().integer().min(0).allow(null),
  floor:            Joi.number().integer().min(-10).allow(null),
  totalFloors:      Joi.number().integer().min(1).allow(null),

  condition:        Joi.string().max(100).allow(null, ''),
  renovation:       Joi.string().max(100).allow(null, ''),
  renovationYear:   Joi.number().integer().min(1800).max(2105).allow(null),

  parking:          Joi.string().max(50).allow(null, ''),
  balcony:          Joi.string().max(100).allow(null, ''),
  bathroom:         Joi.string().max(100).allow(null, ''),
  windows:          Joi.string().max(100).allow(null, ''),
  view:             Joi.string().max(100).allow(null, ''),
  ownership:        Joi.string().max(100).allow(null, ''),

  hasElevator:      Joi.boolean().allow(null),
  yearBuilt:        Joi.number().integer().min(1800).max(2105).allow(null),

  address:          Joi.string().max(255).allow(null),
  shortDescription: Joi.string().max(500).allow(null, ''),
  fullDescription:  Joi.string().max(10000).allow(null, ''),

  encumbrance:      Joi.boolean().allow(null),
  mortgagePossible: Joi.boolean().allow(null),
  readyToMove:      Joi.boolean().allow(null),
  bargaining:       Joi.boolean().allow(null),

  status:           Joi.string().valid('draft', 'active', 'archived').optional(),
}).min(1);

const getByIdSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

// для GET /:id — валидация params
const validateParams = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.params, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map(d => ({ field: d.context.key, message: d.message }));
    return res.status(400).json({ success: false, message: 'Некорректный ID', errors });
  }

  req.params = value;
  next();
};

const queryFilterSchema = Joi.object({
  operationId:      Joi.number().integer().positive(),
  propertyTypeId:   Joi.number().integer().positive(),
  housingTypeId:    Joi.number().integer().positive(),
  minPrice:         Joi.number().positive(),
  maxPrice:         Joi.number().positive(),
  minArea:          Joi.number().positive(),
  maxArea:          Joi.number().positive(),
  rooms:            Joi.alternatives().try(
    Joi.number().integer().min(0),
    Joi.string().valid('studio', '1', '2', '3', '4', '5+')
  ),
  floor:            Joi.number().integer(),
  hasElevator:      Joi.boolean(),
  yearMin:          Joi.number().integer().min(1900),
  yearMax:          Joi.number().integer().max(2100),
  search:           Joi.string().trim().max(100), // поиск по адресу/описанию
  page:             Joi.number().integer().min(1).default(1),
  limit:            Joi.number().integer().min(1).max(50).default(10),
  sortBy:           Joi.string().valid('price', 'area', 'yearBuilt', 'createdAt').default('createdAt'),
  order:            Joi.string().valid('asc', 'desc').default('desc'),
});

module.exports = {
  createPropertySchema,
  updatePropertySchema,
  queryFilterSchema,
  getByIdSchema,
  validateParams,
  validate: (schema) => (req, res, next) => {
    const data = req.method === 'GET' ? req.query : req.body;
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      allowUnknown: true, // для GET разрешаем лишние query-параметры
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map(d => ({ field: d.context.key, message: d.message }));
      return res.status(400).json({ success: false, message: 'Ошибка валидации', errors });
    }

    if (req.method === 'GET') req.query = value; // чистые query
    next();
  },
};