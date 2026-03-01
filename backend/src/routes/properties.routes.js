const express = require('express');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { 
  getAllProperties,
  getPropertyById,
  getPropertyBySlug,
  createProperty,
  updateProperty,
  archiveProperty,
  restoreProperty,
  uploadImages,
  setMainImage,
  deleteImage,
  deleteProperty,
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
    console.log('Запрос /properties/map');

    const properties = await prisma.property.findMany({
      where: {
        status: 'active',
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        id: true,
        title: true,           // ← добавили
        slug: true,            // ← добавили (главное!)
        address: true,
        price: true,
        roomsCount: true,      // ← правильное название поля из schema.prisma
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

    console.log(`Найдено объектов: ${properties.length}`);

    const mapData = properties.map(p => ({
      id: p.id,
      title: p.title || `Объект №${p.id}`,
      slug: p.slug || p.id.toString(),           // fallback на id, если slug ещё не сгенерирован
      address: p.address || 'Адрес не указан',
      price: p.price,
      rooms: p.roomsCount,                       // ← переименовали для фронтенда
      shortDescription: p.shortDescription || '',
      lat: Number(p.latitude),
      lng: Number(p.longitude),
      mainImage: p.images[0]?.url || '/images/placeholder.jpg',
    }));

    res.json({
      success: true,
      count: mapData.length,
      data: mapData,
    });
  } catch (err) {
    console.error('Map route error:', err);
    res.status(500).json({
      success: false,
      message: 'Ошибка при загрузке данных для карты',
      error: err.message,
    });
  }
});
// Доступны всем (или можно ограничить авторизацией, если нужно)
router.get('/', validate(queryFilterSchema), getAllProperties);
router.get('/:slug', getPropertyBySlug);
router.get('/id/:id', validateParams(getByIdSchema), getPropertyById);

// Только админы
router.post('/',
  authMiddleware,
  adminMiddleware,
  uploadMultiple,
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