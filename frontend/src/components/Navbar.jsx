import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import API from '../api/api';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { itemCount } = useContext(CartContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [categories, setCategories] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Sync search input with URL search params
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  // Fetch categories for the Navbar dropdown menu
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await API.get('/categories');
        setCategories(response.data.data);
      } catch (err) {
        console.warn('Failed to load categories in navbar:', err.message);
      }
    };
    fetchCategories();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/');
    }
  };

  const handleCategorySelect = (categoryName) => {
    navigate(`/?category=${encodeURIComponent(categoryName)}`);
    setShowDropdown(false);
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-emoji">📚</span>
          <span className="logo-text">Sarasavi<span className="logo-bold">BookStore</span></span>
        </Link>

        {/* Search Form */}
        <form onSubmit={handleSearchSubmit} className="navbar-search-form">
          <input
            type="text"
            placeholder="Search by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="navbar-search-input"
          />
          <button type="submit" className="navbar-search-button">
            🔍
          </button>
        </form>

        {/* Navigation Links */}
        <nav className="navbar-nav">
          <ul className="navbar-links">
            <li>
              <Link to="/" className="nav-link">Home</Link>
            </li>
            
            {/* Categories Dropdown */}
            <li className="nav-dropdown-item">
              <button 
                onClick={() => setShowDropdown(!showDropdown)} 
                className="nav-link dropdown-toggle-btn"
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              >
                Categories ▼
              </button>
              {showDropdown && (
                <ul className="navbar-dropdown-menu">
                  <li>
                    <Link to="/" className="dropdown-link">All Categories</Link>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat._id}>
                      <button 
                        onMouseDown={() => handleCategorySelect(cat.name)}
                        className="dropdown-link-btn"
                      >
                        {cat.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>

            {/* Admin Portal Link */}
            {user && user.role === 'admin' && (
              <li>
                <Link to="/admin" className="nav-link admin-pill-link">🛡️ Admin Dashboard</Link>
              </li>
            )}

            {/* Cart Badge */}
            <li>
              <Link to="/cart" className="nav-link navbar-cart-link">
                🛒 Cart
                {itemCount > 0 && <span className="cart-badge-count">{itemCount}</span>}
              </Link>
            </li>

            {/* Order History */}
            {user && (
              <li>
                <Link to="/orders" className="nav-link">My Orders</Link>
              </li>
            )}

            {/* Auth Actions */}
            {user ? (
              <li className="navbar-user-section">
                <span className="navbar-username">Hi, {user.name.split(' ')[0]}</span>
                <button onClick={logout} className="navbar-logout-btn">Logout</button>
              </li>
            ) : (
              <li>
                <Link to="/login" className="navbar-login-btn">Login</Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
