const express = require('express');
const {
  createRequest,
  getMyRequests,
  getAllRequests,
  updateRequestStatus,
} = require('../controllers/request.controller');

const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');
const {
  validateCreate,
  validateStatus,
  validateIdParam,
  requestQuerySchema,
  validateQuery
} = require('../validations/request.validation');

const router = express.Router();

router.use(authMiddleware); // все требуют авторизации

router.post('/', validateCreate, createRequest);
router.get('/my', validateQuery(requestQuerySchema), getMyRequests);
router.get('/', adminMiddleware, validateQuery(requestQuerySchema), getAllRequests);
router.patch('/:id/status', adminMiddleware, validateIdParam, validateStatus, updateRequestStatus);

module.exports = router;