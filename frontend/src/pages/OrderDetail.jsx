import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/api';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get(`/orders/${id}`);
      setOrder(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order? Stock will be restored.')) {
      return;
    }

    setCancelLoading(true);
    setSuccessMsg('');
    setError(null);
    try {
      const response = await API.put(`/orders/${id}/cancel`);
      setOrder(response.data.data);
      setSuccessMsg('Order cancelled and stock restored successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading && !order) {
    return (
      <div className="order-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="order-details-error">
        <div className="alert-message alert-error">{error}</div>
        <Link to="/orders" className="btn-back-history">↩ Back to Orders</Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-details-empty">
        <h3>Order not found</h3>
        <Link to="/orders" className="btn-back-history">↩ Back to Orders</Link>
      </div>
    );
  }

  const isPending = order.status === 'pending';
  const isShipped = order.status === 'shipped' || order.status === 'delivered';
  const isDelivered = order.status === 'delivered';
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="order-detail-page-container">
      <Link to="/orders" className="btn-back-link">← Back to Orders</Link>

      <div className="order-detail-header">
        <div>
          <h1>Order Invoice</h1>
          <p className="order-detail-id-sub">Order ID: #{order._id}</p>
        </div>
        
        {isPending && (
          <button
            onClick={handleCancelOrder}
            disabled={cancelLoading}
            className={`btn-cancel-order ${cancelLoading ? 'btn-cancelling' : ''}`}
          >
            {cancelLoading ? 'Cancelling...' : 'Cancel Order ❌'}
          </button>
        )}
      </div>

      {successMsg && <div className="alert-message alert-success">{successMsg}</div>}
      {error && <div className="alert-message alert-error">{error}</div>}

      {/* Visual Order Timeline Tracker */}
      <div className="order-timeline-card">
        <h3>Delivery Timeline</h3>
        {isCancelled ? (
          <div className="cancelled-timeline-state">
            <span className="cancelled-bullet">🔴</span>
            <p><strong>This order has been cancelled.</strong> The items have been returned to inventory, and any simulated payment has been refunded.</p>
          </div>
        ) : (
          <div className="timeline-tracker-flow">
            <div className={`timeline-step ${isPending || isShipped ? 'step-completed' : ''}`}>
              <div className="step-bullet">1</div>
              <div className="step-label">Pending Approval</div>
            </div>
            <div className={`timeline-connector ${isShipped ? 'connector-completed' : ''}`}></div>
            <div className={`timeline-step ${isShipped ? 'step-completed' : ''}`}>
              <div className="step-bullet">2</div>
              <div className="step-label">Shipped</div>
            </div>
            <div className={`timeline-connector ${isDelivered ? 'connector-completed' : ''}`}></div>
            <div className={`timeline-step ${isDelivered ? 'step-completed' : ''}`}>
              <div className="step-bullet">3</div>
              <div className="step-label">Delivered</div>
            </div>
          </div>
        )}
      </div>

      <div className="order-detail-grid-info">
        
        {/* Left Side: Items snapshot list */}
        <div className="order-items-summary-card">
          <h3>Purchased Books</h3>
          <div className="order-items-table-header">
            <span>Book Title</span>
            <span>Quantity</span>
            <span>Unit Price</span>
            <span>Subtotal</span>
          </div>
          <div className="order-detail-items-list">
            {order.items.map((item) => (
              <div key={item._id} className="order-detail-item-row">
                <span className="detail-item-title">{item.title}</span>
                <span className="detail-item-qty">{item.quantity}</span>
                <span className="detail-item-price">Rs. {item.price.toFixed(2)}</span>
                <span className="detail-item-subtotal">Rs. {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="order-summary-price-footer">
            <div className="summary-price-row">
              <span>Subtotal</span>
              <span>Rs. {order.totalAmount.toFixed(2)}</span>
            </div>
            <div className="summary-price-row">
              <span>Shipping</span>
              <span>FREE</span>
            </div>
            <div className="summary-price-row summary-grand-total">
              <span>Grand Total</span>
              <span>Rs. {order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Shipping and metadata */}
        <div className="order-metadata-side-cards">
          <div className="metadata-card-item">
            <h3>Shipping Details</h3>
            <p><strong>Address:</strong></p>
            <p className="metadata-address-text">
              {order.shippingAddress.street}<br />
              {order.shippingAddress.city}, {order.shippingAddress.postalCode}
            </p>
            {order.trackingNumber && (
              <p style={{ marginTop: '15px' }}>
                <strong>Tracking Number:</strong> <code className="tracking-number-code">{order.trackingNumber}</code>
              </p>
            )}
          </div>

          <div className="metadata-card-item">
            <h3>Order Status Information</h3>
            <table className="metadata-status-table">
              <tbody>
                <tr>
                  <td><strong>Payment</strong></td>
                  <td>
                    <span className={`payment-status-badge status-${order.paymentStatus}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td><strong>Delivery</strong></td>
                  <td>
                    <span className={`delivery-status-badge status-${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td><strong>Placed Date</strong></td>
                  <td>{new Date(order.createdAt).toLocaleString()}</td>
                </tr>
                <tr>
                  <td><strong>Last Update</strong></td>
                  <td>{new Date(order.updatedAt).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderDetail;
