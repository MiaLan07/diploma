const express = require('express');
const { authMiddleware } = require('../middleware/auth.middleware');
const {
  changeEmail,
  verifyNewEmail,
  changePhone,
  forgotPassword,
  resetPassword,
} = require('../controllers/user.controller');

const {
  changeEmailSchema,
  verifyEmailSchema,
  changePhoneSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  validateBody,               // ← добавили
} = require('../validations/user.validation');

const router = express.Router();

// Защищённые роуты (нужен токен)
router.use(authMiddleware);

router.post('/email/change',   validateBody(changeEmailSchema),   changeEmail);
router.post('/email/verify',   validateBody(verifyEmailSchema),   verifyNewEmail);
router.patch('/phone',         validateBody(changePhoneSchema),   changePhone);

// Открытые роуты
router.post('/forgot-password', validateBody(forgotPasswordSchema), forgotPassword);
router.post('/reset-password',  validateBody(resetPasswordSchema),  resetPassword);

module.exports = router;