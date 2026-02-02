const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // npm install uuid

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/properties/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Разрешены только изображения: jpeg, jpg, png, webp'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB на файл
});

module.exports = {
  uploadMultiple: upload.array('images', 10), // максимум 10 фото за раз
  uploadSingle: upload.single('image'),       // если понадобится для аватарки и т.д.
};