import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useContext(CartContext);
  const book = item.book;

  if (!book) return null;

  const handleQtyDecrease = () => {
    if (item.quantity > 1) {
      updateQuantity(item._id, item.quantity - 1);
    }
  };

  const handleQtyIncrease = () => {
    if (item.quantity < book.stock) {
      updateQuantity(item._id, item.quantity + 1);
    }
  };

  const itemSubtotal = item.price * item.quantity;
  const isMaxStockReached = item.quantity >= book.stock;

  return (
    <div className="cart-line-item">
      {/* Cover */}
      <div className="cart-item-image-container">
        {book.coverImage ? (
          <img src={book.coverImage} alt={book.title} className="cart-item-image" />
        ) : (
          <div className="cart-item-placeholder-image">📖</div>
        )}
      </div>

      {/* Info */}
      <div className="cart-item-info">
        <Link to={`/books/${book._id}`} className="cart-item-title-link">
          <h4>{book.title}</h4>
        </Link>
        <p className="cart-item-author">by {book.author}</p>
        <p className="cart-item-unit-price">Price: Rs. {item.price.toFixed(2)}</p>
      </div>

      {/* Quantity Controls */}
      <div className="cart-item-quantity-section">
        <div className="quantity-counter-controls">
          <button 
            onClick={handleQtyDecrease} 
            disabled={item.quantity <= 1}
            className="btn-quantity-decrement"
          >
            -
          </button>
          <span className="quantity-count-display">{item.quantity}</span>
          <button 
            onClick={handleQtyIncrease} 
            disabled={isMaxStockReached}
            className="btn-quantity-increment"
          >
            +
          </button>
        </div>
        {isMaxStockReached && (
          <span className="stock-limit-warning">Stock limit reached ({book.stock})</span>
        )}
      </div>

      {/* Subtotal */}
      <div className="cart-item-subtotal-section">
        <span className="subtotal-label">Subtotal</span>
        <span className="subtotal-amount">Rs. {itemSubtotal.toFixed(2)}</span>
      </div>

      {/* Remove Button */}
      <div className="cart-item-remove-section">
        <button 
          onClick={() => removeFromCart(item._id)} 
          className="btn-remove-cart-item"
          title="Remove item"
        >
          ❌ Remove
        </button>
      </div>
    </div>
  );
};

export default CartItem;
