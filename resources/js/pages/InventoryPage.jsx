import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useForm } from 'react-hook-form';
import DashboardLayout from '../layouts/DashboardLayout';
import Swal from 'sweetalert2';
import { FiPlus, FiArrowDown, FiArrowUp, FiRefreshCw, FiGrid, FiList, FiX } from 'react-icons/fi';

export default function InventoryPage() {
  const [stockLevels, setStockLevels] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [units, setUnits] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [stockSearch, setStockSearch] = useState('');
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [debouncedStockSearch, setDebouncedStockSearch] = useState('');
  const [debouncedLedgerSearch, setDebouncedLedgerSearch] = useState('');
  const [showRelocateModal, setShowRelocateModal] = useState(false);
  const [selectedItemForRelocate, setSelectedItemForRelocate] = useState(null);
  const [isAddingVendorInline, setIsAddingVendorInline] = useState(false);
  const [showAllDetails, setShowAllDetails] = useState(false);

  const { register: registerVendor, handleSubmit: handleVendorSubmit, reset: resetVendor, formState: { errors: vendorErrors } } = useForm({
    defaultValues: {
      vendor_group: 'Supplier',
      vendor_category: 'Local'
    }
  });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedStockSearch(stockSearch), 500);
    return () => clearTimeout(timer);
  }, [stockSearch]);

  useEffect(() => {
    fetchStockLevels();
  }, [debouncedStockSearch]);

  useEffect(() => {
    console.log('showModal changed:', showModal);
  }, [showModal]);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();

  const watchProductId = watch('product_id');

  useEffect(() => {
    if (watchProductId) {
      const selectedProduct = products.find(p => p.id === parseInt(watchProductId));
      if (selectedProduct && selectedProduct.base_unit_id) {
        setValue('unit_id', String(selectedProduct.base_unit_id));
      }
    }
  }, [watchProductId, products, setValue]);

  useEffect(() => {
    fetchInitialData();
    fetchVendors();
  }, []);

  const fetchStockLevels = async () => {
    try {
      const response = await api.get('/api/inventory', {
        params: { search: debouncedStockSearch }
      });
      setStockLevels(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLedger = async () => {
    try {
      const response = await api.get('/api/inventory/ledger', {
        params: { per_page: 5 }
      });
      setLedger(response.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };
  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [stockRes, ledgerRes, prodRes, whRes, unitRes] = await Promise.all([
        api.get('/api/inventory', { params: { search: debouncedStockSearch } }),
        api.get('/api/inventory/ledger', { params: { per_page: 5 } }),
        api.get('/api/products'),
        api.get('/api/warehouses'),
        api.get('/api/units')
      ]);
      setStockLevels(Array.isArray(stockRes.data) ? stockRes.data : []);
      setLedger(ledgerRes.data?.data || (Array.isArray(ledgerRes.data) ? ledgerRes.data : []));
      setProducts(prodRes.data?.data || (Array.isArray(prodRes.data) ? prodRes.data : []));
      setWarehouses(Array.isArray(whRes.data) ? whRes.data : []);
      setUnits(Array.isArray(unitRes.data) ? unitRes.data : []);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      Swal.fire('Error', 'Failed to load inventory data. Please check console.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await api.get('/api/vendors');
      setVendors(response.data.filter(v => v.is_active));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdjustStock = async (data) => {
    try {
      await api.post('/api/inventory/adjust', data);
      Swal.fire({
        icon: 'success',
        title: 'Adjusted!',
        text: 'Stock has been updated successfully.',
        timer: 2000,
        showConfirmButton: false
      });
      setShowModal(false);
      reset();
      fetchInitialData();
    } catch (error) {
      console.error('Error adjusting stock:', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: error.response?.data?.message || 'Could not adjust stock.'
      });
    }
  };
  const handleRelocateStock = async (data) => {
    try {
      await api.post('/api/inventory/relocate', {
        ...data,
        product_id: selectedItemForRelocate.id,
        warehouse_id: warehouses[0]?.id // Assuming first warehouse for simplicity as per current design
      });
      Swal.fire({
        icon: 'success',
        title: 'Relocated!',
        text: 'Stock has been moved successfully.',
        timer: 2000,
        showConfirmButton: false
      });
      setShowRelocateModal(false);
      reset();
      fetchStockLevels();
    } catch (error) {
      console.error('Error relocating stock:', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: error.response?.data?.message || 'Could not relocate stock.'
      });
    }
  };

  const handleQuickVendorSubmit = async (data) => {
    try {
      const response = await api.post('/api/vendors', data);
      Swal.fire({
        icon: 'success',
        title: 'Created!',
        text: 'New vendor added.',
        timer: 1500,
        showConfirmButton: false
      });
      setIsAddingVendorInline(false);
      setShowAllDetails(false);
      resetVendor();

      // Reload vendors list
      const res = await api.get('/api/vendors');
      const activeVendors = res.data.filter(v => v.is_active);
      setVendors(activeVendors);

      // Auto select the new vendor in the dropdown
      if (response.data && response.data.id) {
        setValue('vendor_id', String(response.data.id));
      }
    } catch (error) {
      console.error('Error creating vendor:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to save vendor'
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="container-fluid py-3 px-md-4">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <h4 className="fw-bold mb-0">Inventory Control</h4>
            <p className="text-secondary small mb-0">Real-time stock monitoring & manual movements</p>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-primary btn-sm px-3 fw-bold d-flex align-items-center gap-2"
              onClick={() => setShowActivityModal(true)}
            >
              <FiList /> Recent Movements
            </button>
            <button
              className="btn btn-primary d-flex align-items-center gap-2 px-3 btn-sm fw-semibold"
              onClick={() => setShowModal(true)}
            >
              <FiPlus /> New Adjustment
            </button>
          </div>
        </div>

        <div className="row g-4">
          {/* Stock Levels Summary */}
          <div className="col-lg-9">
            <div className="card premium-card border-0 rounded-3">
              <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
                <div className="d-flex align-items-center justify-content-between w-100">
                  <div className="d-flex align-items-center gap-2">
                    <FiGrid className="text-secondary" />
                    <h6 className="mb-0 fw-bold">Stock Balances</h6>
                  </div>
                  <div className="input-group input-group-sm" style={{ width: '200px' }}>
                    <input
                      type="text"
                      className="form-control form-control-sm border-end-0 shadow-none"
                      placeholder="Filter stocks..."
                      value={stockSearch}
                      onChange={(e) => setStockSearch(e.target.value)}
                    />
                    <span className="input-group-text bg-white border-start-0 text-secondary"><FiList style={{ fontSize: '0.7rem' }} /></span>
                  </div>
                </div>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0 small">
                    <thead>
                      <tr>
                        <th className="px-4">Product Details</th>
                        <th>Category</th>
                        <th>Available Stock</th>
                        <th className="px-4 text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* If there are no stock levels, i.e. stockLevels.length == 0 */}
                      {stockLevels.length == 0 && (
                        <tr>
                          <td colSpan="4" className="text-center py-3 text-secondary">No stock data found. Click the <strong>"+ New Adjustment"</strong> button to add stock.</td>
                        </tr>
                      )}

                      {stockLevels.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4">
                            <div className="fw-semibold text-dark">{item.name}</div>
                            <div className="text-muted d-flex align-items-center gap-2" style={{ fontSize: '0.75rem' }}>
                              <code>{item.sku}</code>
                              {item.locations?.length > 0 && (
                                <span className="text-dark opacity-75">
                                  <strong>Location:</strong> {item.locations.map(loc => `${loc.rack}/${loc.slot}`).join(', ')}
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className="text-secondary">
                              {item.category}
                            </span>
                          </td>
                          <td>
                            <span className={`fw-semibold ${item.stock > 0 ? 'text-success' : 'text-danger'}`}>
                              {item.stock} {item.unit}
                            </span>
                          </td>
                          <div className="d-flex align-items-center justify-content-end gap-3">
                            <button
                              onClick={() => { setSelectedItemForRelocate(item); setShowRelocateModal(true); }}
                              className="btn btn-link btn-sm text-decoration-none p-0 fw-semibold text-primary"
                              style={{ fontSize: '0.75rem' }}
                            >
                              Relocate
                            </button>
                            <Link
                              to={`/inventory/ledger?search=${encodeURIComponent(item.sku)}`}
                              className="btn btn-link btn-sm text-decoration-none p-0 fw-semibold"
                              style={{ fontSize: '0.75rem' }}
                            >
                              View Ledger
                            </Link>
                          </div>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3">
            <div className="card border-0 rounded-3 p-4 bg-dark text-white shadow-sm">
              <h6 className="fw-bold mb-3 small text-uppercase opacity-50">Quick Summary</h6>
              <div className="d-flex flex-column gap-2">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="small opacity-75">SKUs Listed</span>
                  <span className="fw-bold">{stockLevels.length}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="small opacity-75">Low Stock</span>
                  <span className="fw-bold text-warning">{stockLevels.filter(i => i.stock < 10).length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Adjustment Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 9999 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-3 shadow-lg">
              <div className="modal-header border-bottom bg-light px-4 py-3">
                <h6 className="modal-title fw-bold m-0">Manual Stock Adjustment</h6>
                <button type="button" className="btn-close shadow-none" style={{ fontSize: '0.8rem' }} onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={handleSubmit(handleAdjustStock)}>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-secondary">Product</label>
                    <select
                      className={`form-select ${errors.product_id ? 'is-invalid' : ''}`}
                      {...register('product_id', { required: true })}
                    >
                      <option value="">Select Product</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-secondary">Warehouse</label>
                    <select
                      className={`form-select ${errors.warehouse_id ? 'is-invalid' : ''}`}
                      {...register('warehouse_id', { required: true })}
                    >
                      <option value="">Select Warehouse</option>
                      {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary">Rack Number (Optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. R-01"
                        {...register('rack_number')}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary">Slot Number (Optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. S-05"
                        {...register('slot_number')}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary">Quantity</label>
                      <div className="input-group">
                        <input
                          type="number" step="0.0001"
                          className={`form-control ${errors.quantity ? 'is-invalid' : ''}`}
                          {...register('quantity', { required: true, min: 1 })}
                          placeholder="0"
                        />
                        <span className="input-group-text bg-light text-secondary small fw-semibold">
                          {(() => {
                            const prod = products.find(p => p.id === parseInt(watchProductId));
                            if (!prod) return 'Unit';
                            return units.find(u => u.id === prod.base_unit_id)?.name || 'Unit';
                          })()}
                        </span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary">Adjustment Type</label>
                      <div className="d-flex gap-3 mt-1">
                        <div className="form-check">
                          <input className="form-check-input" type="radio" value="addition" {...register('type', { required: true })} defaultChecked />
                          <label className="form-check-label small">Addition</label>
                        </div>
                        <div className="form-check">
                          <input className="form-check-input" type="radio" value="subtraction" {...register('type', { required: true })} />
                          <label className="form-check-label small">Subtraction</label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-secondary">Supplier / Vendor (Optional)</label>
                    <div className="input-group mb-2">
                      <select className="form-select form-select-sm" {...register('vendor_id')} disabled={isAddingVendorInline}>
                        <option value="">Select Vendor</option>
                        {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                      </select>
                      <button
                        type="button"
                        className={`btn btn-sm d-flex align-items-center ${isAddingVendorInline ? 'btn-secondary' : 'btn-outline-primary'}`}
                        onClick={() => {
                          const nextVal = !isAddingVendorInline;
                          setIsAddingVendorInline(nextVal);
                          if (!nextVal) {
                            resetVendor();
                            setShowAllDetails(false);
                          }
                        }}
                        title={isAddingVendorInline ? "Cancel Quick Add" : "Quick Add Vendor"}
                      >
                        {isAddingVendorInline ? <FiX /> : <FiPlus />}
                      </button>
                    </div>

                    {isAddingVendorInline && (
                      <div className="card border-primary border-opacity-25 bg-light-subtle p-3 rounded-3 mb-2 shadow-sm">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="small fw-bold text-primary">New Vendor Details</span>
                        </div>

                        <div className="mb-2">
                          <label className="form-label small fw-bold text-secondary mb-1">Vendor Name *</label>
                          <input
                            type="text"
                            className={`form-control form-control-sm ${vendorErrors.name ? 'is-invalid' : ''}`}
                            placeholder="Vendor Name"
                            {...registerVendor('name', { required: true })}
                          />
                        </div>

                        <div className="row g-2 mb-2">
                          <div className="col-6">
                            <label className="form-label small fw-bold text-secondary mb-1">Phone</label>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Phone"
                              {...registerVendor('phone')}
                            />
                          </div>
                          <div className="col-6">
                            <label className="form-label small fw-bold text-secondary mb-1">Email</label>
                            <input
                              type="email"
                              className="form-control form-control-sm"
                              placeholder="Email"
                              {...registerVendor('email')}
                            />
                          </div>
                        </div>

                        {showAllDetails ? (
                          <>
                            <div className="row g-2 mb-2">
                              <div className="col-6">
                                <label className="form-label small fw-bold text-secondary mb-1">Group</label>
                                <select className="form-select form-select-sm" {...registerVendor('vendor_group', { required: true })}>
                                  <option value="Supplier">Supplier</option>
                                  <option value="Manufacturer">Manufacturer</option>
                                  <option value="Distributor">Distributor</option>
                                </select>
                              </div>
                              <div className="col-6">
                                <label className="form-label small fw-bold text-secondary mb-1">Category</label>
                                <select className="form-select form-select-sm" {...registerVendor('vendor_category', { required: true })}>
                                  <option value="Local">Local</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Global">Global</option>
                                  <option value="Small">Small</option>
                                  <option value="Large">Large</option>
                                  <option value="Specialty">Specialty</option>
                                </select>
                              </div>
                            </div>

                            <div className="mb-2">
                              <label className="form-label small fw-bold text-secondary mb-1">Full Address</label>
                              <textarea
                                className="form-control form-control-sm"
                                rows={2}
                                placeholder="Address"
                                {...registerVendor('address')}
                              />
                            </div>

                            <div className="mb-2">
                              <label className="form-label small fw-bold text-secondary mb-1">Landmark / Street</label>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Landmark"
                                {...registerVendor('landmark')}
                              />
                            </div>
                          </>
                        ) : null}

                        <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                          <button
                            type="button"
                            className="btn btn-link btn-sm text-decoration-none p-0 fw-semibold text-secondary"
                            onClick={() => setShowAllDetails(!showAllDetails)}
                            style={{ fontSize: '0.75rem' }}
                          >
                            {showAllDetails ? '[-] Hide Details' : '[+] More Details'}
                          </button>

                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm py-1 px-2 fw-bold"
                              style={{ fontSize: '0.75rem' }}
                              onClick={() => {
                                setIsAddingVendorInline(false);
                                resetVendor();
                                setShowAllDetails(false);
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm py-1 px-2 fw-bold"
                              style={{ fontSize: '0.75rem' }}
                              onClick={handleVendorSubmit(handleQuickVendorSubmit)}
                            >
                              Save Vendor
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-bold text-secondary">Note</label>
                    <textarea className="form-control" rows="2" {...register('note')}></textarea>
                  </div>

                  <div className="mt-4 text-center">
                    <button type="submit" className="btn btn-primary py-2 fw-bold rounded-pill">
                      Apply Adjustment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Activity Summary Modal */}
      {showActivityModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 9999 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 rounded-3 shadow-lg">
              <div className="modal-header border-bottom bg-light px-4 py-3">
                <div className="d-flex align-items-center gap-2">
                  <FiList className="text-primary" />
                  <h6 className="modal-title fw-bold m-0">Recent Stock Movements</h6>
                </div>
                <button type="button" className="btn-close shadow-none" onClick={() => setShowActivityModal(false)}></button>
              </div>
              <div className="modal-body p-0">
                <div className="table-responsive">
                  <table className="table align-middle mb-0 small">
                    <thead className="bg-light">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th>Item</th>
                        <th>Type</th>
                        <th className="text-end">Qty</th>
                        <th>Rack/Slot</th>
                        <th className="px-4">Warehouse</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledger.length > 0 ? ledger.map((entry) => (
                        <tr key={entry.id}>
                          <td className="px-4 text-secondary" style={{ fontSize: '0.75rem' }}>
                            {new Date(entry.created_at).toLocaleDateString()}
                          </td>
                          <td className="fw-semibold py-3">{entry.product?.name}</td>
                          <td>
                            <span className={entry.type === 'addition' ? 'text-success' : 'text-danger'}>
                              {entry.type === 'addition' ? 'In' : 'Out'}
                            </span>
                          </td>
                          <td className={`text-end fw-bold ${entry.type === 'addition' ? 'text-success' : 'text-danger'}`}>
                            {entry.type === 'addition' ? '+' : '-'}{parseInt(entry.quantity)}
                          </td>
                          <td className="text-secondary small">
                            {entry.rack_number || '-'}/{entry.slot_number || '-'}
                          </td>
                          <td className="px-4 text-secondary">{entry.warehouse?.name}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="5" className="text-center py-5 text-secondary">No recent movements found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer border-top bg-light p-3">
                <Link to="/inventory/ledger" className="btn btn-primary btn-sm px-4 fw-bold">
                  View Full Activity History <FiList className="ms-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Relocate Stock Modal */}
      {showRelocateModal && selectedItemForRelocate && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 9999 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-3 shadow-lg">
              <div className="modal-header border-bottom bg-light px-4 py-3">
                <div className="d-flex align-items-center gap-2">
                  <FiRefreshCw className="text-primary" />
                  <h6 className="modal-title fw-bold m-0">Relocate Stock: {selectedItemForRelocate.name}</h6>
                </div>
                <button type="button" className="btn-close shadow-none" onClick={() => setShowRelocateModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={handleSubmit(handleRelocateStock)}>
                  <div className="bg-light p-3 rounded-2 mb-4">
                    <p className="small fw-bold text-secondary text-uppercase mb-2">Available in Locations:</p>
                    {selectedItemForRelocate.locations?.map((loc, idx) => (
                      <div key={idx} className="small d-flex justify-content-between mb-1">
                        <span>Rack: {loc.rack}, Slot: {loc.slot}</span>
                        <span className="fw-bold">{loc.stock} {selectedItemForRelocate.unit}</span>
                      </div>
                    ))}
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary">Source Rack</label>
                      <input type="text" className="form-control" placeholder="Rack" {...register('from_rack')} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary">Source Slot</label>
                      <input type="text" className="form-control" placeholder="Slot" {...register('from_slot')} />
                    </div>

                    <div className="col-12 py-1 text-center">
                      <div className="badge bg-primary rounded-pill"><FiArrowDown /> Move To <FiArrowDown /></div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary">Target Rack</label>
                      <input type="text" className="form-control" placeholder="Rack" {...register('to_rack', { required: true })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary">Target Slot</label>
                      <input type="text" className="form-control" placeholder="Slot" {...register('to_slot')} />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-bold text-secondary">Quantity to Relocate</label>
                      <div className="input-group">
                        <input type="number" step="0.0001" className="form-control" {...register('quantity', { required: true, min: 0.0001 })} />
                        <span className="input-group-text bg-light small fw-semibold">{selectedItemForRelocate.unit}</span>
                      </div>
                    </div>
                  </div>

                  <div className="d-grid mt-4">
                    <button type="submit" className="btn btn-primary py-2 fw-bold rounded-pill">Confirm Relocation</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}


      <style>{`
        .premium-card {
          transition: all 0.3s ease;
        }
        .table-hover tbody tr:hover {
          background-color: #f8f9fa;
        }
      `}</style>
    </DashboardLayout>
  );
}
