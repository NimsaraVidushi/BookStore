import React, { useState, useEffect, useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { bookAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './HomePage.css';

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const language = searchParams.get('language') || '';

  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchBooks();
  }, [search, category, language]);

  const fetchBooks = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await bookAPI.getAllBooks({ search, category, language });
      setBooks(response.data);
    } catch (err) {
      setError('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="home-page">
      <div className="hero">
        <h1>Welcome to BookStore Manager</h1>
        <p>Explore, purchase, and review your favorite books</p>
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder="Search books by title or author..."
          value={search}
          onChange={(e) => updateFilters('search', e.target.value)}
          className="search-input"
        />
        <select
          value={category}
          onChange={(e) => updateFilters('category', e.target.value)}
          className="category-select"
        >
          <option value="">All Categories</option>
          <option value="Printed">Printed Books</option>
          <option value="E-Books">E-Books</option>
        </select>
        <select
          value={language}
          onChange={(e) => updateFilters('language', e.target.value)}
          className="language-select"
        >
          <option value="">All Languages</option>
          <option value="Sinhala">Sinhala</option>
          <option value="English">English</option>
          <option value="Tamil">Tamil</option>
        </select>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading books...</div>
      ) : books.length === 0 ? (
        <div className="no-books">No books found</div>
      ) : (
        <div className="books-grid">
          {books.map(book => (
            <div key={book._id} className="book-card">
              <div className="book-image">
                {book.coverImage ? (
                  <img src={book.coverImage} alt={book.title} />
                ) : (
                  <div className="no-image">No Image</div>
                )}
              </div>
              <div className="book-info">
                <h3>{book.title}</h3>
                <p className="author">by {book.author}</p>
                <p className="category">{book.category}</p>
                <div className="rating">
                  <span>⭐ {book.averageRating.toFixed(1)}</span>
                  <span>({book.totalReviews} reviews)</span>
                </div>
                <p className="price">Rs. {book.price.toFixed(2)}</p>
                <p className="stock">
                  {book.quantity > 0 ? (
                    <span className="in-stock">In Stock ({book.quantity})</span>
                  ) : (
                    <span className="out-of-stock">Out of Stock</span>
                  )}
                </p>
                <Link to={`/books/${book._id}`} className="btn btn-primary">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
