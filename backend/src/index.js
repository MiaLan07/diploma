const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const { PORT } = require('./config');
const errorHandler = require('./middleware/error.middleware');

const authRoutes = require('./routes/auth.routes');
const propertyRoutes = require('./routes/properties.routes');
const favoritesRoutes = require('./routes/favorites.routes');
const requestsRoutes = require('./routes/requests.routes');
// ...

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Security headers
app.use(helmet());

// Rate limiting (особенно важно для auth-роутов)
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,     // 10 минут
  max: 20,                      // 20 попыток (достаточно для тестов и реального использования)
  message: { success: false, message: 'Слишком много попыток. Попробуйте снова через 10 минут.' },
  standardHeaders: true,
  legacyHeaders: false,
  // Важно для разработки — пропускаем лимит при запуске локально с флагом
  skip: (req) => process.env.NODE_ENV === 'development' && req.ip === '::1',
});
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 час
  max: 8,
  message: { success: false, message: 'Слишком много регистраций. Попробуйте позже.' },
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,                 // более мягкий лимит для остальных роутов
});

// Применяем
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', registerLimiter);      // отдельный, более строгий лимит
app.use('/api/auth/forgot-password', authLimiter);
app.use(generalLimiter); // глобально, но слабее

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Статические файлы (фото недвижимости)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/images', express.static(path.join(__dirname, '../images')));

// Swagger
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger/swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Real Estate API',
}));

// Роуты
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/user', require('./routes/users.routes'));
app.use('/api/references', require('./routes/references.routes'));
// ...

// Тестовый маршрут
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API работает' });
});

// Обработчик 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Маршрут не найден' });
});

// Глобальный обработчик ошибок
app.use(errorHandler);

// Запуск
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
  console.log(`Swagger UI - http://localhost:${PORT}/api-docs`);
});