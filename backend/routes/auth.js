const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

// Auth endpoints
router.post('/register', authController.register);
router.post('/login', authController.login);

// Simple logout endpoint to confirm action, token is discarded client-side
router.post('/logout', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User logged out successfully',
    data: null
  });
});

module.exports = router;
