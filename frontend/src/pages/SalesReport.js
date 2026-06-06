import React, { useState } from 'react';
import { saleAPI } from '../services/api';
import './SalesReport.css';

const SalesReport = () => {
  const [report, setReport] = useState(null);
  const [filter, setFilter] = useState({
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  const generateReport = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filter.startDate) params.startDate = filter.startDate;
      if (filter.endDate) params.endDate = filter.endDate;

      const response = await saleAPI.getSalesReport(params);
      setReport(response.data);
    } catch (err) {
      setError('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sales-report">
      <h1>Sales Report</h1>

      {error && <div className="alert alert-error">{error}</div>}

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

        <button onClick={generateReport} className="btn btn-primary" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {report && (
        <div className="report-content">
          <div className="report-info">
            <p><strong>Period:</strong> {report.period.startDate} to {report.period.endDate}</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Sales</h3>
              <p className="stat-value">{report.totalSales}</p>
            </div>

            <div className="stat-card">
              <h3>Total Revenue</h3>
              <p className="stat-value">Rs. {report.totalRevenue.toFixed(2)}</p>
            </div>

            <div className="stat-card">
              <h3>Average Order Value</h3>
              <p className="stat-value">Rs. {report.averageOrderValue.toFixed(2)}</p>
            </div>
          </div>

          <div className="chart-placeholder">
            <p>💡 Chart visualization can be added here with a charting library like Chart.js or Recharts</p>
          </div>
        </div>
      )}

      {!report && !loading && (
        <div className="no-report">
          <p>Click "Generate Report" to view sales analytics</p>
        </div>
      )}
    </div>
  );
};

export default SalesReport;
