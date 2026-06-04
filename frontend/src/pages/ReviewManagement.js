import React, { useState, useEffect } from 'react';
import { bookAPI, reviewAPI } from '../services/api';
import './ReviewManagement.css';

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
    fetchReviews();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await bookAPI.getAllBooks();
      setBooks(response.data);
    } catch (err) {
      console.log('Failed to load books');
    }
  };

  const fetchReviews = async (bookId = '') => {
    try {
      let data = [];
      if (bookId) {
        const response = await reviewAPI.getReviewsByBook(bookId);
        data = response.data;
      } else {
        const booksRes = await bookAPI.getAllBooks();
        for (let book of booksRes.data) {
          const reviewsRes = await reviewAPI.getReviewsByBook(book._id);
          data = [...data, ...reviewsRes.data];
        }
      }
      setReviews(data);
    } catch (err) {
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSelect = (e) => {
    const bookId = e.target.value;
    setSelectedBook(bookId);
    if (bookId) {
      fetchReviews(bookId);
    } else {
      fetchReviews();
    }
  };

  const handleDelete = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await reviewAPI.deleteReview(reviewId);
        setSuccess('Review deleted successfully');
        fetchReviews(selectedBook);
      } catch (err) {
        setError('Failed to delete review');
      }
    }
  };

  return (
    <div className="review-management">
      <h1>Review Management</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="filter-section">
        <label>Filter by Book:</label>
        <select value={selectedBook} onChange={handleBookSelect}>
          <option value="">All Books</option>
          {books.map(book => (
            <option key={book._id} value={book._id}>
              {book.title}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div>Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div>No reviews found</div>
      ) : (
        <div className="reviews-list">
          {reviews.map(review => (
            <div key={review._id} className="review-card">
              <div className="review-header">
                <div>
                  <h3>{review.title}</h3>
                  <p className="reviewer">{review.userId.username} ({review.userId.email})</p>
                </div>
                <div className="rating">{'⭐'.repeat(review.rating)}</div>
              </div>
              <p className="review-text">{review.reviewText}</p>
              <div className="review-footer">
                <span className="date">{new Date(review.createdAt).toLocaleDateString()}</span>
                <button
                  onClick={() => handleDelete(review._id)}
                  className="btn btn-sm btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewManagement;
