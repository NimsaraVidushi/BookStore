import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navigation.css';

const Navigation = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Local state for the navbar search box
  const [searchText, setSearchText] = useState('');

  // Keep search box in sync with URL search parameter
  useEffect(() => {
    setSearchText(searchParams.get('search') || '');
  }, [searchParams]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchText.trim()) {
      navigate(`/?search=${encodeURIComponent(searchText.trim())}`);
    } else {
      navigate('/');
    }
  };

  return (
    <header className="sarasavi-header">
      {/* Top Tier: Logo, Search Bar, User Actions */}
      <div className="header-top">
        <div className="header-container">
          <Link to="/" className="header-logo">
            <span className="logo-icon">📚</span>
            <span className="logo-text">Sarasavi <span className="logo-accent">BookStore</span></span>
          </Link>

          <form onSubmit={handleSearchSubmit} className="header-search-form">
            <input
              type="text"
              placeholder="Search books by title, author, isbn..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="header-search-input"
            />
            <button type="submit" className="header-search-btn">
              🔍 Search
            </button>
          </form>

          <div className="header-actions">
            {!user ? (
              <div className="auth-links">
                <Link to="/login" className="btn-login-nav">Login</Link>
                <Link to="/register" className="btn-register-nav">Register</Link>
              </div>
            ) : (
              <div className="user-nav-dropdown">
                <button className="user-dropdown-toggle">
                  👤 <span className="username-label">{user.username}</span> <span className="arrow">▼</span>
                </button>
                <div className="user-dropdown-menu">
                  {user.userType === 'Admin' ? (
                    <Link to="/admin/profile" className="dropdown-item">Admin Profile</Link>
                  ) : (
                    <Link to="/user/profile" className="dropdown-item">My Profile</Link>
                  )}
                  <button onClick={handleLogout} className="dropdown-item logout-btn">
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Tier: Category Bar */}
      <nav className="header-bottom">
        <div className="header-container">
          <ul className="categories-menu">
            <li>
              <Link to="/" className="category-link">Home</Link>
            </li>
            <li>
              <Link to="/?language=Sinhala" className="category-link">Sinhala Books</Link>
            </li>
            <li>
              <Link to="/?language=English" className="category-link">English Books</Link>
            </li>
            <li>
              <Link to="/?language=Tamil" className="category-link">Tamil Books</Link>
            </li>
            <li>
              <Link to="/?category=E-Books" className="category-link">E-Books</Link>
            </li>
            
            {user && user.userType === 'Admin' && (
              <li className="admin-menu-item">
                <button className="admin-dropdown-toggle">
                  ⚙️ Admin Panel <span className="arrow">▼</span>
                </button>
                <div className="admin-dropdown-menu">
                  <Link to="/admin/books" className="dropdown-item">Book Management</Link>
                  <Link to="/admin/users" className="dropdown-item">User Management</Link>
                  <Link to="/admin/reviews" className="dropdown-item">Review Management</Link>
                  <Link to="/admin/sales" className="dropdown-item">Sales Management</Link>
                  <Link to="/admin/sales-report" className="dropdown-item">Sales Report</Link>
                </div>
              </li>
            )}
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Navigation;
