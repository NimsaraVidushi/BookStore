import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navigation.css';

const Navigation = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          📖 BookStore Manager
        </Link>

        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">
              Home
            </Link>
          </li>

          {!user ? (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-link">
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="nav-link">
                  Register
                </Link>
              </li>
            </>
          ) : (
            <>
              {user.userType === 'Admin' && (
                <>
                  <li className="nav-item dropdown">
                    <button className="nav-link dropdown-toggle">
                      Admin Panel ▼
                    </button>
                    <div className="dropdown-menu">
                      <Link to="/admin/users" className="dropdown-item">
                        User Management
                      </Link>
                      <Link to="/admin/books" className="dropdown-item">
                        Book Management
                      </Link>
                      <Link to="/admin/reviews" className="dropdown-item">
                        Review Management
                      </Link>
                      <Link to="/admin/sales" className="dropdown-item">
                        Sales Management
                      </Link>
                      <Link to="/admin/sales-report" className="dropdown-item">
                        Sales Report
                      </Link>
                    </div>
                  </li>
                </>
              )}

              <li className="nav-item dropdown">
                <button className="nav-link dropdown-toggle">
                  👤 {user.username} ▼
                </button>
                <div className="dropdown-menu">
                  {user.userType === 'Admin' ? (
                    <Link to="/admin/profile" className="dropdown-item">
                      Admin Profile
                    </Link>
                  ) : (
                    <Link to="/user/profile" className="dropdown-item">
                      My Profile
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="dropdown-item logout-btn"
                  >
                    Logout
                  </button>
                </div>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
