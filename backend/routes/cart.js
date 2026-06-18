const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all cart routes
router.use(authMiddleware);

// Cart routes
router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.put('/:itemId', cartController.updateCartItem);
router.delete('/:itemId', cartController.removeCartItem);
router.delete('/', cartController.clearCart);

module.exports = router;
