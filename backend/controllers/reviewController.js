const Review = require('../models/Review');
const Book = require('../models/Book');

const updateBookRating = async (bookId) => {
  const reviews = await Review.find({ bookId });
  if (reviews.length === 0) {
    await Book.findByIdAndUpdate(bookId, { averageRating: 0, totalReviews: 0 });
    return;
  }

  const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  await Book.findByIdAndUpdate(bookId, {
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews: reviews.length
  });
};

exports.createReview = async (req, res) => {
  try {
    const { bookId, rating, title, reviewText } = req.body;

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if user already reviewed this book
    let review = await Review.findOne({ bookId, userId: req.user.id });
    if (review) {
      return res.status(400).json({ message: 'You have already reviewed this book' });
    }

    review = new Review({
      bookId,
      userId: req.user.id,
      rating,
      title,
      reviewText
    });

    await review.save();
    await updateBookRating(bookId);

    res.status(201).json({
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReviewsByBook = async (req, res) => {
  try {
    const reviews = await Review.find({ bookId: req.params.bookId })
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReviewsByUser = async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user.id })
      .populate('bookId', 'title author')
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('userId', 'username email')
      .populate('bookId', 'title author');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { rating, title, reviewText } = req.body;

    let review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    review = await Review.findByIdAndUpdate(
      req.params.id,
      { rating, title, reviewText, updatedAt: Date.now() },
      { new: true }
    );

    await updateBookRating(review.bookId);

    res.status(200).json({
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId.toString() !== req.user.id && req.user.userType !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    const bookId = review.bookId;
    await Review.findByIdAndDelete(req.params.id);
    await updateBookRating(bookId);

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
