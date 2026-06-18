import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/api';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { token } = useContext(AuthContext);

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchBookDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await API.get(`/books/${id}`);
        setBook(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load book details');
      } finally {
        setLoading(false);
      }
    };
    fetchBookDetails();
  }, [id]);

  const handleQtyChange = (e) => {
    const val = parseInt(e.target.value);
    if (isNaN(val) || val < 1) {
      setQuantity(1);
    } else if (val > book.stock) {
      setQuantity(book.stock);
    } else {
      setQuantity(val);
    }
  };

  const handleAddToCart = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    setAdding(true);
    setSuccessMsg('');
    const result = await addToCart(book._id, quantity);
    setAdding(false);

    if (result.success) {
      setSuccessMsg(`Successfully added ${quantity} item(s) to cart!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      setError(result.message || 'Failed to add item to cart');
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="detail-loading-state">
        <div className="loading-spinner"></div>
        <p>Retrieving book details...</p>
      </div>
    );
  }

  if (error && !book) {
    return (
      <div className="detail-error-state">
        <div className="alert-message alert-error">{error}</div>
        <Link to="/" className="btn-back-home">↩ Back to Catalog</Link>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="detail-empty-state">
        <h3>Book not found</h3>
        <Link to="/" className="btn-back-home">↩ Back to Catalog</Link>
      </div>
    );
  }

  const isOutOfStock = book.stock <= 0;

  return (
    <div className="detail-page-container">
      <Link to="/" className="btn-back-link">← Back to Catalog</Link>

      <div className="detail-grid-layout">
        {/* Left Side Cover */}
        <div className="detail-cover-container">
          {book.coverImage ? (
            <img src={book.coverImage} alt={book.title} className="detail-cover-image" />
          ) : (
            <div className="detail-cover-placeholder">
              <span className="placeholder-emoji">📖</span>
              <p>{book.title}</p>
            </div>
          )}
        </div>

        {/* Right Side Info */}
        <div className="detail-info-container">
          <span className="detail-category-label">{book.category?.name}</span>
          <h1 className="detail-title-heading">{book.title}</h1>
          <p className="detail-author-subheading">by <span className="author-highlight">{book.author}</span></p>
          
          <div className="detail-divider"></div>
          
          <p className="detail-price-text">Rs. {book.price.toFixed(2)}</p>
          
          {/* Stock status badge */}
          <div className="detail-stock-row">
            <span className={`detail-stock-badge ${isOutOfStock ? 'badge-out' : book.stock < 5 ? 'badge-low' : 'badge-in'}`}>
              {isOutOfStock ? '🔴 Out of Stock' : book.stock < 5 ? `🟡 Low Stock (Only ${book.stock} left)` : `🟢 In Stock (${book.stock} units)`}
            </span>
          </div>

          <div className="detail-divider"></div>

          {/* Description */}
          <div className="detail-description-section">
            <h3>Description</h3>
            <p className="description-text-content">
              {book.description || 'No description available for this book. Please contact support or administration for content inquiries.'}
            </p>
          </div>

          {/* Book Metadata table */}
          <table className="detail-metadata-table">
            <tbody>
              <tr>
                <td><strong>ISBN-13</strong></td>
                <td>{book.isbn}</td>
              </tr>
              <tr>
                <td><strong>Category</strong></td>
                <td>{book.category?.name || 'General'}</td>
              </tr>
              <tr>
                <td><strong>Status</strong></td>
                <td>{isOutOfStock ? 'Discontinued' : 'Active'}</td>
              </tr>
            </tbody>
          </table>

          <div className="detail-divider"></div>

          {/* Cart Interaction */}
          {!isOutOfStock ? (
            <div className="detail-cart-action-panel">
              <div className="detail-qty-picker">
                <label htmlFor="detail-qty-input">Qty:</label>
                <input
                  type="number"
                  id="detail-qty-input"
                  min="1"
                  max={book.stock}
                  value={quantity}
                  onChange={handleQtyChange}
                  className="detail-qty-num-field"
                />
              </div>

              <button
                onClick={handleAddToCart}
                disabled={adding}
                className={`detail-btn-cart ${adding ? 'btn-adding' : ''}`}
              >
                {adding ? 'Adding...' : 'Add to Cart 🛒'}
              </button>
            </div>
          ) : (
            <div className="detail-cart-action-panel">
              <button disabled className="detail-btn-cart btn-disabled">
                Out of Stock 🚫
              </button>
            </div>
          )}

          {successMsg && <div className="alert-message alert-success" style={{ marginTop: '20px' }}>{successMsg}</div>}
          {error && <div className="alert-message alert-error" style={{ marginTop: '20px' }}>{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
