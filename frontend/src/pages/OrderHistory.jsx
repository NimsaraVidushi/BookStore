import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/api';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await API.get('/orders/my');
        setOrders(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load order history');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="orders-loading-state">
        <div className="loading-spinner"></div>
        <p>Loading order history...</p>
      </div>
    );
  }

  return (
    <div className="order-history-container">
      <h1>📦 My Orders</h1>

      {error && <div className="alert-message alert-error">{error}</div>}

      {orders.length === 0 ? (
        <div className="orders-empty-state">
          <span className="orders-empty-icon">📂</span>
          <h3>No orders found</h3>
          <p>You haven't placed any orders yet. Visit our homepage and purchase your favorite books to get started!</p>
          <Link to="/" className="btn-browse-home">Start Shopping</Link>
        </div>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date Placed</th>
                <th>Items Count</th>
                <th>Total Price</th>
                <th>Payment</th>
                <th>Delivery Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const totalItemsCount = order.items.reduce((acc, item) => acc + item.quantity, 0);
                
                return (
                  <tr key={order._id}>
                    <td>
                      <span className="order-id-label" title={order._id}>
                        #{order._id.substring(order._id.length - 8)}
                      </span>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>{totalItemsCount} books</td>
                    <td className="order-table-price">Rs. {order.totalAmount.toFixed(2)}</td>
                    <td>
                      <span className={`payment-status-badge status-${order.paymentStatus}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`delivery-status-badge status-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <Link to={`/orders/${order._id}`} className="btn-table-view-order-details">
                        View Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
