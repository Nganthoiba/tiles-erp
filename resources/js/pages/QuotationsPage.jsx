import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../layouts/DashboardLayout';
import { FiPlus, FiSearch, FiFileText, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import Swal from 'sweetalert2';

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState({
    page: 1,
    search: '',
    status: ''
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchQuotations();
  }, [params.page, params.status]);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/quotations', { params });
      setQuotations(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        total: response.data.total
      });
    } catch (error) {
      console.error('Error fetching quotations:', error);
      Swal.fire('Error', 'Could not load quotations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchQuotations();
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: <span className="badge bg-secondary opacity-75">Draft</span>,
      sent: <span className="badge bg-info text-white">Sent</span>,
      approved: <span className="badge bg-success">Approved</span>,
      rejected: <span className="badge bg-danger">Rejected</span>,
      expired: <span className="badge bg-warning text-dark">Expired</span>,
      converted: <span className="badge bg-primary">Converted</span>
    };
    return badges[status] || <span className="badge bg-light text-dark">{status}</span>;
  };

  return (
    <DashboardLayout>
      <div className="container-fluid py-3 px-md-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold mb-0 text-dark">Sales Quotations</h4>
            <p className="text-secondary small mb-0">Manage and track your sales offers</p>
          </div>
          <Link to="/quotations/create" className="btn btn-primary d-flex align-items-center gap-2 px-3 btn-sm fw-semibold shadow-sm">
            <FiPlus /> New Quotation
          </Link>
        </div>

        <div className="card premium-card border-0 rounded-3 shadow-sm mb-4">
          <div className="card-body p-3">
            <form onSubmit={handleSearch} className="row g-2">
              <div className="col-md-5">
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white border-end-0 text-secondary"><FiSearch /></span>
                  <input 
                    type="text" 
                    className="form-control border-start-0 ps-0 shadow-none" 
                    placeholder="Search by number or customer name..." 
                    value={params.search}
                    onChange={(e) => setParams({...params, search: e.target.value})}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <select 
                  className="form-select form-select-sm shadow-none"
                  value={params.status}
                  onChange={(e) => setParams({...params, status: e.target.value, page: 1})}
                >
                  <option value="">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="approved">Approved</option>
                  <option value="converted">Converted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="col-md-2">
                <button type="submit" className="btn btn-dark btn-sm w-100 fw-semibold">Search</button>
              </div>
            </form>
          </div>
        </div>

        <div className="card premium-card border-0 rounded-3 shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 small">
                <thead className="bg-light text-secondary">
                  <tr>
                    <th className="px-4 py-3">Quotation #</th>
                    <th className="py-3">Contact Details</th>
                    <th className="py-3">Amount</th>
                    <th className="py-3 text-center">Status</th>
                    <th className="py-3">Valid Until</th>
                    <th className="text-end px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
                  ) : quotations.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-5 text-secondary font-italic">No quotations found.</td></tr>
                  ) : quotations.map(quo => (
                    <tr key={quo.id}>
                      <td className="px-4 fw-bold text-primary">{quo.quotation_number}</td>
                      <td>
                        <div className="fw-semibold text-dark">{quo.contact?.name || 'Unknown'}</div>
                        <div className="smaller text-muted">{quo.contact_type.split('\\').pop()}</div>
                      </td>
                      <td>
                        <div className="fw-bold text-dark">₹{Number(quo.grand_total).toLocaleString()}</div>
                        <div className="smaller text-muted">Sub: ₹{Number(quo.subtotal).toLocaleString()}</div>
                      </td>
                      <td className="text-center">{getStatusBadge(quo.status)}</td>
                      <td>
                        <div className="smaller">
                          {quo.valid_until ? new Date(quo.valid_until).toLocaleDateString('en-IN', {day: '2-digit', month: 'short', year: 'numeric'}) : 'N/A'}
                        </div>
                      </td>
                      <td className="text-end px-4">
                        <Link to={`/quotations/${quo.id}`} className="btn btn-outline-secondary btn-sm rounded-pill px-3 me-1">View</Link>
                        {quo.status === 'draft' && (
                          <Link to={`/quotations/${quo.id}/edit`} className="btn btn-outline-primary btn-sm rounded-pill px-3">Edit</Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {pagination.last_page > 1 && (
              <div className="p-3 border-top d-flex justify-content-end">
                <nav>
                  <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${params.page === 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => setParams({...params, page: params.page - 1})}>Previous</button>
                    </li>
                    {[...Array(pagination.last_page)].map((_, i) => (
                      <li key={i} className={`page-item ${params.page === i + 1 ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => setParams({...params, page: i + 1})}>{i + 1}</button>
                      </li>
                    ))}
                    <li className={`page-item ${params.page === pagination.last_page ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => setParams({...params, page: params.page + 1})}>Next</button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
