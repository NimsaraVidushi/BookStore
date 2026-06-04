import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookAPI, reviewAPI, saleAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './BookDetails.css';

const BookDetails = () => {
  const { id } = useParams();
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    title: '',
    reviewText: ''
  });

  useEffect(() => {
    fetchBook();
    fetchReviews();
  }, [id]);

  const fetchBook = async () => {
    try {
      const response = await bookAPI.getBookById(id);
      setBook(response.data);
    } catch (err) {
      setError('Failed to load book');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await reviewAPI.getReviewsByBook(id);
      setReviews(response.data);
    } catch (err) {
      console.log('Failed to load reviews');
    }
  };

  const handleBuyNow = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await saleAPI.createSale({
        bookId: id,
        quantity: parseInt(quantity),
        paymentMethod: 'Online'
      });
      setSuccess('Book purchased successfully!');
      setQuantity(1);
      fetchBook();
    } catch (err) {
      setError(err.response?.data?.message || 'Purchase failed');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await reviewAPI.createReview({
        bookId: id,
        ...reviewData
      });
      setSuccess('Review added successfully!');
      setReviewData({ rating: 5, title: '', reviewText: '' });
      setShowReviewForm(false);
      fetchReviews();
      fetchBook();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add review');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!book) return <div>Book not found</div>;

  return (
    <div className="book-details">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="book-header">
        <div className="book-cover">
          {book.coverImage ? (
            <img src={book.coverImage} alt={book.title} />
          ) : (
            <div className="no-image">No Image</div>
          )}
        </div>

        <div className="book-info">
          <h1>{book.title}</h1>
          <p className="author">by {book.author}</p>
          
          <div className="book-meta">
            <p><strong>Category:</strong> {book.category}</p>
            <p><strong>Publisher:</strong> {book.publisher || 'N/A'}</p>
            <p><strong>Language:</strong> {book.language}</p>
            <p><strong>Pages:</strong> {book.pages || 'N/A'}</p>
            {book.isbn && <p><strong>ISBN:</strong> {book.isbn}</p>}
          </div>

          <div className="book-rating">
            <span className="rating-stars">⭐ {book.averageRating.toFixed(1)}</span>
            <span className="review-count">({book.totalReviews} reviews)</span>
          </div>

          <p className="book-price">Rs. {book.price.toFixed(2)}</p>

          {book.quantity > 0 ? (
            <div className="purchase-section">
              <div className="quantity-selector">
                <label>Quantity:</label>
                <input
                  type="number"
                  min="1"
                  max={book.quantity}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <button onClick={handleBuyNow} className="btn btn-success">
                Buy Now
              </button>
            </div>
          ) : (
            <p className="out-of-stock">Out of Stock</p>
          )}
        </div>
      </div>

      <div className="description-section">
        <h2>Description</h2>
        <p>{book.description || 'No description available'}</p>
      </div>

      <div className="reviews-section">
        <h2>Customer Reviews ({book.totalReviews})</h2>

        {user && token && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="btn btn-primary"
          >
            {showReviewForm ? 'Cancel' : 'Write a Review'}
          </button>
        )}

        {showReviewForm && (
          <form onSubmit={handleSubmitReview} className="review-form">
            <div className="form-group">
              <label>Rating</label>
              <select
                value={reviewData.rating}
                onChange={(e) => setReviewData({ ...reviewData, rating: parseInt(e.target.value) })}
              >
                <option value="5">5 Stars ⭐⭐⭐⭐⭐</option>
                <option value="4">4 Stars ⭐⭐⭐⭐</option>
                <option value="3">3 Stars ⭐⭐⭐</option>
                <option value="2">2 Stars ⭐⭐</option>
                <option value="1">1 Star ⭐</option>
              </select>
            </div>

            <div className="form-group">
              <label>Review Title</label>
              <input
                type="text"
                value={reviewData.title}
                onChange={(e) => setReviewData({ ...reviewData, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Review</label>
              <textarea
                value={reviewData.reviewText}
                onChange={(e) => setReviewData({ ...reviewData, reviewText: e.target.value })}
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-success">Submit Review</button>
          </form>
        )}

        <div className="reviews-list">
          {reviews.length === 0 ? (
            <p>No reviews yet</p>
          ) : (
            reviews.map(review => (
              <div key={review._id} className="review-item">
                <div className="review-header">
                  <strong>{review.title}</strong>
                  <span className="rating">{'⭐'.repeat(review.rating)}</span>
                </div>
                <p className="reviewer">by {review.userId.username}</p>
                <p className="review-text">{review.reviewText}</p>
                <p className="review-date">{new Date(review.createdAt).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
