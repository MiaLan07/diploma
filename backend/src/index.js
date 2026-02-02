const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const { PORT } = require('./config');
const errorHandler = require('./middleware/error.middleware');

// Импортируем роуты (пока только заглушки — добавим позже)
const authRoutes = require('./routes/auth.routes');
const propertyRoutes = require('./routes/properties.routes');
const favoritesRoutes = require('./routes/favorites.routes');
// ...

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Статические файлы (фото недвижимости)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
// ...

// Тестовый маршрут
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API работает' });
});

// Обработчик 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Маршрут не найден' });
});

// Глобальный обработчик ошибок (должен быть последним!)
app.use(errorHandler);

// Запуск
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
  console.log(`Swagger UI → http://localhost:${PORT}/api-docs`);
});