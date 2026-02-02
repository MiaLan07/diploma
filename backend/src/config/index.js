require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  DATABASE_URL: process.env.DATABASE_URL || 'file:./datebase.db',
  
  // для multer (пути хранения файлов)
  UPLOADS_DIR: 'uploads/properties',
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB
};