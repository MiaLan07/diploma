const express = require('express');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { 
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  archiveProperty,
  restoreProperty,
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

router.get('/map', async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      where: {
        status: "active",               // строка, а не enum
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        id: true,
        address: true,
        price: true,
        rooms: true,
        shortDescription: true,
        latitude: true,
        longitude: true,
        images: {
          where: { isMain: true },
          take: 1,
          select: { url: true },
        },
      },
    });

    const mapData = properties.map(p => ({
      id: p.id,
      title: `Объект №${p.id}`, // или поле name, если добавите
      address: p.address || 'Адрес не указан',
      price: p.price,
      rooms: p.rooms,
      shortDescription: p.shortDescription || '',
      lat: p.latitude,
      lng: p.longitude,
      mainImage: p.images[0]?.url || '/images/placeholder.jpg',
    }));

    res.json({
      success: true,
      count: mapData.length,
      data: mapData,
    });
  } catch (err) {
    console.error('Map error:', err);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});
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

router.patch('/:id/archive', authMiddleware, adminMiddleware, archiveProperty);
router.patch('/:id/restore', authMiddleware, adminMiddleware, restoreProperty);

router.post('/:id/images',
  authMiddleware,
  adminMiddleware,
  validateParams(getByIdSchema),        // проверка :id
  uploadMultiple,
  uploadImages
);

router.put('/:id/images/:imageId/main',
  authMiddleware,
  adminMiddleware,
  validateParams(Joi.object({
    id: Joi.number().integer().positive().required(),
    imageId: Joi.number().integer().positive().required(),
  })),
  setMainImage
);

router.delete('/:propertyId/images/:imageId',
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