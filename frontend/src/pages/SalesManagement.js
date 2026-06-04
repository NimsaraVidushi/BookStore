import React, { useState, useEffect } from 'react';
import { saleAPI } from '../services/api';
import './SalesManagement.css';

const SalesManagement = () => {
  const [sales, setSales] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    startDate: '',
    endDate: '',
    status: ''
  });

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async (params = {}) => {
    setLoading(true);
    try {
      const response = await saleAPI.getSaleHistory(params);
      setSales(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load sales');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  const handleApplyFilter = () => {
    const params = {};
    if (filter.startDate) params.startDate = filter.startDate;
    if (filter.endDate) params.endDate = filter.endDate;
    if (filter.status) params.status = filter.status;
    fetchSales(params);
  };

  const handleStatusChange = async (saleId, newStatus) => {
    try {
      await saleAPI.updateSaleStatus(saleId, { status: newStatus });
      setSuccess('Sale status updated');
      fetchSales();
    } catch (err) {
      setError('Failed to update status');
    }
  };

  return (
    <div className="sales-management">
      <h1>Sales Management</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="filter-section">
        <div className="filter-group">
          <label>Start Date</label>
          <input
            type="date"
            name="startDate"
            value={filter.startDate}
            onChange={handleFilterChange}
          />
        </div>

        <div className="filter-group">
          <label>End Date</label>
          <input
            type="date"
            name="endDate"
            value={filter.endDate}
            onChange={handleFilterChange}
          />
        </div>

        <div className="filter-group">
          <label>Status</label>
          <select name="status" value={filter.status} onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <button onClick={handleApplyFilter} className="btn btn-primary">
          Apply Filter
        </button>
      </div>

      {loading ? (
        <div>Loading sales...</div>
      ) : sales.length === 0 ? (
        <div>No sales found</div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Book Title</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total Price</th>
                <th>Date</th>
                <th>Status</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(sale => (
                <tr key={sale._id}>
                  <td>{sale.userId.username}</td>
                  <td>{sale.bookId.title}</td>
                  <td>{sale.quantity}</td>
                  <td>${sale.unitPrice.toFixed(2)}</td>
                  <td>${sale.totalPrice.toFixed(2)}</td>
                  <td>{new Date(sale.saleDate).toLocaleDateString()}</td>
                  <td>
                    <select
                      value={sale.status}
                      onChange={(e) => handleStatusChange(sale._id, e.target.value)}
                      className="status-select"
                    >
                      <option value="Completed">Completed</option>
                      <option value="Pending">Pending</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>{sale.paymentMethod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SalesManagement;
