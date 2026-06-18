import React, { useState, useEffect } from 'react';
import API from '../../api/api';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Tracking edit states
  const [editingTrackingOrderId, setEditingTrackingOrderId] = useState(null);
  const [trackingInput, setTrackingInput] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await API.get('/admin/orders');
      setOrders(res.data.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to fetch customer orders list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders by status
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === statusFilter));
    }
  }, [statusFilter, orders]);

  const showFeedback = (type, msg) => {
    if (type === 'success') {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  // Change delivery status
  const handleStatusChange = async (orderId, newStatus) => {
    setErrorMsg('');
    try {
      const res = await API.put(`/admin/orders/${orderId}`, { status: newStatus });
      showFeedback('success', `Order #${orderId.substring(orderId.length - 8)} status updated to "${newStatus}"!`);
      
      // Update local state list
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: res.data.data.status } : o));
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Failed to update order status');
    }
  };

  // Assign tracking number
  const handleOpenTrackingEdit = (order) => {
    setEditingTrackingOrderId(order._id);
    setTrackingInput(order.trackingNumber || '');
  };

  const handleSaveTracking = async (orderId) => {
    setErrorMsg('');
    try {
      const res = await API.put(`/admin/orders/${orderId}`, { trackingNumber: trackingInput });
      showFeedback('success', `Tracking number assigned to order!`);
      
      // Update local state list
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, trackingNumber: res.data.data.trackingNumber } : o));
      setEditingTrackingOrderId(null);
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Failed to assign tracking number');
    }
  };

  return (
    <div className="manage-orders-page-container">
      <div className="admin-page-header-row">
        <h1>Dispatch & Order Tracking</h1>
        
        {/* Status filters */}
        <div className="admin-status-filters-panel">
          <label htmlFor="status-filter-select">Filter status:</label>
          <select
            id="status-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-filter-select"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {successMsg && <div className="alert-message alert-success">{successMsg}</div>}
      {errorMsg && <div className="alert-message alert-error">{errorMsg}</div>}

      {loading ? (
        <div className="admin-tab-loading">
          <div className="loading-spinner"></div>
          <p>Fetching purchase records...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="admin-empty-table-state">
          <span className="empty-state-emoji">📦</span>
          <h3>No orders match status filter</h3>
          <p>There are no client transaction records listed under the "{statusFilter}" state.</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Client Name</th>
                <th>Client Email</th>
                <th>Order Date</th>
                <th>Total Price</th>
                <th>Payment</th>
                <th>Delivery Status</th>
                <th>Tracking Number</th>
                <th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const isCancelled = order.status === 'cancelled';
                const isDelivered = order.status === 'delivered';
                
                return (
                  <tr key={order._id}>
                    <td>
                      <span className="order-id-label-mono" title={order._id}>
                        #{order._id.substring(order._id.length - 8)}
                      </span>
                    </td>
                    <td>{order.user?.name || 'Deleted Account'}</td>
                    <td>
                      <span className="table-email-span">{order.user?.email || 'N/A'}</span>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="table-price-val">Rs. {order.totalAmount.toFixed(2)}</td>
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
                      {editingTrackingOrderId === order._id ? (
                        <div className="tracking-edit-inline-row">
                          <input
                            type="text"
                            value={trackingInput}
                            onChange={(e) => setTrackingInput(e.target.value)}
                            placeholder="Tracking code"
                            className="tracking-inline-input"
                          />
                          <button onClick={() => handleSaveTracking(order._id)} className="btn-tracking-save">
                            💾
                          </button>
                          <button onClick={() => setEditingTrackingOrderId(null)} className="btn-tracking-cancel">
                            ✖
                          </button>
                        </div>
                      ) : (
                        <div className="tracking-display-row">
                          <span className="tracking-display-val">
                            {order.trackingNumber || 'Not assigned'}
                          </span>
                          {!isCancelled && (
                            <button 
                              onClick={() => handleOpenTrackingEdit(order)} 
                              className="btn-tracking-edit-trigger"
                              title="Edit tracking number"
                            >
                              ✏️
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        disabled={isCancelled}
                        className={`table-status-changer-select status-${order.status} ${isCancelled ? 'changer-disabled' : ''}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
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

export default ManageOrders;
