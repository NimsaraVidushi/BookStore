const express = require('express');
const router = express.Router();

const booksController = require('../controllers/books');
const ordersController = require('../controllers/orders');
const usersController = require('../controllers/users');
const categoriesController = require('../controllers/categories');

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Guard all admin routes with auth and admin role verification
router.use(authMiddleware);
router.use(adminMiddleware);

// Admin Books management
router.get('/books', booksController.adminGetAllBooks);
router.post('/books', booksController.createBook);
router.put('/books/:id', booksController.updateBook);
router.delete('/books/:id', booksController.deleteBook);

// Admin Orders management
router.get('/orders', ordersController.adminGetAllOrders);
router.put('/orders/:id', ordersController.adminUpdateOrder);

// Admin Users management
router.get('/users', usersController.adminGetAllUsers);
router.put('/users/:id', usersController.adminUpdateUser);
router.delete('/users/:id', usersController.adminDeleteUser);

// Admin Categories management
router.get('/categories', categoriesController.adminGetAllCategories);
router.post('/categories', categoriesController.createCategory);
router.put('/categories/:id', categoriesController.updateCategory);
router.delete('/categories/:id', categoriesController.deleteCategory);

module.exports = router;
