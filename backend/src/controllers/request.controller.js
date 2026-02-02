const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createRequest = async (req, res) => {
  try {
    const { propertyId, message } = req.body;
    const userId = req.user.id;

    const propertyExists = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true },
    });

    if (!propertyExists) {
      return res.status(404).json({ success: false, message: 'Объект не найден' });
    }

    const existing = await prisma.request.findFirst({
      where: { userId, propertyId, status: { not: 'closed' } },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'У вас уже есть активная заявка на этот объект',
      });
    }

    const request = await prisma.request.create({
      data: {
        userId,
        propertyId,
        message: message || null,
        status: 'new',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Заявка создана',
      data: request,
    });

    await sendNewRequestEmail(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Ошибка создания заявки' });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      status,
      propertyId,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const skip = (page - 1) * limit;

    const where = { userId };
    if (status) where.status = status;
    if (propertyId) where.propertyId = Number(propertyId);

    const [requests, total] = await Promise.all([
      prisma.request.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [sortBy]: order },
        include: {
          property: {
            select: {
              id: true,
              address: true,
              price: true,
              shortDescription: true,
              images: { select: { url: true }, take: 1, where: { isMain: true } },
            },
          },
        },
      }),
      prisma.request.count({ where }),
    ]);

    res.json({
      success: true,
      data: requests,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Ошибка получения заявок' });
  }
};

const getAllRequests = async (req, res) => {
  try {
    const {
      status,
      userId,
      propertyId,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const skip = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (userId) where.userId = Number(userId);
    if (propertyId) where.propertyId = Number(propertyId);

    const [requests, total] = await Promise.all([
      prisma.request.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [sortBy]: order },
        include: {
          user:    { select: { id: true, firstName: true, lastName: true, email: true } },
          property: { select: { id: true, address: true, price: true } },
        },
      }),
      prisma.request.count({ where }),
    ]);

    res.json({
      success: true,
      data: requests,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Ошибка' });
  }
};

const updateRequestStatus = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Только администратор может менять статус' });
    }

    const { id } = req.params;
    const { status } = req.body;

    const updated = await prisma.request.update({
      where: { id: Number(id) },
      data: { status },
    });

    res.json({
      success: true,
      message: 'Статус обновлён',
      data: updated,
    });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Заявка не найдена' });
    }
    res.status(500).json({ success: false, message: 'Ошибка обновления' });
  }
};

module.exports = {
  createRequest,
  getMyRequests,
  getAllRequests,
  updateRequestStatus,
  // можно добавить getOneRequest, deleteRequest и т.д.
};