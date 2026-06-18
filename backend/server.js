require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const connectDB = require('./config/db');
const User = require('./models/User');
const Category = require('./models/Category');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploads folder statically for local upload fallback
app.use('/uploads', express.static(uploadsDir));

// Cloudinary Configuration
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('✓ Cloudinary configured successfully');
} else {
  console.log('! Cloudinary credentials missing in .env - falling back to local storage uploads');
}

// Multer Local Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Database Connection & Data Seeding
const seedData = async () => {
  try {
    // 1. Seed Categories if empty
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      const defaultCategories = [
        { name: 'Fiction', description: 'Literature in the form of prose, especially novels, that describes imaginary events and people.' },
        { name: 'Non-Fiction', description: 'Prose writing that is informative or factual rather than fictional.' },
        { name: 'Science Fiction', description: 'Fiction based on imagined future scientific or technological advances.' },
        { name: 'Biography', description: 'An account of someone\'s life written by someone else.' },
        { name: 'Children', description: 'Books written for children, including picture books, storybooks, and early readers.' }
      ];
      await Category.insertMany(defaultCategories);
      console.log('✓ Default categories seeded successfully');
    }

    // 2. Seed Default Admin if empty
    const adminExists = await User.findOne({ email: 'admin@bookstore.com' });
    if (!adminExists) {
      const admin = new User({
        name: 'Admin User',
        email: 'admin@bookstore.com',
        password: 'Admin@123', // Will be hashed by pre-save hook
        role: 'admin',
        address: {
          street: '123 Admin St',
          city: 'Colombo',
          postalCode: '00100'
        }
      });
      await admin.save();
      console.log('✓ Default admin user seeded successfully (admin@bookstore.com / Admin@123)');
    }
  } catch (error) {
    console.error('Seeding error:', error.message);
  }
};

connectDB().then(() => {
  seedData();
});

// File Upload Route (Protected, Admin only)
const authMiddleware = require('./middleware/authMiddleware');
const adminMiddleware = require('./middleware/adminMiddleware');

app.post('/api/admin/upload', authMiddleware, adminMiddleware, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded', data: null });
    }

    // If Cloudinary is configured, upload to Cloudinary and delete local temp file
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'bookstore_covers'
        });
        
        // Delete local temp file
        fs.unlinkSync(req.file.path);
        
        return res.status(200).json({
          success: true,
          message: 'Image uploaded to Cloudinary successfully',
          data: { url: result.secure_url }
        });
      } catch (cloudinaryError) {
        console.error('Cloudinary upload error, falling back to local path:', cloudinaryError.message);
        // Fallback to local upload path if Cloudinary fail
      }
    }

    // Local Storage upload response (fallback)
    const localUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.status(200).json({
      success: true,
      message: 'Image uploaded locally successfully',
      data: { url: localUrl }
    });
  } catch (error) {
    next(error);
  }
});

// Public Categories route
const categoriesController = require('./controllers/categories');
app.get('/api/categories', categoriesController.getAllCategories);

// Routes Registration
app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));

// Root & Health check endpoints
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'Bookstore Management System API is running', data: null });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
