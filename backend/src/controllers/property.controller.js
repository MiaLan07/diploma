const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

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

    const skip = (page - 1) * limit;

    const where = {};

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

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [sortBy]: order },
        include: {
          operation: { select: { name: true } },
          propertyType: { select: { name: true } },
          housingType: { select: { name: true } },
          images: { select: { url: true, isMain: true }, orderBy: { isMain: 'desc' } },
        },
      }),
      prisma.property.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: properties,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ success: false, message: 'Ошибка при получении объектов' });
  }
};

const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: { id: Number(id) },
      include: {
        operation:     { select: { name: true } },
        propertyType:  { select: { name: true } },
        housingType:   { select: { name: true } },
        images: {
          select: { id: true, url: true, isMain: true },
          orderBy: { isMain: 'desc' },
        },
      },
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
    const userId = req.user.id; // из authMiddleware

    // Можно добавить поле ownerId в модель Property позже,
    // если хочешь привязывать объявления к конкретному пользователю
    // пока просто создаём от имени авторизованного

    const newProperty = await prisma.property.create({
      data: {
        ...data,
        price: data.price ? new Prisma.Decimal(data.price) : undefined,
        area:  data.area  ? new Prisma.Decimal(data.area)  : undefined,
        latitude:  data.latitude  ? new Prisma.Decimal(data.latitude)  : undefined,
        longitude: data.longitude ? new Prisma.Decimal(data.longitude) : undefined,
        // ownerId: userId,   // ← раскомментировать после добавления поля в schema.prisma
      },
    });

    res.status(201).json({
      success: true,
      data: newProperty,
    });
  } catch (error) {
    console.error('Create property error:', error);
    if (error.code === 'P2003') { // foreign key violation
      return res.status(400).json({ success: false, message: 'Некорректные ссылки на справочники (operationId, propertyTypeId и т.д.)' });
    }
    res.status(500).json({ success: false, message: 'Ошибка при создании объекта' });
  }
};

const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const updateData = {
      ...data,
      price:     data.price     !== undefined ? new Prisma.Decimal(data.price)     : undefined,
      area:      data.area      !== undefined ? new Prisma.Decimal(data.area)      : undefined,
      latitude:  data.latitude  !== undefined ? new Prisma.Decimal(data.latitude)  : undefined,
      longitude: data.longitude !== undefined ? new Prisma.Decimal(data.longitude) : undefined,
    };

    const updated = await prisma.property.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        operation:     { select: { name: true } },
        propertyType:  { select: { name: true } },
        housingType:   { select: { name: true } },
        images:        true,  // или select нужные поля
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
      return res.status(404).json({
        success: false,
        message: 'Объект недвижимости не найден'
      });
    }

    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: 'Некорректные ссылки на справочники (operationId, propertyTypeId и т.д.)'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении объекта'
    });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const propertyId = Number(id);

    // Находим все изображения заранее (чтобы удалить файлы)
    const images = await prisma.propertyImage.findMany({
      where: { propertyId },
      select: { url: true },
    });

    // Удаляем файлы с диска
    images.forEach((img) => {
      if (img.url.startsWith('/uploads/')) {
        const filePath = path.join(__dirname, '..', '..', img.url.substring(1));
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
            console.log(`Удалён файл: ${filePath}`);
          } catch (err) {
            console.warn(`Не удалось удалить файл ${filePath}:`, err.message);
          }
        }
      }
    });

    // Удаляем объект → каскадно удалит все PropertyImage записи
    await prisma.property.delete({
      where: { id: propertyId },
    });

    res.json({
      success: true,
      message: 'Объект недвижимости и все его фотографии удалены',
    });
  } catch (error) {
    console.error('Delete property error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Объект не найден' });
    }
    res.status(500).json({ success: false, message: 'Ошибка удаления объекта' });
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

module.exports = {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadImages,
  setMainImage,
  deleteImage,
};