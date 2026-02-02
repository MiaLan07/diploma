// src/create-first-admin.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const email = 'maxalan2007@gmail.com';
    const password = '377A80bm';           // ← поменяй на свой сильный пароль!
    const firstName = 'Админ';
    const lastName = 'Главный';

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      console.log('Админ уже существует →', existing.email);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        isAdmin: true,
        phone: '+79780000000', // опционально
      },
    });

    console.log('Админ успешно создан! ✨');
    console.log('Email →', admin.email);
    console.log('Пароль →', password);
    console.log('isAdmin →', admin.isAdmin);
  } catch (e) {
    console.error('Ошибка создания админа:', e);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();