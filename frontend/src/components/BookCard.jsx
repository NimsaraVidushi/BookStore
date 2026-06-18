import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const BookCard = ({ book }) => {
  const { addToCart } = useContext(CartContext);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState('');

  const handleAddToCart = async (e) => {
    e.preventDefault(); // Prevent linking to details page on button click
    if (!token) {
      navigate('/login');
      return;
    }

    setAdding(true);
    setMessage('');
    const result = await addToCart(book._id, 1);
    setAdding(false);
    
    if (result.success) {
      setMessage('Added!');
      setTimeout(() => setMessage(''), 2000);
    } else {
      setMessage('Error');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  const isOutOfStock = book.stock <= 0;

  return (
    <div className={`book-grid-card ${book.isFeatured ? 'featured-card' : ''}`}>
      {book.isFeatured && <span className="featured-badge-tag">⭐ Featured</span>}
      
      {/* Cover Image */}
      <div className="card-cover-container">
        {book.coverImage ? (
          <img src={book.coverImage} alt={book.title} className="card-cover-image" />
        ) : (
          <div className="card-cover-placeholder">
            <span className="placeholder-book-icon">📖</span>
            <span className="placeholder-title-text">{book.title}</span>
          </div>
        )}
      </div>

      {/* Book Details */}
      <div className="card-details-container">
        <span className="card-category-tag">{book.category?.name || 'Book'}</span>
        <h3 className="card-title-text" title={book.title}>{book.title}</h3>
        <p className="card-author-text">by {book.author}</p>
        
        <div className="card-price-stock-row">
          <span className="card-price-value">Rs. {book.price.toFixed(2)}</span>
          <span className={`card-stock-badge ${isOutOfStock ? 'stock-out' : book.stock < 5 ? 'stock-low' : 'stock-in'}`}>
            {isOutOfStock ? 'Out of Stock' : book.stock < 5 ? `Only ${book.stock} left` : 'In Stock'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="card-actions-row">
          <Link to={`/books/${book._id}`} className="card-btn-details">
            Details
          </Link>
          <button 
            onClick={handleAddToCart} 
            disabled={isOutOfStock || adding}
            className={`card-btn-add-to-cart ${isOutOfStock ? 'btn-disabled' : adding ? 'btn-adding' : ''}`}
          >
            {adding ? 'Adding...' : message ? message : 'Add 🛒'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
