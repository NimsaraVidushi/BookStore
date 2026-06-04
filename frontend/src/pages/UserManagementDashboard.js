import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../services/api';
import './UserManagementDashboard.css';

const UserManagementDashboard = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (search) {
      const timer = setTimeout(() => {
        fetchUsers(search);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      fetchUsers();
    }
  }, [search]);

  const fetchUsers = async (searchTerm = '') => {
    setLoading(true);
    try {
      const response = await userAPI.getAllUsers(searchTerm);
      setUsers(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userAPI.deleteUser(id);
        setSuccess('User deleted successfully');
        fetchUsers();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  return (
    <div className="user-management">
      <div className="management-header">
        <h1>User Management Dashboard</h1>
        <Link to="/admin/users/add" className="btn btn-success">+ Add New User</Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="search-box">
        <input
          type="text"
          placeholder="Search by username or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {loading ? (
        <div>Loading users...</div>
      ) : users.length === 0 ? (
        <div>No users found</div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>User Type</th>
                <th>Status</th>
                <th>Member Since</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${user.userType === 'Admin' ? 'badge-admin' : 'badge-user'}`}>
                      {user.userType}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${user.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="actions">
                    <Link to={`/admin/users/edit/${user._id}`} className="btn btn-sm btn-primary">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(user._id)}
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

export default UserManagementDashboard;
