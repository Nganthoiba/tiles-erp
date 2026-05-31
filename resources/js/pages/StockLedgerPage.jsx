import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../layouts/DashboardLayout';
import { FiList, FiArrowDown, FiArrowUp, FiRefreshCw } from 'react-icons/fi';

export default function StockLedgerPage() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchLedger();
  }, [debouncedSearch]);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/inventory/ledger', {
        params: { search: debouncedSearch }
      });
      setLedger(response.data?.data || (Array.isArray(response.data) ? response.data : []));
    } catch (err) {
      console.error('Error fetching ledger:', err);
    } finally {
      setLoading(false);
    }
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
          </div>
        </div>

        <div className="card premium-card border-0 rounded-3 shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 small">
                <thead className="bg-light">
                  <tr>
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
                      <td colSpan="6" className="text-center py-5">
                        <div className="spinner-border text-primary spinner-border-sm" role="status"></div>
                      </td>
                    </tr>
                  ) : ledger.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-secondary">No activities found matching your search.</td>
                    </tr>
                  ) : (
                    ledger.map((entry) => (
                      <tr key={entry.id}>
                        <td className="px-4 text-secondary py-3">
                          {new Date(entry.created_at).toLocaleString()}
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
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
