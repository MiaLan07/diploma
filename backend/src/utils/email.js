// src/utils/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'mail.ru', // или другой SMTP: mail.ru, yandex.ru и т.д.
  auth: {
    user: process.env.EMAIL_USER,      // например: yourapp@gmail.com
    pass: process.env.EMAIL_PASSWORD,  // app password (не обычный пароль!)
  },
});

const sendNewRequestEmail = async (requestData) => {
  try {
    const info = await transporter.sendMail({
      from: `"RealEstate App" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || 'admin@example.com',
      subject: 'Новая заявка на объект недвижимости',
      text: `
        Новая заявка!
        Пользователь ID: ${requestData.userId}
        Объект ID: ${requestData.propertyId}
        Сообщение: ${requestData.message || 'Без сообщения'}
        Статус: ${requestData.status}
        Дата: ${new Date().toLocaleString('ru-RU')}
      `,
      html: `
        <h2>Новая заявка!</h2>
        <p><strong>Пользователь ID:</strong> ${requestData.userId}</p>
        <p><strong>Объект ID:</strong> ${requestData.propertyId}</p>
        <p><strong>Сообщение:</strong> ${requestData.message || 'Без сообщения'}</p>
        <p><strong>Статус:</strong> ${requestData.status}</p>
        <p><strong>Дата:</strong> ${new Date().toLocaleString('ru-RU')}</p>
      `,
    });

    console.log('Email sent:', info.messageId);
  } catch (err) {
    console.error('Ошибка отправки email:', err);
  }
};

async function sendEmail({ to, subject, html }) {
  const mailOptions = {
    from: `"Real Estate" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendNewRequestEmail, sendEmail };