import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navigation from './components/Navigation';
import Login from './pages/Login';
import Register from './pages/Register';
import HomePage from './pages/HomePage';
import UserProfile from './pages/UserProfile';
import AdminProfile from './pages/AdminProfile';
import UserManagementDashboard from './pages/UserManagementDashboard';
import AddEditUser from './pages/AddEditUser';
import BookManagement from './pages/BookManagement';
import AddEditBook from './pages/AddEditBook';
import BookDetails from './pages/BookDetails';
import ReviewManagement from './pages/ReviewManagement';
import SalesManagement from './pages/SalesManagement';
import SalesReport from './pages/SalesReport';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { token, loading } = React.useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  return token ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  return user?.userType === 'Admin' ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navigation />
          <main className="main-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<HomePage />} />
              
              {/* User Routes */}
              <Route
                path="/user/profile"
                element={
                  <PrivateRoute>
                    <UserProfile />
                  </PrivateRoute>
                }
              />
              
              {/* Admin Routes */}
              <Route
                path="/admin/profile"
                element={
                  <AdminRoute>
                    <AdminProfile />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <AdminRoute>
                    <UserManagementDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/users/add"
                element={
                  <AdminRoute>
                    <AddEditUser />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/users/edit/:id"
                element={
                  <AdminRoute>
                    <AddEditUser />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/books"
                element={
                  <AdminRoute>
                    <BookManagement />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/books/add"
                element={
                  <AdminRoute>
                    <AddEditBook />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/books/edit/:id"
                element={
                  <AdminRoute>
                    <AddEditBook />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/reviews"
                element={
                  <AdminRoute>
                    <ReviewManagement />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/sales"
                element={
                  <AdminRoute>
                    <SalesManagement />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/sales-report"
                element={
                  <AdminRoute>
                    <SalesReport />
                  </AdminRoute>
                }
              />
              
              {/* Book Detail Route */}
              <Route path="/books/:id" element={<BookDetails />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
