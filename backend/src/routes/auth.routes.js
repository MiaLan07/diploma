const express = require('express');
const { register, login, getMe } = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { validate, registerSchema, loginSchema } = require('../validations/auth.validation');

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login',    validate(loginSchema),    login);
router.get('/me',        authMiddleware,           getMe);

module.exports = router;