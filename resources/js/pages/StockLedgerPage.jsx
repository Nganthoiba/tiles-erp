import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import { FiList, FiArrowDown, FiArrowUp, FiRefreshCw } from 'react-icons/fi';

export default function StockLedgerPage() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to first page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchLedger();
  }, [debouncedSearch, page, perPage]);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/inventory/ledger', {
        params: { 
          search: debouncedSearch,
          page,
          per_page: perPage
        }
      });
      const data = response.data;
      setLedger(data?.data || (Array.isArray(data) ? data : []));
      setPagination({
        current_page: data?.current_page,
        last_page: data?.last_page,
        total: data?.total,
        from: data?.from,
        to: data?.to
      });
    } catch (err) {
      console.error('Error fetching ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <DashboardLayout>
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold mb-0 text-dark">Stock Ledger</h4>
            <p className="text-secondary small mb-0">Complete history of all stock movements</p>
          </div>
          <div className="d-flex gap-3">
            <div className="input-group input-group-sm" style={{width: '300px'}}>
              <span className="input-group-text bg-white border-end-0 text-secondary"><FiList /></span>
              <input 
                type="text" 
                className="form-control border-start-0 ps-0 shadow-none" 
                placeholder="Search by Product, SKU or Note..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button onClick={fetchLedger} className="btn btn-light btn-sm d-flex align-items-center gap-2 border">
              <FiRefreshCw className={loading ? 'spin' : ''} /> Refresh
            </button>
            <select 
              className="form-select form-select-sm border shadow-none" 
              style={{width: '120px'}}
              value={perPage}
              onChange={(e) => {
                setPerPage(parseInt(e.target.value));
                setPage(1);
              }}
            >
              <option value="10">10 per page</option>
              <option value="15">15 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </select>
          </div>
        </div>

        <div className="card premium-card border-0 rounded-3 shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 small">
                <thead className="bg-light">
                  <tr>
                    <th>#</th>
                    <th className="px-4">Date & Time</th>
                    <th>Product</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th className="text-end">Quantity</th>
                    <th className="px-4">Reference / Note</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5">
                        <div className="spinner-border text-primary spinner-border-sm" role="status"></div>
                      </td>
                    </tr>
                  ) : ledger.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-secondary">No activities found matching your search.</td>
                    </tr>
                  ) : (
                    ledger.map((entry, index) => (
                      <tr key={entry.id}>
                        <td>{(page - 1) * perPage + index + 1}.</td>
                        <td className="px-4 text-secondary py-3">
                          <div>{new Date(entry.created_at).toLocaleDateString()}</div>

                          {/* To display in 12 hours format if it has exceeded one day otherwise human readable format like 1 minutes ago, 2 hours ago*/}
                          <div className="small text-muted">
                            {new Date() - new Date(entry.created_at) > 86400000 
                              ? new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
                              : formatTimeAgo(entry.created_at)}
                          </div>
                        </td>
                        <td>
                          <div className="fw-semibold">{entry.product?.name}</div>
                          <div className="text-muted smaller">{entry.product?.sku}</div>
                        </td>
                        <td>
                          <div className="badge bg-light text-dark fw-normal border">{entry.warehouse?.name}</div>
                        </td>
                        <td>
                          <span className={`badge ${entry.type === 'addition' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} px-2 py-1`}>
                            {entry.type === 'addition' ? <FiArrowUp className="me-1" /> : <FiArrowDown className="me-1" />}
                            {entry.type === 'addition' ? 'Stock In' : 'Stock Out'}
                          </span>
                        </td>
                        <td className="text-end fw-bold">
                          {entry.type === 'addition' ? '+' : '-'} {parseInt(entry.quantity)} {entry.unit?.name}
                        </td>
                        <td className="px-4 text-secondary small">
                          {entry.note || <span className="text-light">-</span>}
                          {entry.vendor && <div className="text-primary smaller mt-1">Source: {entry.vendor.name}</div>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {pagination && pagination.total > 0 && (
              <div className="d-flex justify-content-between align-items-center px-4 py-3 bg-light border-top">
                <div className="text-secondary small">
                  Showing {pagination.from} to {pagination.to} of {pagination.total} entries
                </div>
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-white btn-sm border" 
                    disabled={page === 1}
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  >
                    Previous
                  </button>
                  {[...Array(pagination.last_page)].map((_, i) => (
                    <button
                      key={i + 1}
                      className={`btn btn-sm ${page === i + 1 ? 'btn-primary' : 'btn-white border'}`}
                      style={{width: '32px'}}
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  )).filter((_, i) => {
                    // Show current page, first, last, and 2 around current
                    const p = i + 1;
                    return p === 1 || p === pagination.last_page || Math.abs(p - page) <= 2;
                  }).reduce((acc, curr, i, arr) => {
                    // Add ellipsis
                    if (i > 0 && curr.key - arr[i-1].key > 1) {
                      acc.push(<span key={`ellipsis-${i}`} className="text-muted px-1">...</span>);
                    }
                    acc.push(curr);
                    return acc;
                  }, [])}
                  <button 
                    className="btn btn-white btn-sm border" 
                    disabled={page === pagination.last_page}
                    onClick={() => setPage(prev => Math.min(pagination.last_page, prev + 1))}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
