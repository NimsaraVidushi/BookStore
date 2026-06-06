import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { authAPI, saleAPI } from '../services/api';
import './UserProfile.css';

const UserProfile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [sales, setSales] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
    fetchSaleHistory();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      setProfile(response.data);
      setFormData({
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        email: response.data.email,
        phone: response.data.phone || '',
        address: response.data.address || ''
      });
    } catch (err) {
      setError('Failed to load profile');
    }
  };

  const fetchSaleHistory = async () => {
    try {
      const response = await saleAPI.getUserSaleHistory();
      setSales(response.data);
    } catch (err) {
      console.log('Failed to load sales history');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await authAPI.updateProfile(formData);
      updateUser(response.data.user);
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      await authAPI.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      setSuccess('Password changed successfully');
      setShowPasswordForm(false);
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Password change failed');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>No profile data</div>;

  return (
    <div className="user-profile">
      <h1>User Profile</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="profile-section">
        <h2>Personal Information</h2>
        
        {!isEditing ? (
          <div className="profile-info">
            <p><strong>Username:</strong> {profile.username}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>First Name:</strong> {profile.firstName || 'N/A'}</p>
            <p><strong>Last Name:</strong> {profile.lastName || 'N/A'}</p>
            <p><strong>Phone:</strong> {profile.phone || 'N/A'}</p>
            <p><strong>Address:</strong> {profile.address || 'N/A'}</p>
            <p><strong>Status:</strong> <span className="status-badge">{profile.status}</span></p>
            <p><strong>Member Since:</strong> {new Date(profile.createdAt).toLocaleDateString()}</p>

            <div className="profile-actions">
              <button onClick={() => setIsEditing(true)} className="btn btn-primary">
                Edit Profile
              </button>
              <button onClick={() => setShowPasswordForm(true)} className="btn btn-secondary">
                Change Password
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-success">Save Changes</button>
              <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {showPasswordForm && (
        <div className="password-section">
          <h2>Change Password</h2>
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label>Old Password</label>
              <input
                type="password"
                name="oldPassword"
                value={passwordData.oldPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-success">Change Password</button>
              <button type="button" onClick={() => setShowPasswordForm(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="sales-history">
        <h2>My Purchase History</h2>
        {sales.length === 0 ? (
          <p>No purchases yet</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Author</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(sale => (
                <tr key={sale._id}>
                  <td>{sale.bookId.title}</td>
                  <td>{sale.bookId.author}</td>
                  <td>{sale.quantity}</td>
                  <td>Rs. {sale.unitPrice.toFixed(2)}</td>
                  <td>Rs. {sale.totalPrice.toFixed(2)}</td>
                  <td>{new Date(sale.saleDate).toLocaleDateString()}</td>
                  <td>{sale.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
