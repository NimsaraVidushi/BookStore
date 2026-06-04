import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Add token to requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const authAPI = {
  register: (data) => API.post('/users/register', data),
  login: (data) => API.post('/users/login', data),
  getProfile: () => API.get('/users/profile'),
  updateProfile: (data) => API.put('/users/profile', data),
  changePassword: (data) => API.put('/users/change-password', data)
};

// User Management API
export const userAPI = {
  getAllUsers: (search) => API.get('/users', { params: { search } }),
  getUserById: (id) => API.get(`/users/${id}`),
  addUser: (data) => API.post('/users/add', data),
  updateUser: (id, data) => API.put(`/users/edit/${id}`, data),
  deleteUser: (id) => API.delete(`/users/${id}`)
};

// Book API
export const bookAPI = {
  getAllBooks: (params) => API.get('/books', { params }),
  getBookById: (id) => API.get(`/books/${id}`),
  createBook: (data) => API.post('/books', data),
  updateBook: (id, data) => API.put(`/books/${id}`, data),
  deleteBook: (id) => API.delete(`/books/${id}`)
};

// Review API
export const reviewAPI = {
  getReviewsByBook: (bookId) => API.get(`/reviews/book/${bookId}`),
  createReview: (data) => API.post('/reviews', data),
  getReviewsByUser: () => API.get('/reviews/user/history'),
  getReviewById: (id) => API.get(`/reviews/${id}`),
  updateReview: (id, data) => API.put(`/reviews/${id}`, data),
  deleteReview: (id) => API.delete(`/reviews/${id}`)
};

// Sale API
export const saleAPI = {
  createSale: (data) => API.post('/sales', data),
  getSaleHistory: (params) => API.get('/sales', { params }),
  getUserSaleHistory: () => API.get('/sales/my-history'),
  getSaleById: (id) => API.get(`/sales/${id}`),
  getSalesReport: (params) => API.get('/sales/report/generate', { params }),
  updateSaleStatus: (id, data) => API.put(`/sales/${id}/status`, data)
};

export default API;
