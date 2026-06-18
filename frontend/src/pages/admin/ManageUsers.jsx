import React, { useState, useEffect, useContext } from 'react';
import API from '../../api/api';
import { AuthContext } from '../../context/AuthContext';

const ManageUsers = () => {
  const { user: loggedInUser } = useContext(AuthContext);
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await API.get('/admin/users');
      setUsers(res.data.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to retrieve user registry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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

  // Toggle user role between user and admin
  const handleToggleRole = async (userId, currentRole, name) => {
    if (userId === loggedInUser.id) {
      showFeedback('error', 'You cannot change your own role.');
      return;
    }

    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Are you sure you want to change "${name}" to role: "${newRole}"?`)) {
      return;
    }

    setErrorMsg('');
    try {
      const res = await API.put(`/admin/users/${userId}`, { role: newRole });
      showFeedback('success', `Role for "${name}" updated to "${res.data.data.role}"!`);
      
      // Update local state list
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: res.data.data.role } : u));
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Failed to update user role');
    }
  };

  // Toggle ban status
  const handleToggleBan = async (userId, currentBanStatus, name) => {
    if (userId === loggedInUser.id) {
      showFeedback('error', 'You cannot ban yourself.');
      return;
    }

    const newBanStatus = !currentBanStatus;
    const actionLabel = newBanStatus ? 'BAN' : 'UNBAN';
    if (!window.confirm(`Are you sure you want to ${actionLabel} "${name}"? Banned users cannot log in.`)) {
      return;
    }

    setErrorMsg('');
    try {
      const res = await API.put(`/admin/users/${userId}`, { isBanned: newBanStatus });
      showFeedback('success', `User "${name}" has been ${newBanStatus ? 'BANNED' : 'UNBANNED'}!`);
      
      // Update local state list
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isBanned: res.data.data.isBanned } : u));
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Failed to update user ban status');
    }
  };

  // Delete user account
  const handleDeleteUser = async (userId, name) => {
    if (userId === loggedInUser.id) {
      showFeedback('error', 'You cannot delete yourself.');
      return;
    }

    if (!window.confirm(`⚠️ WARNING: Are you sure you want to permanently delete user account "${name}"? This action is irreversible.`)) {
      return;
    }

    setErrorMsg('');
    try {
      await API.delete(`/admin/users/${userId}`);
      showFeedback('success', `User account "${name}" deleted successfully.`);
      fetchUsers();
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Failed to delete user account');
    }
  };

  return (
    <div className="manage-users-page-container">
      <div className="admin-page-header-row">
        <h1>Account & User Management</h1>
        <p>Monitor shopper registrations and toggle account permissions</p>
      </div>

      {successMsg && <div className="alert-message alert-success">{successMsg}</div>}
      {errorMsg && <div className="alert-message alert-error">{errorMsg}</div>}

      {loading ? (
        <div className="admin-tab-loading">
          <div className="loading-spinner"></div>
          <p>Loading user profiles database...</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Account Status</th>
                <th>Registered Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u._id === loggedInUser.id;
                
                return (
                  <tr key={u._id} className={isSelf ? 'row-self-admin' : ''}>
                    <td>
                      <div className="user-name-cell-block">
                        <strong>{u.name}</strong>
                        {isSelf && <span className="self-account-badge">You</span>}
                      </div>
                    </td>
                    <td>
                      <span className="table-email-span">{u.email}</span>
                    </td>
                    <td>
                      <span className={`role-badge role-${u.role}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {u.isBanned ? (
                        <span className="status-badge-banned">🚫 Banned</span>
                      ) : (
                        <span className="status-badge-active">🟢 Active</span>
                      )}
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      {isSelf ? (
                        <span className="self-action-placeholder">No administrative actions</span>
                      ) : (
                        <div className="table-actions-cell">
                          <button
                            onClick={() => handleToggleRole(u._id, u.role, u.name)}
                            className="btn-table-toggle-role"
                          >
                            Toggle Role
                          </button>
                          
                          <button
                            onClick={() => handleToggleBan(u._id, u.isBanned, u.name)}
                            className={u.isBanned ? 'btn-table-unban' : 'btn-table-ban'}
                          >
                            {u.isBanned ? 'Unban User' : 'Ban User'}
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            className="btn-table-delete-user"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
