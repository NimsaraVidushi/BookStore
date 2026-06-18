import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../api/api';
import BookCard from '../components/BookCard';

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Read query filters from search params
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || '';

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get('/categories');
        setCategories(res.data.data);
      } catch (err) {
        console.warn('Failed to load categories:', err.message);
      }
    };
    fetchCategories();
  }, []);

  // Fetch books when search filters change
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await API.get('/books', {
          params: {
            category: categoryParam,
            search: searchParam,
            sort: sortParam
          }
        });
        setBooks(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to retrieve books');
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [categoryParam, searchParam, sortParam]);

  const updateSearchParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearchParams({});
  };

  const featuredBooks = books.filter(b => b.isFeatured);

  return (
    <div className="portal-home-page">
      {/* Featured Books Hero Section */}
      {featuredBooks.length > 0 && !searchParam && !categoryParam && (
        <section className="home-hero-carousel">
          <div className="carousel-slide-content">
            <span className="carousel-tag">🔥 Featured Read</span>
            <h2>{featuredBooks[0].title}</h2>
            <p className="carousel-author">by {featuredBooks[0].author}</p>
            <p className="carousel-description">
              {featuredBooks[0].description ? 
                (featuredBooks[0].description.length > 180 ? 
                  featuredBooks[0].description.substring(0, 180) + '...' : 
                  featuredBooks[0].description) : 
                'Explore this highly recommended featured edition available at Sarasavi Bookstore.'}
            </p>
            <div className="carousel-price-row">
              <span className="carousel-price">Rs. {featuredBooks[0].price.toFixed(2)}</span>
              <a href={`/books/${featuredBooks[0]._id}`} className="carousel-btn-details">
                Details & Order
              </a>
            </div>
          </div>
          <div className="carousel-slide-cover">
            {featuredBooks[0].coverImage ? (
              <img src={featuredBooks[0].coverImage} alt={featuredBooks[0].title} />
            ) : (
              <div className="carousel-cover-placeholder">📖</div>
            )}
          </div>
        </section>
      )}

      {/* Catalog & Filter Grid */}
      <div className="portal-catalog-layout">
        
        {/* Sidebar Filter Panel */}
        <aside className="catalog-sidebar-filters">
          <div className="filter-group-panel">
            <h3>Filter Categories</h3>
            <ul className="filter-category-links">
              <li>
                <button
                  onClick={() => updateSearchParam('category', '')}
                  className={`category-filter-btn ${!categoryParam ? 'active-filter' : ''}`}
                >
                  All Categories
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat._id}>
                  <button
                    onClick={() => updateSearchParam('category', cat.name)}
                    className={`category-filter-btn ${categoryParam === cat.name ? 'active-filter' : ''}`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="filter-group-panel">
            <h3>Sort By</h3>
            <select
              value={sortParam}
              onChange={(e) => updateSearchParam('sort', e.target.value)}
              className="catalog-sort-select"
            >
              <option value="">Default (Newest)</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="titleAsc">Title: A to Z</option>
              <option value="titleDesc">Title: Z to A</option>
            </select>
          </div>

          {(categoryParam || searchParam || sortParam) && (
            <button onClick={handleClearFilters} className="btn-clear-all-filters">
              🧹 Clear All Filters
            </button>
          )}
        </aside>

        {/* Catalog List */}
        <main className="catalog-main-content">
          <div className="catalog-header-bar">
            <h2>
              {searchParam ? `Search Results for "${searchParam}"` : categoryParam ? `${categoryParam} Books` : 'All Catalog Books'}
            </h2>
            <span className="results-count-label">{books.length} Books Found</span>
          </div>

          {error && <div className="alert-message alert-error">{error}</div>}

          {loading ? (
            <div className="catalog-loading-container">
              <div className="loading-spinner"></div>
              <p>Loading library catalogs...</p>
            </div>
          ) : books.length === 0 ? (
            <div className="catalog-empty-state">
              <span className="empty-state-icon">🔍</span>
              <h3>No books match your criteria</h3>
              <p>Try resetting filters or adjusting search terms.</p>
              <button onClick={handleClearFilters} className="btn-empty-state-clear">
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="catalog-books-grid">
              {books.map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;
