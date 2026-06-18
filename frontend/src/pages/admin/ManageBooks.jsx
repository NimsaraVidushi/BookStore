import React, { useState, useEffect } from 'react';
import API from '../../api/api';

const ManageBooks = () => {
  const [activeTab, setActiveTab] = useState('books'); // 'books' or 'categories'

  // Books State
  const [books, setBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [bookFormOpen, setBookFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null); // null for create, book object for edit
  const [bookFormData, setBookFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    price: '',
    stock: '',
    category: '',
    coverImage: '',
    description: '',
    isFeatured: false
  });
  
  // Categories State
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoryFormData, setCategoryFormData] = useState({ name: '', description: '' });
  const [editingCategory, setEditingCategory] = useState(null);

  // Common UI State
  const [uploadingImage, setUploadingImage] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch all categories and books on load
  const fetchData = async () => {
    setBooksLoading(true);
    setCategoriesLoading(true);
    setErrorMsg('');
    try {
      const [booksRes, catsRes] = await Promise.all([
        API.get('/admin/books'),
        API.get('/categories')
      ]);
      setBooks(booksRes.data.data);
      setCategories(catsRes.data.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to sync database logs');
    } finally {
      setBooksLoading(false);
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showFeedback = (type, msg) => {
    if (type === 'success') {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  // Image upload handler
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadingImage(true);
    setErrorMsg('');
    try {
      const res = await API.post('/admin/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      const imageUrl = res.data.data.url;
      setBookFormData(prev => ({
        ...prev,
        coverImage: imageUrl
      }));
      showFeedback('success', 'Cover image uploaded successfully!');
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  // Book CRUD Handlers
  const handleBookInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBookFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleOpenCreateBook = () => {
    setEditingBook(null);
    setBookFormData({
      title: '',
      author: '',
      isbn: '',
      price: '',
      stock: '',
      category: categories[0]?._id || '',
      coverImage: '',
      description: '',
      isFeatured: false
    });
    setBookFormOpen(true);
  };

  const handleOpenEditBook = (book) => {
    setEditingBook(book);
    setBookFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      price: book.price.toString(),
      stock: book.stock.toString(),
      category: book.category?._id || '',
      coverImage: book.coverImage || '',
      description: book.description || '',
      isFeatured: book.isFeatured || false
    });
    setBookFormOpen(true);
  };

  const handleBookFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const formattedData = {
      ...bookFormData,
      price: parseFloat(bookFormData.price),
      stock: parseInt(bookFormData.stock)
    };

    if (isNaN(formattedData.price) || isNaN(formattedData.stock)) {
      setErrorMsg('Price and Stock must be valid numbers');
      return;
    }

    try {
      if (editingBook) {
        // Update
        const res = await API.put(`/admin/books/${editingBook._id}`, formattedData);
        showFeedback('success', `Book "${res.data.data.title}" updated successfully!`);
      } else {
        // Create
        const res = await API.post('/admin/books', formattedData);
        showFeedback('success', `Book "${res.data.data.title}" added to inventory!`);
      }
      setBookFormOpen(false);
      fetchData();
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Operation failed');
    }
  };

  const handleSoftDeleteBook = async (bookId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This is a soft-delete (sets isDeleted to true).`)) {
      return;
    }

    try {
      await API.delete(`/admin/books/${bookId}`);
      showFeedback('success', `Book "${title}" deleted from catalog.`);
      fetchData();
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Delete operation failed');
    }
  };

  const handleRestoreBook = async (bookId, title) => {
    try {
      await API.put(`/admin/books/${bookId}`, { isDeleted: false });
      showFeedback('success', `Book "${title}" restored successfully.`);
      fetchData();
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Restore operation failed');
    }
  };

  // Category CRUD Handlers
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!categoryFormData.name) {
      setErrorMsg('Category name is required');
      return;
    }

    try {
      if (editingCategory) {
        await API.put(`/admin/categories/${editingCategory._id}`, categoryFormData);
        showFeedback('success', 'Category updated successfully!');
      } else {
        await API.post('/admin/categories', categoryFormData);
        showFeedback('success', 'New category created successfully!');
      }
      setCategoryFormData({ name: '', description: '' });
      setEditingCategory(null);
      fetchData();
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Category transaction failed');
    }
  };

  const handleDeleteCategory = async (catId, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) {
      return;
    }

    try {
      await API.delete(`/admin/categories/${catId}`);
      showFeedback('success', `Category "${name}" deleted.`);
      fetchData();
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <div className="manage-books-page-container">
      <div className="admin-page-header-row">
        <h1>Inventory Control Panel</h1>
        
        {/* Tab selector */}
        <div className="admin-header-tabs">
          <button
            onClick={() => setActiveTab('books')}
            className={`admin-tab-btn ${activeTab === 'books' ? 'active-tab' : ''}`}
          >
            📚 Books Inventory
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`admin-tab-btn ${activeTab === 'categories' ? 'active-tab' : ''}`}
          >
            📁 Categories Directory
          </button>
        </div>
      </div>

      {successMsg && <div className="alert-message alert-success">{successMsg}</div>}
      {errorMsg && <div className="alert-message alert-error">{errorMsg}</div>}

      {/* BOOKS TAB PANEL */}
      {activeTab === 'books' && (
        <div className="admin-books-tab-content">
          <div className="action-row-header">
            <h3>Manage Store Books</h3>
            <button onClick={handleOpenCreateBook} className="btn-admin-add-new">
              ＋ Add New Book
            </button>
          </div>

          {/* Book Form Dialog Overlay */}
          {bookFormOpen && (
            <div className="admin-modal-overlay">
              <div className="admin-modal-card">
                <div className="modal-header">
                  <h3>{editingBook ? `Edit: ${editingBook.title}` : 'Add New Book'}</h3>
                  <button onClick={() => setBookFormOpen(false)} className="btn-close-modal">✖</button>
                </div>
                
                <form onSubmit={handleBookFormSubmit} className="admin-modal-form">
                  <div className="form-group-row">
                    <div className="form-group-item">
                      <label>Book Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={bookFormData.title}
                        onChange={handleBookInputChange}
                        required
                        className="modal-form-input"
                      />
                    </div>
                    <div className="form-group-item">
                      <label>Author Name *</label>
                      <input
                        type="text"
                        name="author"
                        value={bookFormData.author}
                        onChange={handleBookInputChange}
                        required
                        className="modal-form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group-row">
                    <div className="form-group-item">
                      <label>ISBN-13 Code *</label>
                      <input
                        type="text"
                        name="isbn"
                        value={bookFormData.isbn}
                        onChange={handleBookInputChange}
                        required
                        className="modal-form-input"
                      />
                    </div>
                    <div className="form-group-item">
                      <label>Category *</label>
                      <select
                        name="category"
                        value={bookFormData.category}
                        onChange={handleBookInputChange}
                        required
                        className="modal-form-input"
                      >
                        {categories.map(cat => (
                          <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group-row">
                    <div className="form-group-item">
                      <label>Price (Rs.) *</label>
                      <input
                        type="text"
                        name="price"
                        value={bookFormData.price}
                        onChange={handleBookInputChange}
                        required
                        className="modal-form-input"
                      />
                    </div>
                    <div className="form-group-item">
                      <label>Stock Quantity *</label>
                      <input
                        type="text"
                        name="stock"
                        value={bookFormData.stock}
                        onChange={handleBookInputChange}
                        required
                        className="modal-form-input"
                      />
                    </div>
                  </div>

                  {/* Image cover upload */}
                  <div className="form-group-item">
                    <label>Cover Image URL / File Upload</label>
                    <div className="upload-flex-container">
                      <input
                        type="text"
                        name="coverImage"
                        value={bookFormData.coverImage}
                        onChange={handleBookInputChange}
                        placeholder="Paste image URL or upload file"
                        className="modal-form-input flex-grow-input"
                      />
                      <label className="btn-file-upload-label">
                        {uploadingImage ? 'Uploading...' : '📁 Choose File'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                    {bookFormData.coverImage && (
                      <div className="uploaded-cover-preview">
                        <img src={bookFormData.coverImage} alt="Cover Preview" />
                      </div>
                    )}
                  </div>

                  <div className="form-group-item">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={bookFormData.description}
                      onChange={handleBookInputChange}
                      rows="3"
                      className="modal-form-input"
                    ></textarea>
                  </div>

                  <div className="form-group-item checkbox-group">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      name="isFeatured"
                      checked={bookFormData.isFeatured}
                      onChange={handleBookInputChange}
                    />
                    <label htmlFor="isFeatured">Mark as Featured Book (Home Showcase)</label>
                  </div>

                  <button type="submit" className="btn-modal-submit-action">
                    {editingBook ? 'Save Changes' : 'Create Book'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Books Inventory Grid Table */}
          {booksLoading ? (
            <div className="admin-tab-loading">
              <div className="loading-spinner"></div>
              <p>Fetching book catalogs...</p>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Cover</th>
                    <th>Book Title</th>
                    <th>Author</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Featured</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => {
                    const isLowStock = book.stock < 5;
                    const isOutOfStock = book.stock <= 0;
                    
                    return (
                      <tr key={book._id} className={book.isDeleted ? 'row-deleted-book' : ''}>
                        <td>
                          {book.coverImage ? (
                            <img src={book.coverImage} alt="" className="table-cover-thumbnail" />
                          ) : (
                            <span className="table-cover-placeholder">📖</span>
                          )}
                        </td>
                        <td>
                          <div className="table-book-title-cell">
                            <strong>{book.title}</strong>
                            <span className="table-isbn-sub">ISBN: {book.isbn}</span>
                          </div>
                        </td>
                        <td>{book.author}</td>
                        <td>{book.category?.name || 'Unknown'}</td>
                        <td className="table-price-val">Rs. {book.price.toFixed(2)}</td>
                        <td>
                          <span 
                            className={`table-stock-display ${isOutOfStock ? 'stock-out-red' : isLowStock ? 'stock-low-red' : 'stock-ok'}`}
                          >
                            {book.stock}
                          </span>
                        </td>
                        <td>{book.isFeatured ? '✅ Yes' : '❌ No'}</td>
                        <td>
                          {book.isDeleted ? (
                            <span className="deleted-status-pill">Soft Deleted</span>
                          ) : (
                            <span className="active-status-pill">Active</span>
                          )}
                        </td>
                        <td>
                          <div className="table-actions-cell">
                            <button onClick={() => handleOpenEditBook(book)} className="btn-table-edit">
                              Edit
                            </button>
                            {book.isDeleted ? (
                              <button onClick={() => handleRestoreBook(book._id, book.title)} className="btn-table-restore">
                                Restore
                              </button>
                            ) : (
                              <button onClick={() => handleSoftDeleteBook(book._id, book.title)} className="btn-table-delete">
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CATEGORIES TAB PANEL */}
      {activeTab === 'categories' && (
        <div className="admin-categories-tab-content">
          <div className="categories-split-layout">
            
            {/* Left side: Add / Edit Form */}
            <div className="categories-form-card">
              <h3>{editingCategory ? 'Edit Category' : 'Create New Category'}</h3>
              <form onSubmit={handleCategorySubmit} className="category-inline-form">
                <div className="form-group-item">
                  <label>Category Name *</label>
                  <input
                    type="text"
                    value={categoryFormData.name}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                    required
                    placeholder="e.g. History"
                    className="modal-form-input"
                  />
                </div>
                <div className="form-group-item">
                  <label>Description</label>
                  <textarea
                    value={categoryFormData.description}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                    rows="4"
                    placeholder="Provide a brief summary of the genre..."
                    className="modal-form-input"
                  ></textarea>
                </div>

                <div className="category-form-btn-row">
                  <button type="submit" className="btn-category-submit">
                    {editingCategory ? 'Update' : 'Create Category'}
                  </button>
                  {editingCategory && (
                    <button 
                      type="button" 
                      onClick={() => { setEditingCategory(null); setCategoryFormData({ name: '', description: '' }); }}
                      className="btn-category-cancel"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Right side: List table */}
            <div className="categories-table-card">
              <h3>Category Directory</h3>
              {categoriesLoading ? (
                <div className="admin-tab-loading">
                  <div className="loading-spinner"></div>
                  <p>Loading catalog categories...</p>
                </div>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((cat) => (
                        <tr key={cat._id}>
                          <td><strong>{cat.name}</strong></td>
                          <td className="table-desc-cell">{cat.description || 'No description provided.'}</td>
                          <td>
                            <div className="table-actions-cell">
                              <button 
                                onClick={() => { setEditingCategory(cat); setCategoryFormData({ name: cat.name, description: cat.description || '' }); }} 
                                className="btn-table-edit"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteCategory(cat._id, cat.name)} 
                                className="btn-table-delete"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBooks;
