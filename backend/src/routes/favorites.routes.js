const express = require('express');
const {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  checkIsFavorite,
} = require('../controllers/favorite.controller');

const { authMiddleware } = require('../middleware/auth.middleware');
const { validateFavoriteParams } = require('../validations/favorite.validation');

const router = express.Router();

router.use(authMiddleware); // все роуты требуют авторизации

router.post('/:propertyId', validateFavoriteParams, addToFavorites);
router.delete('/:propertyId', validateFavoriteParams, removeFromFavorites);
router.get('/', getFavorites);
router.get('/check/:propertyId', validateFavoriteParams, checkIsFavorite);

module.exports = router;