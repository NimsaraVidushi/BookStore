import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../api/api';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch Cart from Backend
  const fetchCart = async () => {
    if (!token) {
      setCart(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await API.get('/cart');
      setCart(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  // Sync cart whenever token changes
  useEffect(() => {
    fetchCart();
  }, [token]);

  // Add Item to Cart
  const addToCart = async (bookId, quantity = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.post('/cart', { bookId, quantity });
      setCart(response.data.data);
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to add item to cart';
      setError(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Update Quantity of Item in Cart
  const updateQuantity = async (itemId, quantity) => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.put(`/cart/${itemId}`, { quantity });
      setCart(response.data.data);
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to update item quantity';
      setError(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Remove Item from Cart
  const removeFromCart = async (itemId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.delete(`/cart/${itemId}`);
      setCart(response.data.data);
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to remove item';
      setError(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Clear Cart
  const clearCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.delete('/cart');
      setCart(response.data.data);
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to clear cart';
      setError(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Derived properties
  const itemCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const subtotal = cart?.items?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        itemCount,
        subtotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
