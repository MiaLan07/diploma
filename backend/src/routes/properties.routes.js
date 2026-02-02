const express = require('express');
const Joi = require('joi');
const { 
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadImages,
  setMainImage,
  deleteImage,
} = require('../controllers/property.controller');

const {
  validate,
  queryFilterSchema,
  createPropertySchema,
  updatePropertySchema,
  validateParams,
  getByIdSchema,
} = require('../validations/property.validation');

const { uploadMultiple } = require('../middleware/multer.config');

const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// Доступны всем (или можно ограничить авторизацией, если нужно)
router.get('/', validate(queryFilterSchema), getAllProperties);
router.get('/:id', validateParams(getByIdSchema), getPropertyById);

// Только админы
router.post('/',
  authMiddleware,
  adminMiddleware,
  validate(createPropertySchema),
  createProperty
);

router.put('/:id',
  authMiddleware,
  adminMiddleware,
  validateParams(getByIdSchema),
  validate(updatePropertySchema),
  updateProperty
);

router.delete('/:id',
  authMiddleware,
  adminMiddleware,
  validateParams(getByIdSchema),
  deleteProperty
);

router.post(
  '/:id/images',
  authMiddleware,
  adminMiddleware,
  validateParams(getByIdSchema),        // проверка :id
  uploadMultiple,
  uploadImages
);

router.put(
  '/:id/images/:imageId/main',
  authMiddleware,
  adminMiddleware,
  validateParams(Joi.object({
    id: Joi.number().integer().positive().required(),
    imageId: Joi.number().integer().positive().required(),
  })),
  setMainImage
);

router.delete(
  '/:propertyId/images/:imageId',
  authMiddleware,
  adminMiddleware,                        // только админ (можно потом расширить до владельца)
  validateParams(
    Joi.object({
      propertyId: Joi.number().integer().positive().required(),
      imageId:    Joi.number().integer().positive().required(),
    })
  ),
  deleteImage
);

module.exports = router;