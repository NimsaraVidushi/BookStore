import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import CartItem from '../components/CartItem';

const Cart = () => {
  const { cart, loading, error, subtotal, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const handleCheckoutRedirect = () => {
    navigate('/checkout');
  };

  const hasItems = cart && cart.items && cart.items.length > 0;

  if (loading && !cart) {
    return (
      <div className="cart-loading-state">
        <div className="loading-spinner"></div>
        <p>Loading your shopping cart...</p>
      </div>
    );
  }

  return (
    <div className="cart-page-container">
      <div className="cart-header-title">
        <h1>🛒 Shopping Cart</h1>
        <Link to="/" className="btn-continue-shopping">← Continue Shopping</Link>
      </div>

      {error && <div className="alert-message alert-error">{error}</div>}

      {!hasItems ? (
        <div className="cart-empty-state-view">
          <span className="cart-empty-icon">🛍️</span>
          <h3>Your cart is empty</h3>
          <p>You haven't added any books to your cart yet. Explore our extensive catalog of literature and find your next read!</p>
          <Link to="/" className="btn-browse-catalog">Browse Catalog</Link>
        </div>
      ) : (
        <div className="cart-layout-split">
          {/* Cart Items List */}
          <div className="cart-items-column">
            <div className="cart-items-header">
              <span>Book Description</span>
              <span>Quantity</span>
              <span>Subtotal</span>
              <span>Action</span>
            </div>
            <div className="cart-items-list-wrapper">
              {cart.items.map((item) => (
                <CartItem key={item._id} item={item} />
              ))}
            </div>
            
            <div className="cart-actions-footer">
              <button onClick={clearCart} className="btn-clear-cart-items">
                🗑️ Clear Entire Cart
              </button>
            </div>
          </div>

          {/* Cart Summary Card */}
          <div className="cart-summary-column">
            <div className="cart-summary-card">
              <h3>Order Summary</h3>
              <div className="summary-divider"></div>
              
              <div className="summary-price-row">
                <span>Subtotal</span>
                <span>Rs. {subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-price-row">
                <span>Shipping</span>
                <span className="free-shipping-label">FREE</span>
              </div>
              
              <div className="summary-divider"></div>
              
              <div className="summary-price-row summary-total-row">
                <span>Estimated Total</span>
                <span>Rs. {subtotal.toFixed(2)}</span>
              </div>

              <button 
                onClick={handleCheckoutRedirect} 
                className="btn-proceed-to-checkout"
              >
                Proceed to Checkout 💳
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
