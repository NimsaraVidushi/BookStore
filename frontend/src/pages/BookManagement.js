import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookAPI } from '../services/api';
import './BookManagement.css';

const BookManagement = () => {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    if (search) {
      const timer = setTimeout(() => {
        fetchBooks(search);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      fetchBooks();
    }
  }, [search]);

  const fetchBooks = async (searchTerm = '') => {
    setLoading(true);
    try {
      const response = await bookAPI.getAllBooks(searchTerm ? { search: searchTerm } : {});
      setBooks(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (bookId, newQuantity) => {
    if (newQuantity < 0) return;
    try {
      const bookToUpdate = books.find(b => b._id === bookId);
      if (!bookToUpdate) return;
      await bookAPI.updateBook(bookId, {
        ...bookToUpdate,
        quantity: parseInt(newQuantity)
      });
      setSuccess('Quantity updated successfully');
      fetchBooks(search);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update quantity');
    }
  };

  const handleDelete = async (id, title, isOutOfStock) => {
    const confirmMessage = isOutOfStock
      ? `"${title}" is OUT OF STOCK. Are you sure you want to permanently delete this book from the inventory?`
      : `Are you sure you want to delete "${title}"?`;

    if (window.confirm(confirmMessage)) {
      try {
        await bookAPI.deleteBook(id);
        setSuccess('Book deleted successfully');
        fetchBooks(search);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete book');
      }
    }
  };

  return (
    <div className="book-management">
      <div className="management-header">
        <h1>Book Management</h1>
        <Link to="/admin/books/add" className="btn btn-success">+ Add New Book</Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="search-box">
        <input
          type="text"
          placeholder="Search by title or author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {loading ? (
        <div>Loading books...</div>
      ) : books.length === 0 ? (
        <div>No books found</div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map(book => (
                <tr key={book._id}>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.category}</td>
                  <td>Rs. {book.price.toFixed(2)}</td>
                  <td>
                    <div className="quantity-inline-edit">
                      <button
                        onClick={() => handleQuantityChange(book._id, book.quantity - 1)}
                        className="btn-inline-qty"
                        disabled={book.quantity <= 0}
                      >
                        -
                      </button>
                      <span className={`qty-val ${book.quantity === 0 ? 'qty-out' : ''}`}>
                        {book.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(book._id, book.quantity + 1)}
                        className="btn-inline-qty"
                      >
                        +
                      </button>
                      {book.quantity === 0 && (
                        <span className="badge badge-out-of-stock" style={{ marginLeft: '10px' }}>
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </td>
                  <td>⭐ {book.averageRating.toFixed(1)}</td>
                  <td className="actions">
                    <Link to={`/admin/books/edit/${book._id}`} className="btn btn-sm btn-primary">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(book._id, book.title, book.quantity === 0)}
                      className="btn btn-sm btn-danger"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BookManagement;
