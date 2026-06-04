import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI, bookAPI, saleAPI, reviewAPI } from '../services/api';
import './AdminProfile.css';

const AdminProfile = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBooks: 0,
    totalSales: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const usersRes = await userAPI.getAllUsers();
      const booksRes = await bookAPI.getAllBooks();
      const salesRes = await saleAPI.getSaleHistory();
      
      const completedSales = salesRes.data.filter(s => s.status === 'Completed');
      const totalRevenue = completedSales.reduce((acc, sale) => acc + sale.totalPrice, 0);

      setStats({
        totalUsers: usersRes.data.length,
        totalBooks: booksRes.data.length,
        totalSales: completedSales.length,
        totalRevenue
      });
    } catch (err) {
      console.log('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-profile">
      <h1>Admin Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-value">{stats.totalUsers}</p>
          <Link to="/admin/users" className="stat-link">Manage Users →</Link>
        </div>

        <div className="stat-card">
          <h3>Total Books</h3>
          <p className="stat-value">{stats.totalBooks}</p>
          <Link to="/admin/books" className="stat-link">Manage Books →</Link>
        </div>

        <div className="stat-card">
          <h3>Total Sales</h3>
          <p className="stat-value">{stats.totalSales}</p>
          <Link to="/admin/sales" className="stat-link">View Sales →</Link>
        </div>

        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p className="stat-value">${stats.totalRevenue.toFixed(2)}</p>
          <Link to="/admin/sales-report" className="stat-link">View Report →</Link>
        </div>
      </div>

      <div className="admin-menu">
        <h2>Quick Access</h2>
        <div className="menu-grid">
          <Link to="/admin/users" className="menu-item">
            <span>👥 User Management</span>
            <p>Add, edit, delete users</p>
          </Link>
          <Link to="/admin/books" className="menu-item">
            <span>📚 Book Management</span>
            <p>Manage library inventory</p>
          </Link>
          <Link to="/admin/reviews" className="menu-item">
            <span>⭐ Review Management</span>
            <p>Moderate user reviews</p>
          </Link>
          <Link to="/admin/sales" className="menu-item">
            <span>💰 Sales Management</span>
            <p>Track and manage sales</p>
          </Link>
          <Link to="/admin/sales-report" className="menu-item">
            <span>📊 Sales Reports</span>
            <p>Generate sales analytics</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
