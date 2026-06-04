const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Public routes
router.get('/', bookController.getAllBooks);
router.get('/:id', bookController.getBookById);

// Admin routes
router.post('/', adminAuth, bookController.createBook);
router.put('/:id', adminAuth, bookController.updateBook);
router.delete('/:id', adminAuth, bookController.deleteBook);

module.exports = router;
