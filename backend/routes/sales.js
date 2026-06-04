const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// User routes
router.post('/', auth, saleController.createSale);
router.get('/my-history', auth, saleController.getUserSaleHistory);
router.get('/:id', auth, saleController.getSaleById);

// Admin routes
router.get('/', adminAuth, saleController.getSaleHistory);
router.get('/report/generate', adminAuth, saleController.getSalesReport);
router.put('/:id/status', adminAuth, saleController.updateSaleStatus);

module.exports = router;
