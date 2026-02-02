const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../utils/email');
const MAX_EMAIL_VERIFY_ATTEMPTS = 5;
const MAX_RESET_ATTEMPTS = 5;

const prisma = new PrismaClient();

const changeEmail = async (req, res) => {
  const { newEmail } = req.body;
  const userId = req.user.id;

  // Проверка уникальности нового email
  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { email: newEmail },
        { newEmail: newEmail },
      ],
    },
  });

  if (existing) {
    return res.status(409).json({ message: 'Этот email уже используется' });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.user.update({
    where: { id: userId },
    data: {
      newEmail,
      emailVerificationCode: code,
      emailVerificationExpires: expires,
      emailVerificationAttempts: 0, // сбрасываем счётчик при новом запросе
    },
  });

  await sendEmail({
    to: newEmail,
    subject: 'Подтверждение смены email',
    html: `<h2>Код подтверждения: <strong>${code}</strong></h2><p>Действует 15 минут.</p>`,
  });

  res.json({ message: 'Код отправлен на новый email' });
};

const verifyNewEmail = async (req, res) => {
  const { code } = req.body;
  const userId = req.user.id;

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user.newEmail || !user.emailVerificationCode || !user.emailVerificationExpires) {
    return res.status(400).json({ message: 'Нет активного запроса на смену email' });
  }

  if (user.emailVerificationExpires < new Date()) {
    return res.status(410).json({ message: 'Код устарел. Запросите новый.' });
  }

  // Проверка попыток
  if (user.emailVerificationAttempts >= MAX_EMAIL_VERIFY_ATTEMPTS) {
    return res.status(429).json({
      message: `Превышено количество попыток (${MAX_EMAIL_VERIFY_ATTEMPTS}). Запросите новый код.`
    });
  }

  // Увеличиваем счётчик попыток
  await prisma.user.update({
    where: { id: userId },
    data: { emailVerificationAttempts: { increment: 1 } },
  });

  if (user.emailVerificationCode !== code) {
    return res.status(400).json({ message: 'Неверный код' });
  }

  // Успешное подтверждение
  await prisma.user.update({
    where: { id: userId },
    data: {
      email: user.newEmail,
      newEmail: null,
      emailVerificationCode: null,
      emailVerificationExpires: null,
      emailVerificationAttempts: 0,
    },
  });

  res.json({ message: 'Email успешно изменён' });
};

const changePhone = async (req, res) => {
  const { phone } = req.body;
  const userId = req.user.id;

  await prisma.user.update({
    where: { id: userId },
    data: { phone },
  });

  res.json({ message: 'Номер телефона обновлён' });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  // Не раскрываем, существует ли пользователь
  if (!user) {
    return res.json({ message: 'Если email зарегистрирован, инструкция отправлена' });
  }

  // Проверка лимита попыток восстановления
  if (user.resetPasswordAttempts >= MAX_RESET_ATTEMPTS) {
    return res.status(429).json({
      message: `Превышено количество попыток восстановления (${MAX_RESET_ATTEMPTS}). Попробуйте позже.`
    });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: token,
      resetPasswordExpires: expires,
      resetPasswordAttempts: { increment: 1 },
    },
  });

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: 'Восстановление пароля',
    html: `
      <h2>Сброс пароля</h2>
      <p>Перейдите по ссылке для создания нового пароля:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>Ссылка действительна 1 час.</p>
    `,
  });

  res.json({ message: 'Инструкция отправлена на почту' });
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: { gt: new Date() },
    },
  });

  if (!user) {
    return res.status(400).json({ message: 'Недействительный или просроченный токен' });
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      resetPasswordAttempts: 0, // сбрасываем счётчик после успеха
    },
  });

  res.json({ message: 'Пароль успешно изменён' });
};

module.exports = {
  changeEmail,
  verifyNewEmail,
  changePhone,
  forgotPassword,
  resetPassword,
};