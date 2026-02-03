const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(`${err.name}: ${err.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    user: req.user ? req.user.id : 'anonymous'
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Внутренняя ошибка сервера';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;