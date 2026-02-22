const slugify = require('slugify');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');
const { geocodeAddress } = require('../utils/geocoder');

const getAllProperties = async (req, res) => {
  try {
    const {
      operationId, propertyTypeId, housingTypeId,
      minPrice, maxPrice, minArea, maxArea,
      rooms, floor, hasElevator,
      yearMin, yearMax,
      search,
      page = 1, limit = 10,
      sortBy = 'createdAt', order = 'desc',
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where = { status: 'active' };
    if (req.query.status && req.user?.isAdmin) {
      const validStatuses = ['active', 'draft', 'archived'];
      if (validStatuses.includes(req.query.status)) {
        where.status = req.query.status;
      }
    } else if (req.query.includeArchived && req.user?.isAdmin) {
      delete where.status;
    }

    if (operationId)     where.operationId     = Number(operationId);
    if (propertyTypeId)  where.propertyTypeId  = Number(propertyTypeId);
    if (housingTypeId)   where.housingTypeId   = Number(housingTypeId);
    if (floor)           where.floor           = Number(floor);
    if (hasElevator !== undefined) where.hasElevator = hasElevator === 'true';

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    if (minArea || maxArea) {
      where.area = {};
      if (minArea) where.area.gte = Number(minArea);
      if (maxArea) where.area.lte = Number(maxArea);
    }

    if (yearMin || yearMax) {
      where.yearBuilt = {};
      if (yearMin) where.yearBuilt.gte = Number(yearMin);
      if (yearMax) where.yearBuilt.lte = Number(yearMax);
    }

    if (rooms) {
      if (typeof rooms === 'number') {
        where.rooms = Number(rooms);
      } else if (rooms === 'studio') {
        where.rooms = 0; // или 1 — зависит от твоей логики
      } else if (rooms === '5+') {
        where.rooms = { gte: 5 };
      } else {
        where.rooms = Number(rooms);
      }
    }

    if (search) {
      where.OR = [
        { address: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { fullDescription: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderByClause = { [sortBy]: order }; // Исправлено: динамический orderBy

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take,
        orderBy: orderByClause,
        include: {
          images: { take: 1, where: { isMain: true } },
          operation: true,
          propertyType: true,
          housingType: true,
        }
      }),
      prisma.property.count({ where })
    ]);

    res.json({
      success: true,
      data: properties,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + take < total,
        hasPrev: Number(page) > 1
      }
    });
  } catch (err) {
    next(err);
  }
};

const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    const where = { id: Number(id) };

    const property = await prisma.property.findUnique({
      where,
      include: {
        operation:     { select: { name: true } },
        propertyType:  { select: { name: true } },
        housingType:   { select: { name: true } },
        images: {
          select: { id: true, url: true, isMain: true },
          orderBy: [
            { isMain: 'desc' },   // главное фото — первым в массиве
            { createdAt: 'asc' }  // остальные по порядку загрузки
          ],
        },
      }
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Объект недвижимости не найден',
      });
    }

    res.json({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error('Get property by id error:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};

const createProperty = async (req, res) => {
  try {
    const data = req.body;
    let latitude = null;
    let longitude = null;

    if (data.address?.trim()) {
      const geo = await geocodeAddress(data.address.trim());
      if (geo?.latitude !== null && geo?.longitude !== null) {
        latitude = geo.latitude;
        longitude = geo.longitude;
        console.log(`Геокодировано: ${data.address} → ${latitude}, ${longitude}`);
      } else {
        console.warn(`Геокодирование не удалось: ${data.address}`);
      }
    }

    const propertyData = {
      title:                data.title                || null,
      operationId:          Number(data.operationId),
      propertyTypeId:       Number(data.propertyTypeId),
      housingTypeId:        data.housingTypeId ? Number(data.housingTypeId) : null,
      price:                Number(data.price),
      area:                 data.area                 ? Number(data.area)                 : null,
      totalArea:            data.totalArea            ? Number(data.totalArea)            : null,
      livingArea:           data.livingArea           ? Number(data.livingArea)           : null,
      kitchenArea:          data.kitchenArea          ? Number(data.kitchenArea)          : null,
      roomsCount:           data.roomsCount           ? Number(data.roomsCount)           : null,
      floor:                data.floor                ? Number(data.floor)                : null,
      totalFloors:          data.totalFloors          ? Number(data.totalFloors)          : null,
      buildingType:         data.buildingType         || null,
      condition:            data.condition            || null,
      renovation:           data.renovation           || null,
      renovationYear:       data.renovationYear       ? Number(data.renovationYear)       : null,
      balcony:              data.balcony              || null,
      bathroom:             data.bathroom             || null,
      windows:              data.windows              || null,
      view:                 data.view                 || null,
      hasElevator:          data.hasElevator          === true || data.hasElevator === 'true',
      yearBuilt:            data.yearBuilt            ? Number(data.yearBuilt)            : null,
      shortDescription:     data.shortDescription     || null,
      fullDescription:      data.fullDescription      || null,
      address:              data.address              || null,
      latitude,
      longitude,
      ownership:            data.ownership            || null,
      encumbrance:          data.encumbrance          === true || data.encumbrance === 'true',
      readyToMove:          data.readyToMove          === true || data.readyToMove === 'true',
      bargaining:           data.bargaining           !== false && data.bargaining !== 'false', // дефолт true
      mortgagePossible:     data.mortgagePossible     === true || data.mortgagePossible === 'true',
      maternalCapital:      data.maternalCapital      === true || data.maternalCapital === 'true',
      status:               'active',
      slug:                 await generateSlug(data.address, data.shortDescription, null),

      // Длинные текстовые описания (все nullable)
      buildingDescription:     data.buildingDescription     || null,
      yearBuiltDescription:    data.yearBuiltDescription    || null,
      environment:             data.environment             || null,
      infrastructure:          data.infrastructure          || null,
      transportAccessibility:  data.transportAccessibility  || null,
      communications:          data.communications          || null,
      legalPurity:             data.legalPurity             || null,
      mortgageDescription:     data.mortgageDescription     || null,
      livingDescription:       data.livingDescription       || null,
    };

    // Защита от NaN для всех числовых полей
    const numericRequired = ['operationId', 'propertyTypeId', 'price'];
    const numericOptional = [
      'housingTypeId', 'area', 'totalArea', 'livingArea', 'kitchenArea',
      'roomsCount', 'floor', 'totalFloors', 'yearBuilt', 'renovationYear',
      'latitude', 'longitude'
    ];

    for (const field of numericRequired) {
      if (isNaN(propertyData[field])) {
        return res.status(400).json({
          success: false,
          message: `Обязательное поле ${field} должно быть числом`
        });
      }
    }

    for (const field of numericOptional) {
      if (propertyData[field] !== null && isNaN(propertyData[field])) {
        return res.status(400).json({
          success: false,
          message: `Поле ${field} содержит некорректное число`
        });
      }
    }

    const newProperty = await prisma.property.create({ data: propertyData });

    // Загрузка изображений
    if (req.files?.length) {
      const imageRecords = req.files.map((file, idx) => ({
        propertyId: newProperty.id,
        url: `/uploads/properties/${file.filename}`,
        isMain: idx === 0, // первое фото — главное
      }));

      await prisma.propertyImage.createMany({ data: imageRecords });
    }

    res.status(201).json({
      success: true,
      data: newProperty,
    });
  } catch (error) {
    console.error('Create property error:', error);

    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: 'Некорректные ссылки на справочники (operationId, propertyTypeId, housingTypeId)'
      });
    }
    if (error.code === 'P2002' && error.meta?.constraint === 'Property_slug_key') {
      return res.status(409).json({
        success: false,
        message: 'Slug уже занят — измените адрес или описание'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при создании объекта'
    });
  }
};

const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    let latitude = data.latitude ? Number(data.latitude) : undefined;
    let longitude = data.longitude ? Number(data.longitude) : undefined;

    if (data.address && (!latitude || !longitude || isNaN(latitude) || isNaN(longitude))) {
      const geo = await geocodeAddress(data.address.trim());
      if (geo?.latitude !== null && geo?.longitude !== null) {
        latitude = geo.latitude;
        longitude = geo.longitude;
      }
    }

    const updateData = {
      title:                data.title                !== undefined ? data.title                : undefined,
      operationId:          data.operationId          ? Number(data.operationId)          : undefined,
      propertyTypeId:       data.propertyTypeId       ? Number(data.propertyTypeId)       : undefined,
      housingTypeId:        data.housingTypeId        ? Number(data.housingTypeId)        : undefined,
      price:                data.price                ? Number(data.price)                : undefined,
      area:                 data.area                 ? Number(data.area)                 : undefined,
      totalArea:            data.totalArea            ? Number(data.totalArea)            : undefined,
      livingArea:           data.livingArea           ? Number(data.livingArea)           : undefined,
      kitchenArea:          data.kitchenArea          ? Number(data.kitchenArea)          : undefined,
      roomsCount:           data.roomsCount           ? Number(data.roomsCount)           : undefined,
      floor:                data.floor                ? Number(data.floor)                : undefined,
      totalFloors:          data.totalFloors          ? Number(data.totalFloors)          : undefined,
      buildingType:         data.buildingType         !== undefined ? data.buildingType         : undefined,
      condition:            data.condition            !== undefined ? data.condition            : undefined,
      renovation:           data.renovation           !== undefined ? data.renovation           : undefined,
      renovationYear:       data.renovationYear       ? Number(data.renovationYear)       : undefined,
      balcony:              data.balcony              !== undefined ? data.balcony              : undefined,
      bathroom:             data.bathroom             !== undefined ? data.bathroom             : undefined,
      windows:              data.windows              !== undefined ? data.windows              : undefined,
      view:                 data.view                 !== undefined ? data.view                 : undefined,
      hasElevator:          data.hasElevator          !== undefined ? (data.hasElevator === true || data.hasElevator === 'true') : undefined,
      yearBuilt:            data.yearBuilt            ? Number(data.yearBuilt)            : undefined,
      shortDescription:     data.shortDescription     !== undefined ? data.shortDescription     : undefined,
      fullDescription:      data.fullDescription      !== undefined ? data.fullDescription      : undefined,
      address:              data.address              !== undefined ? data.address              : undefined,
      latitude,
      longitude,
      ownership:            data.ownership            !== undefined ? data.ownership            : undefined,
      encumbrance:          data.encumbrance          !== undefined ? (data.encumbrance === true || data.encumbrance === 'true') : undefined,
      readyToMove:          data.readyToMove          !== undefined ? (data.readyToMove === true || data.readyToMove === 'true') : undefined,
      bargaining:           data.bargaining           !== undefined ? (data.bargaining === true || data.bargaining === 'true') : undefined,
      mortgagePossible:     data.mortgagePossible     !== undefined ? (data.mortgagePossible === true || data.mortgagePossible === 'true') : undefined,
      maternalCapital:      data.maternalCapital      !== undefined ? (data.maternalCapital === true || data.maternalCapital === 'true') : undefined,
      status:               data.status               !== undefined ? data.status               : undefined,

      buildingDescription:     data.buildingDescription     !== undefined ? data.buildingDescription     : undefined,
      yearBuiltDescription:    data.yearBuiltDescription    !== undefined ? data.yearBuiltDescription    : undefined,
      environment:             data.environment             !== undefined ? data.environment             : undefined,
      infrastructure:          data.infrastructure          !== undefined ? data.infrastructure          : undefined,
      transportAccessibility:  data.transportAccessibility  !== undefined ? data.transportAccessibility  : undefined,
      communications:          data.communications          !== undefined ? data.communications          : undefined,
      legalPurity:             data.legalPurity             !== undefined ? data.legalPurity             : undefined,
      mortgageDescription:     data.mortgageDescription     !== undefined ? data.mortgageDescription     : undefined,
      livingDescription:       data.livingDescription       !== undefined ? data.livingDescription       : undefined,

      slug: data.address || data.shortDescription
        ? await generateSlug(data.address, data.shortDescription, id)
        : undefined,
    };

    // Защита от NaN
    const numericFields = [
      'operationId', 'propertyTypeId', 'housingTypeId', 'price', 'area',
      'totalArea', 'livingArea', 'kitchenArea', 'roomsCount', 'floor', 'totalFloors',
      'yearBuilt', 'renovationYear', 'latitude', 'longitude'
    ];

    for (const field of numericFields) {
      const val = updateData[field];
      if (val !== undefined && isNaN(val)) {
        return res.status(400).json({
          success: false,
          message: `Поле ${field} содержит некорректное число`
        });
      }
    }

    const updated = await prisma.property.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        operation:     { select: { name: true } },
        propertyType:  { select: { name: true } },
        housingType:   { select: { name: true } },
        images:        true,
      },
    });

    res.json({
      success: true,
      message: 'Объект успешно обновлён',
      data: updated,
    });
  } catch (error) {
    console.error('Update property error:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Объект не найден' });
    }
    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: 'Некорректные ссылки на справочники'
      });
    }
    if (error.code === 'P2002' && error.meta?.constraint === 'Property_slug_key') {
      return res.status(409).json({
        success: false,
        message: 'Slug уже занят'
      });
    }

    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};

// Функция для генерации уникального slug
const generateSlug = async (address, shortDescription, id) => {
  let base = `${address || ''} ${shortDescription || ''}`.trim();
  if (!base) base = `property-${id || Date.now()}`;  // fallback

  let slug = slugify(base, { lower: true, strict: true, locale: 'ru' });
  let uniqueSlug = slug;
  let counter = 1;

  while (true) {
    const existing = await prisma.property.findUnique({
      where: { slug: uniqueSlug },
    });

    if (!existing || existing.id === Number(id)) break;  // Если не существует или это тот же объект

    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
};

const archiveProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const status = req.body.status || 'draft';
    const updateData = { status };

    if (status === 'archived') {
      updateData.archivedAt = new Date(); // Установка archivedAt при архивировании
    }

    const property = await prisma.property.update({
      where: { id: Number(id) },
      data: updateData,
    });
    res.json({ success: true, message: 'Объект перенесён в архив', data: property });
  } catch (err) {
    next(err);
  }
};

const restoreProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await prisma.property.update({
      where: { id: Number(id) },
      data: { status: 'active' }
    });
    res.json({ success: true, message: 'Объект восстановлен', data: property });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Ошибка восстановления' });
  }
};

const uploadImages = async (req, res) => {
  try {
    const { id } = req.params;
    const propertyId = Number(id);

    // Проверяем, существует ли объект
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Объект недвижимости не найден',
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Не загружено ни одного файла',
      });
    }

    // Определяем, есть ли уже главное фото
    const hasMain = await prisma.propertyImage.findFirst({
      where: { propertyId, isMain: true },
    });

    const images = req.files.map((file, index) => ({
      propertyId,
      url: `/uploads/properties/${file.filename}`,
      isMain: !hasMain && index === 0, // первое фото становится главным, если главного ещё нет
    }));

    // Массовое создание записей
    await prisma.propertyImage.createMany({
      data: images,
    });

    // Возвращаем созданные изображения
    const createdImages = await prisma.propertyImage.findMany({
      where: { propertyId },
      orderBy: { isMain: 'desc' },
    });

    res.status(201).json({
      success: true,
      message: `Загружено ${req.files.length} фотографий`,
      data: createdImages,
    });
  } catch (error) {
    console.error('Upload images error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при загрузке фотографий',
    });
  }
};
// Опционально: сделать одно фото главным
const setMainImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    // Сбрасываем все isMain
    await prisma.propertyImage.updateMany({
      where: { propertyId: Number(id) },
      data: { isMain: false },
    });

    // Устанавливаем новое главное
    const updated = await prisma.propertyImage.update({
      where: { id: Number(imageId) },
      data: { isMain: true },
    });

    res.json({
      success: true,
      message: 'Главное фото обновлено',
      data: updated,
    });
  } catch (error) {
    console.error('Set main image error:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};

const deleteImage = async (req, res) => {
  try {
    const { propertyId, imageId } = req.params;
    const propId = Number(propertyId);
    const imgId  = Number(imageId);

    // Находим фотографию
    const image = await prisma.propertyImage.findUnique({
      where: { id: imgId },
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Фотография не найдена',
      });
    }

    if (image.propertyId !== propId) {
      return res.status(400).json({
        success: false,
        message: 'Фотография не принадлежит указанному объекту недвижимости',
      });
    }

    // Удаляем файл с диска (опционально, но рекомендуется)
    if (image.url.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', '..', image.url.substring(1)); // убираем первый /
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Файл удалён: ${filePath}`);
      }
    }

    // Удаляем запись из базы (каскадно уже настроено, но явно для ясности)
    await prisma.propertyImage.delete({
      where: { id: imgId },
    });

    // Опционально: если удаляли главное фото — делаем первое оставшееся главным
    const remainingImages = await prisma.propertyImage.findMany({
      where: { propertyId: propId },
      orderBy: { createdAt: 'asc' },
    });

    if (remainingImages.length > 0 && !remainingImages.some(img => img.isMain)) {
      await prisma.propertyImage.update({
        where: { id: remainingImages[0].id },
        data: { isMain: true },
      });
    }

    res.json({
      success: true,
      message: 'Фотография успешно удалена',
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении фотографии',
    });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const propertyId = Number(id);

    // 1. Проверяем существование объекта
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { images: true }, // чтобы знать, какие файлы удалять
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Объект недвижимости не найден',
      });
    }

    // 2. (Опционально) Дополнительная защита — например, запрет удаления активных объявлений
    // Раскомментируйте, если хотите запретить удаление активных объектов
    /*
    if (property.status === 'active') {
      return res.status(403).json({
        success: false,
        message: 'Нельзя удалить активное объявление. Сначала заархивируйте.',
      });
    }
    */

    // 3. Удаляем все связанные изображения с диска
    if (property.images?.length > 0) {
      for (const img of property.images) {
        if (img.url?.startsWith('/uploads/')) {
          const filePath = path.join(__dirname, '..', '..', img.url.substring(1));
          if (fs.existsSync(filePath)) {
            try {
              fs.unlinkSync(filePath);
              console.log(`Удалён файл изображения: ${filePath}`);
            } catch (fsErr) {
              console.warn(`Не удалось удалить файл: ${filePath}`, fsErr);
              // продолжаем — не прерываем удаление объекта из-за одной картинки
            }
          }
        }
      }
    }

    // 4. Удаляем сам объект (каскадно удалятся все PropertyImage, если настроено onDelete: Cascade)
    await prisma.property.delete({
      where: { id: propertyId },
    });

    res.json({
      success: true,
      message: 'Объект недвижимости и все связанные фотографии успешно удалены',
    });

  } catch (error) {
    console.error('Delete property error:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Объект недвижимости не найден',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении объекта недвижимости',
      error: error.message,
    });
  }
};

const getPropertyBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: 'Slug обязателен в URL'
      });
    }

    const property = await prisma.property.findUnique({
      where: { slug },
      include: {
        operation:     { select: { name: true } },
        propertyType:  { select: { name: true } },
        housingType:   { select: { name: true } },
        images: {
          select: { id: true, url: true, isMain: true },
          orderBy: [
            { isMain: 'desc' },    // главное фото первым
            { createdAt: 'asc' }   // остальные по порядку загрузки
          ],
        },
      }
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Объект недвижимости по данному адресу (slug) не найден'
      });
    }

    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error('Get property by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении объекта'
    });
  }
};

module.exports = {
  getAllProperties,
  getPropertyById,
  getPropertyBySlug,          // ← добавили
  createProperty,
  updateProperty,
  archiveProperty,
  restoreProperty,
  uploadImages,
  setMainImage,
  deleteImage,
  deleteProperty,
};