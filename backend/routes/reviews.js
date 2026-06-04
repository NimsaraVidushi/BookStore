const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Public routes
router.get('/book/:bookId', reviewController.getReviewsByBook);

// User routes
router.post('/', auth, reviewController.createReview);
router.get('/user/history', auth, reviewController.getReviewsByUser);
router.get('/:id', reviewController.getReviewById);
router.put('/:id', auth, reviewController.updateReview);
router.delete('/:id', auth, reviewController.deleteReview);

module.exports = router;
