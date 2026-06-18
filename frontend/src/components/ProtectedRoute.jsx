import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { user, token, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="loading-spinner-container" style={spinnerContainerStyle}>
        <div className="loading-spinner" style={spinnerStyle}></div>
        <p style={{ marginTop: '15px', color: 'var(--text-secondary)' }}>Verifying session...</p>
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // If wrong role, redirect to customer home
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Simple inline styling for initial load spinner (can be overridden by App.css)
const spinnerContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '80vh',
  width: '100%'
};

const spinnerStyle = {
  border: '4px solid rgba(255, 255, 255, 0.1)',
  width: '50px',
  height: '50px',
  borderRadius: '50%',
  borderLeftColor: 'var(--accent-color, #6366f1)',
  animation: 'spin 1s linear infinite'
};

export default ProtectedRoute;
