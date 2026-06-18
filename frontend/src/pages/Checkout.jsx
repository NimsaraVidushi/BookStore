import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/api';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, subtotal, fetchCart } = useContext(CartContext);
  const { user, updateLocalUser } = useContext(AuthContext);

  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    postalCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  // Pre-populate shipping address from user context if available
  useEffect(() => {
    if (user && user.address) {
      setShippingAddress({
        street: user.address.street || '',
        city: user.address.city || '',
        postalCode: user.address.postalCode || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePlaceOrderSubmit = async (e) => {
    e.preventDefault();
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.postalCode) {
      setError('Please fill out all address fields');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await API.post('/orders', { shippingAddress });
      setPlacedOrder(response.data.data);
      
      // Update local user's address if it was empty, to save it for next time
      if (user && (!user.address.street || !user.address.city || !user.address.postalCode)) {
        const updatedUser = {
          ...user,
          address: shippingAddress
        };
        updateLocalUser(updatedUser);
      }

      setOrderSuccess(true);
      // Sync local cart
      fetchCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please check stock levels.');
    } finally {
      setLoading(false);
    }
  };

  const hasItems = cart && cart.items && cart.items.length > 0;

  if (orderSuccess && placedOrder) {
    return (
      <div className="checkout-success-view">
        <span className="success-emoji">🎉</span>
        <h2>Thank you for your order!</h2>
        <p className="success-tagline">Your payment has been simulated and processed successfully.</p>
        
        <div className="success-order-details-card">
          <p><strong>Order ID:</strong> {placedOrder._id}</p>
          <p><strong>Total Amount:</strong> Rs. {placedOrder.totalAmount.toFixed(2)}</p>
          <p><strong>Payment Status:</strong> <span className="status-paid">{placedOrder.paymentStatus}</span></p>
          <p><strong>Delivery Status:</strong> <span className="status-pending">{placedOrder.status}</span></p>
          <p><strong>Shipping Address:</strong> {placedOrder.shippingAddress.street}, {placedOrder.shippingAddress.city}, {placedOrder.shippingAddress.postalCode}</p>
        </div>

        <div className="success-actions-row">
          <Link to="/orders" className="btn-success-view-orders">View Order History</Link>
          <Link to="/" className="btn-success-home">Back to Homepage</Link>
        </div>
      </div>
    );
  }

  if (!hasItems && !orderSuccess) {
    return (
      <div className="checkout-empty-state">
        <h3>No items to checkout</h3>
        <p>Your cart is empty. Please add books before trying to checkout.</p>
        <Link to="/" className="btn-empty-checkout-home">Go to Catalog</Link>
      </div>
    );
  }

  return (
    <div className="checkout-page-container">
      <h1>💳 Checkout</h1>

      {error && <div className="alert-message alert-error">{error}</div>}

      <div className="checkout-layout-split">
        
        {/* Shipping Form Panel */}
        <form onSubmit={handlePlaceOrderSubmit} className="checkout-form-column">
          <div className="checkout-form-section">
            <h3>Shipping Address</h3>
            
            <div className="form-group-item">
              <label htmlFor="street">Street Address</label>
              <input
                type="text"
                id="street"
                name="street"
                value={shippingAddress.street}
                onChange={handleInputChange}
                required
                placeholder="e.g. 123 Main Street"
                className="checkout-form-input"
              />
            </div>

            <div className="form-group-row">
              <div className="form-group-item">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Colombo"
                  className="checkout-form-input"
                />
              </div>

              <div className="form-group-item">
                <label htmlFor="postalCode">Postal Code</label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={shippingAddress.postalCode}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. 00100"
                  className="checkout-form-input"
                />
              </div>
            </div>
          </div>

          <div className="checkout-form-section">
            <h3>Payment Simulation</h3>
            <p className="payment-simulation-note">
              ℹ️ Placing an order will automatically simulate a successful credit card payment and set the order status to <strong>"Paid"</strong>. No real credit card details are required.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`btn-place-order-submit ${loading ? 'btn-submitting' : ''}`}
          >
            {loading ? 'Processing Order...' : `Place Paid Order (Rs. ${subtotal.toFixed(2)})`}
          </button>
        </form>

        {/* Order Summary Summary Panel */}
        <div className="checkout-summary-column">
          <div className="checkout-summary-card">
            <h3>Order Summary</h3>
            <div className="summary-divider"></div>
            
            <div className="checkout-summary-items-list">
              {cart.items.map((item) => (
                <div key={item._id} className="checkout-summary-item-line">
                  <div className="item-name-author">
                    <span className="item-title">{item.book.title}</span>
                    <span className="item-qty">Qty: {item.quantity}</span>
                  </div>
                  <span className="item-total-price">Rs. {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

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
              <span>Total Amount</span>
              <span>Rs. {subtotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
