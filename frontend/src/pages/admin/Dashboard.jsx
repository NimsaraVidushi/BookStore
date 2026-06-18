import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    booksCount: 0,
    ordersCount: 0,
    usersCount: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const [booksRes, ordersRes, usersRes] = await Promise.all([
          API.get('/admin/books'),
          API.get('/admin/orders'),
          API.get('/admin/users')
        ]);

        const booksList = booksRes.data.data;
        const ordersList = ordersRes.data.data;
        const usersList = usersRes.data.data;

        // Calculate total revenue from non-cancelled orders
        const activeOrders = ordersList.filter(o => o.status !== 'cancelled');
        const revenue = activeOrders.reduce((acc, order) => acc + order.totalAmount, 0);

        setStats({
          booksCount: booksList.length,
          ordersCount: ordersList.length,
          usersCount: usersList.length,
          revenue
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to retrieve administrative statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="admin-loading-state">
        <div className="loading-spinner"></div>
        <p>Loading admin stats dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-header">
        <h1>🛡️ Administration Control Panel</h1>
        <p>Real-time analytics and inventory management</p>
      </div>

      {error && <div className="alert-message alert-error">{error}</div>}

      {/* Stats Cards Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="card-stat-info">
            <span className="stat-emoji">📚</span>
            <div>
              <h3>Total Books</h3>
              <p className="stat-number">{stats.booksCount}</p>
            </div>
          </div>
          <Link to="/admin/books" className="admin-stat-link">Manage Inventory →</Link>
        </div>

        <div className="admin-stat-card">
          <div className="card-stat-info">
            <span className="stat-emoji">💳</span>
            <div>
              <h3>Total Orders</h3>
              <p className="stat-number">{stats.ordersCount}</p>
            </div>
          </div>
          <Link to="/admin/orders" className="admin-stat-link">Track Orders →</Link>
        </div>

        <div className="admin-stat-card">
          <div className="card-stat-info">
            <span className="stat-emoji">👥</span>
            <div>
              <h3>Total Users</h3>
              <p className="stat-number">{stats.usersCount}</p>
            </div>
          </div>
          <Link to="/admin/users" className="admin-stat-link">Manage Users →</Link>
        </div>

        <div className="admin-stat-card">
          <div className="card-stat-info">
            <span className="stat-emoji">💰</span>
            <div>
              <h3>Total Revenue</h3>
              <p className="stat-number">Rs. {stats.revenue.toFixed(2)}</p>
            </div>
          </div>
          <Link to="/admin/orders" className="admin-stat-link">View Sales Details →</Link>
        </div>
      </div>

      {/* Admin Quick Options Menu */}
      <div className="admin-quick-menu-section">
        <h2>Quick Operations</h2>
        <div className="admin-quick-menu-grid">
          <Link to="/admin/books" className="quick-menu-item-btn">
            <span className="item-icon-indicator">➕</span>
            <div className="item-txt-block">
              <h4>Book Inventory & Categories</h4>
              <p>Add new books, adjust stock levels, or manage category terms.</p>
            </div>
          </Link>

          <Link to="/admin/orders" className="quick-menu-item-btn">
            <span className="item-icon-indicator">🚚</span>
            <div className="item-txt-block">
              <h4>Order Dispatching & Tracking</h4>
              <p>Update order delivery timelines and assign shipping codes.</p>
            </div>
          </Link>

          <Link to="/admin/users" className="quick-menu-item-btn">
            <span className="item-icon-indicator">🔒</span>
            <div className="item-txt-block">
              <h4>Account Access & Permissions</h4>
              <p>Toggle account roles (user/admin) or ban abusive shoppers.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
