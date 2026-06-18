import React, { createContext, useState, useEffect } from 'react';
import API from '../api/api';

export const AuthContext = createContext();

// Helper to decode JWT token payload without external libraries
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        const decoded = decodeToken(storedToken);
        // Check if token expired (optional, but good practice)
        if (decoded && decoded.exp * 1000 > Date.now()) {
          setToken(storedToken);
          // Fetch latest user profile to keep context in sync
          try {
            // Note: Since we don't have a specific profile route in spec, we can use the decoded token payload.
            // But we can also request /api/auth/profile if needed. To keep it robust and strictly matching
            // the spec (which only requires auth register/login), we will store user data in localStorage 
            // or decode the token, and fetch user data if needed.
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              setUser(JSON.parse(storedUser));
            } else {
              setUser({
                id: decoded.id,
                name: decoded.name,
                email: decoded.email,
                role: decoded.role
              });
            }
          } catch (e) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
          }
        } else {
          // Token expired
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await API.post('/auth/login', { email, password });
      const { token: returnedToken, user: returnedUser } = response.data.data;
      
      localStorage.setItem('token', returnedToken);
      localStorage.setItem('user', JSON.stringify(returnedUser));
      
      setToken(returnedToken);
      setUser(returnedUser);
      setLoading(false);
      return { success: true, user: returnedUser };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check your credentials.'
      };
    }
  };

  const register = async (name, email, password, address) => {
    setLoading(true);
    try {
      const response = await API.post('/auth/register', { name, email, password, address });
      const { token: returnedToken, user: returnedUser } = response.data.data;
      
      localStorage.setItem('token', returnedToken);
      localStorage.setItem('user', JSON.stringify(returnedUser));
      
      setToken(returnedToken);
      setUser(returnedUser);
      setLoading(false);
      return { success: true, user: returnedUser };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed.'
      };
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await API.post('/auth/logout');
    } catch (e) {
      console.warn('Logout request failed on backend:', e.message);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  // Helper to update user address in local context after placing order or editing profile
  const updateLocalUser = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateLocalUser }}>
      {children}
    </AuthContext.Provider>
  );
};
