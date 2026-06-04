const Book = require('../models/Book');
const Review = require('../models/Review');

exports.getAllBooks = async (req, res) => {
  try {
    const { search, category } = req.query;
    let filter = {};

    if (search) {
      filter = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { author: { $regex: search, $options: 'i' } }
        ]
      };
    }

    if (category) {
      filter.category = category;
    }

    const books = await Book.find(filter);
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createBook = async (req, res) => {
  try {
    const { title, author, isbn, description, category, price, quantity, publisher, publicationDate, language, pages, coverImage } = req.body;

    const book = new Book({
      title,
      author,
      isbn,
      description,
      category,
      price,
      quantity,
      publisher,
      publicationDate,
      language,
      pages,
      coverImage
    });

    await book.save();

    res.status(201).json({
      message: 'Book created successfully',
      book
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { title, author, isbn, description, category, price, quantity, publisher, publicationDate, language, pages, coverImage } = req.body;

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { title, author, isbn, description, category, price, quantity, publisher, publicationDate, language, pages, coverImage, updatedAt: Date.now() },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.status(200).json({
      message: 'Book updated successfully',
      book
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Delete all reviews associated with the book
    await Review.deleteMany({ bookId: req.params.id });

    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
