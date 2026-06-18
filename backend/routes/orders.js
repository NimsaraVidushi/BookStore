const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/orders');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all order routes
router.use(authMiddleware);

// Order routes
router.post('/', ordersController.placeOrder);
router.get('/my', ordersController.getMyOrders);
router.get('/:id', ordersController.getOrderById);
router.put('/:id/cancel', ordersController.cancelOrder);

module.exports = router;
