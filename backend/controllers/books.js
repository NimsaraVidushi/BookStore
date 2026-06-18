const Book = require('../models/Book');
const Category = require('../models/Category');

// GET /api/books (Public)
// Query params: category (ID or name), search (title/author), sort (priceAsc, priceDesc, titleAsc, titleDesc, newest)
exports.getAllBooks = async (req, res, next) => {
  try {
    const { category, search, sort } = req.query;
    let filter = { isDeleted: false };

    // Filter by Category
    if (category) {
      // Check if category is a valid ObjectId
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(category);
      if (isValidObjectId) {
        filter.category = category;
      } else {
        // Find category by name case-insensitive
        const categoryDoc = await Category.findOne({ name: { $regex: new RegExp(`^${category}$`, 'i') } });
        if (categoryDoc) {
          filter.category = categoryDoc._id;
        } else {
          // If category not found, return empty array
          return res.status(200).json({
            success: true,
            message: 'No books found for this category',
            data: []
          });
        }
      }
    }

    // Search by title or author
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } }
      ];
    }

    // Query DB
    let query = Book.find(filter).populate('category', 'name');

    // Sorting
    if (sort) {
      if (sort === 'priceAsc') {
        query = query.sort({ price: 1 });
      } else if (sort === 'priceDesc') {
        query = query.sort({ price: -1 });
      } else if (sort === 'titleAsc') {
        query = query.sort({ title: 1 });
      } else if (sort === 'titleDesc') {
        query = query.sort({ title: -1 });
      } else if (sort === 'newest') {
        query = query.sort({ createdAt: -1 });
      }
    } else {
      // Default sort is newest
      query = query.sort({ createdAt: -1 });
    }

    const books = await query;
    res.status(200).json({
      success: true,
      message: 'Books fetched successfully',
      data: books
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/books/:id (Public)
exports.getBookById = async (req, res, next) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, isDeleted: false }).populate('category', 'name');
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
        data: null
      });
    }
    res.status(200).json({
      success: true,
      message: 'Book details fetched successfully',
      data: book
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/books (Admin)
// Lists all books, including soft deleted ones or status for dashboard
exports.adminGetAllBooks = async (req, res, next) => {
  try {
    const books = await Book.find().populate('category', 'name').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: 'All books fetched for admin',
      data: books
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/books (Admin)
exports.createBook = async (req, res, next) => {
  try {
    const { title, author, isbn, price, stock, category, coverImage, description, isFeatured } = req.body;

    // Verify isbn uniqueness
    const isbnExists = await Book.findOne({ isbn });
    if (isbnExists) {
      return res.status(400).json({
        success: false,
        message: 'A book with this ISBN already exists',
        data: null
      });
    }

    // Verify category exists
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category selection',
        data: null
      });
    }

    const book = new Book({
      title,
      author,
      isbn,
      price,
      stock,
      category,
      coverImage: coverImage || '',
      description: description || '',
      isFeatured: isFeatured || false
    });

    await book.save();
    
    // Populate category before sending response
    await book.populate('category', 'name');

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: book
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/books/:id (Admin)
exports.updateBook = async (req, res, next) => {
  try {
    const { title, author, isbn, price, stock, category, coverImage, description, isFeatured, isDeleted } = req.body;

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
        data: null
      });
    }

    // Verify isbn uniqueness if changed
    if (isbn && isbn !== book.isbn) {
      const isbnExists = await Book.findOne({ isbn });
      if (isbnExists) {
        return res.status(400).json({
          success: false,
          message: 'A book with this ISBN already exists',
          data: null
        });
      }
      book.isbn = isbn;
    }

    // Verify category if changed
    if (category) {
      const categoryDoc = await Category.findById(category);
      if (!categoryDoc) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category selection',
          data: null
        });
      }
      book.category = category;
    }

    if (title !== undefined) book.title = title;
    if (author !== undefined) book.author = author;
    if (price !== undefined) book.price = price;
    if (stock !== undefined) book.stock = stock;
    if (coverImage !== undefined) book.coverImage = coverImage;
    if (description !== undefined) book.description = description;
    if (isFeatured !== undefined) book.isFeatured = isFeatured;
    if (isDeleted !== undefined) book.isDeleted = isDeleted;

    await book.save();
    await book.populate('category', 'name');

    res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      data: book
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/books/:id (Admin - Soft Delete)
exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
        data: null
      });
    }

    book.isDeleted = true;
    await book.save();

    res.status(200).json({
      success: true,
      message: 'Book soft deleted successfully',
      data: book
    });
  } catch (error) {
    next(error);
  }
};
