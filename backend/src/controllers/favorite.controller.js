const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const addToFavorites = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.id;

    // Проверяем существование объявления
    const propertyExists = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true },
    });

    if (!propertyExists) {
      return res.status(404).json({ success: false, message: 'Объект недвижимости не найден' });
    }

    // Пытаемся создать (если уже есть — Prisma выбросит ошибку из-за уникального индекса)
    const favorite = await prisma.favorite.create({
      data: {
        userId,
        propertyId,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Добавлено в избранное',
      data: favorite,
    });
  } catch (error) {
    if (error.code === 'P2002') { // уникальное нарушение
      return res.status(409).json({
        success: false,
        message: 'Объект уже в избранном',
      });
    }
    console.error('Add to favorites error:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};

const removeFromFavorites = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.id;

    const deleted = await prisma.favorite.deleteMany({
      where: {
        userId,
        propertyId,
      },
    });

    if (deleted.count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Объект не найден в избранном',
      });
    }

    res.json({
      success: true,
      message: 'Удалено из избранного',
    });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};

const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        property: {
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
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: favorites.map(fav => fav.property), // возвращаем только объекты недвижимости
      count: favorites.length,
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};

const checkIsFavorite = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.id;

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId,
        },
      },
      select: { id: true },
    });

    res.json({
      success: true,
      isFavorite: !!favorite,
    });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};

module.exports = {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  checkIsFavorite,
};