import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import { FiPlus, FiTrash2, FiSave, FiX, FiRefreshCw, FiUserPlus } from 'react-icons/fi';
import Swal from 'sweetalert2';
import Select from 'react-select';

export default function QuotationEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [products, setProducts] = useState([]);
  const [units, setUnits] = useState([]);

  // Modal State
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showDealerModal, setShowDealerModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    is_active: true
  });
  const [newDealer, setNewDealer] = useState({
    name: '',
    company_name: '',
    email: '',
    phone: '',
    address: '',
    is_active: true
  });
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [savingDealer, setSavingDealer] = useState(false);

  const [formData, setFormData] = useState({
    contact_id: '',
    contact_type: 'App\\Models\\Customer',
    valid_until: '',
    notes: '',
    items: [],
    subtotal: 0,
    discount_total: 0,
    tax_total: 0,
    grand_total: 0
  });

  useEffect(() => {
    fetchData();
  }, [id, navigate]);

  const fetchData = async () => {
    try {
      const [custRes, dealerRes, prodRes, unitRes, quoRes] = await Promise.all([
        api.get('/api/customers'),
        api.get('/api/dealers'),
        api.get('/api/products'),
        api.get('/api/units'),
        api.get(`/api/quotations/${id}`)
      ]);

      setCustomers(custRes.data.data || custRes.data);
      setDealers(dealerRes.data.data || dealerRes.data);
      setProducts(prodRes.data.data || prodRes.data);
      setUnits(unitRes.data.data || unitRes.data);

      const quo = quoRes.data;
      setFormData({
        contact_id: quo.contact_id,
        contact_type: quo.contact_type,
        valid_until: quo.valid_until ? quo.valid_until.split('T')[0] : '',
        notes: quo.notes || '',
        items: quo.items.map(item => ({
          id: item.id,
          product_id: item.product_id,
          unit_id: item.unit_id,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          discount: Number(item.discount),
          tax: Number(item.tax) || 0,
          total_price: Number(item.total_price)
        })),
        subtotal: Number(quo.subtotal),
        discount_total: Number(quo.discount_total),
        tax_total: Number(quo.tax_total),
        grand_total: Number(quo.grand_total)
      });
    } catch (err) {
      console.error('Error fetching data:', err);
      Swal.fire('Error', 'Could not load quotation data', 'error');
      navigate('/quotations');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (!fetching) calculateTotals();
  }, [formData.items]);

  const calculateTotals = () => {
    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;

    formData.items.forEach(item => {
      const lineTotal = item.quantity * item.unit_price;
      const lineTax = (lineTotal - item.discount) * (item.tax / 100);
      subtotal += lineTotal;
      discountTotal += Number(item.discount || 0);
      taxTotal += lineTax;
    });

    setFormData(prev => ({
      ...prev,
      subtotal,
      discount_total: discountTotal,
      tax_total: taxTotal,
      grand_total: subtotal - discountTotal + taxTotal
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;

    if (field === 'product_id') {
      const product = products.find(p => p.id === parseInt(value));
      if (product) {
        newItems[index].unit_id = product.base_unit_id;
        newItems[index].unit_price = product.sale_price;
      }
    }

    const lineTotal = newItems[index].quantity * newItems[index].unit_price;
    newItems[index].total_price = lineTotal - (newItems[index].discount || 0);

    setFormData({ ...formData, items: newItems });
  };

  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product_id: '', unit_id: '', quantity: 1, unit_price: 0, discount: 0, tax: 0, total_price: 0 }]
    });
  };

  const removeItemRow = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  const productOptions = products.map(p => ({
    value: p.id,
    label: `${p.name} (${p.sku})`
  }));

  const handleQuickCustomerSubmit = async (e) => {
    e.preventDefault();
    setSavingCustomer(true);
    try {
      const response = await api.post('/api/customers', newCustomer);
      Swal.fire('Success', 'Customer created successfully', 'success');

      const custRes = await api.get('/api/customers');
      setCustomers(custRes.data.data || custRes.data);

      setFormData({
        ...formData,
        contact_type: 'App\\Models\\Customer',
        contact_id: response.data.id
      });

      setShowCustomerModal(false);
      setNewCustomer({ name: '', email: '', phone: '', address: '', is_active: true });
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Could not create customer', 'error');
    } finally {
      setSavingCustomer(false);
    }
  };

  const handleQuickDealerSubmit = async (e) => {
    e.preventDefault();
    setSavingDealer(true);
    try {
      const response = await api.post('/api/dealers', newDealer);
      Swal.fire('Success', 'Dealer created successfully', 'success');

      const dealerRes = await api.get('/api/dealers');
      const updatedDealers = dealerRes.data.data || dealerRes.data;
      setDealers(updatedDealers);

      setFormData({
        ...formData,
        contact_type: "App\Models\Dealer",
        contact_id: response.data.id
      });

      setShowDealerModal(false);
      setNewDealer({ name: '', company_name: '', email: '', phone: '', address: '', is_active: true });
    }
    catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Could not create dealer', 'error');
    } finally {
      setSavingDealer(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/api/quotations/${id}`, formData);
      Swal.fire('Success', 'Quotation updated successfully', 'success');
      navigate(`/quotations/${id}`);
    } catch (err) {
      console.error('Error updating quotation:', err);
      Swal.fire('Error', err.response?.data?.message || 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Custom styles for react-select
  const selectStyles = {
    control: (base) => ({
      ...base,
      background: '#f8f9fa',
      border: 'none',
      boxShadow: 'none',
      padding: '2px 0'
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999
    })
  };

  if (fetching) return (
    <DashboardLayout>
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary"></div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="container-fluid py-3 px-md-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold mb-0 text-dark">Edit Quotation #{id}</h4>
          <button onClick={() => navigate(`/quotations/${id}`)} className="btn btn-outline-secondary btn-sm px-3 shadow-none">
            <FiX className="me-1" /> Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm rounded-3 mb-4">
                <div className="card-body p-4">
                  <h6 className="fw-bold text-uppercase mb-4 text-primary ls-wide" style={{ fontSize: '0.75rem' }}>Header Information</h6>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label small fw-bold text-secondary">Contact Type</label>
                      <select
                        className="form-select shadow-none"
                        value={formData.contact_type}
                        onChange={(e) => setFormData({ ...formData, contact_type: e.target.value, contact_id: '' })}
                      >
                        <option value="App\Models\Customer">Customer (Individual)</option>
                        <option value="App\Models\Dealer">Dealer (Business)</option>
                      </select>
                    </div>
                    <div className="col-md-8">
                      <div className="d-flex justify-content-between align-items-end mb-2">
                        <label className="form-label small fw-bold text-secondary mb-0">Select {formData.contact_type.includes('Customer') ? 'Customer' : 'Dealer'}</label>
                        <button
                          type="button"
                          className="btn btn-link btn-sm p-0 m-0 text-decoration-none d-flex align-items-center gap-1 fw-bold text-primary"
                          onClick={() => formData.contact_type.includes('Customer') ? setShowCustomerModal(true) : setShowDealerModal(true)}
                        >
                          <FiUserPlus fontSize="0.9rem" /> Quick Add
                        </button>
                      </div>
                      <select
                        className="form-select shadow-none"
                        value={formData.contact_id}
                        onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
                        required
                      >
                        <option value="">-- Select --</option>
                        {(formData.contact_type.includes('Customer') ? customers : dealers).map(c => (
                          <option key={c.id} value={c.id}>{c.name} {c.company_name ? `(${c.company_name})` : ''}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold text-secondary">Valid Until</label>
                      <input
                        type="date"
                        className="form-control shadow-none"
                        value={formData.valid_until}
                        onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card border-0 shadow-sm rounded-3">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h6 className="fw-bold text-uppercase mb-0 text-primary ls-wide" style={{ fontSize: '0.75rem' }}>Quotation Items</h6>
                    <button type="button" onClick={addItemRow} className="btn btn-outline-primary btn-sm rounded-pill px-3 shadow-none fw-semibold">
                      <FiPlus className="me-1" /> Add Row
                    </button>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-borderless align-middle">
                      <thead>
                        <tr className="text-secondary small fw-bold border-bottom">
                          <th style={{ minWidth: '200px' }}>Product</th>
                          <th style={{ width: '100px' }}>Quantity</th>
                          <th style={{ width: '120px' }}>Unit Price (₹)</th>
                          <th style={{ width: '100px' }}>Discount (₹)</th>
                          <th className="text-end">Total (₹)</th>
                          <th style={{ width: '50px' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.items.map((item, index) => (
                          <tr key={index} className="border-bottom-custom">
                            <td className="py-2">
                              <Select
                                options={productOptions}
                                value={productOptions.find(opt => opt.value === parseInt(item.product_id))}
                                onChange={(opt) => handleItemChange(index, 'product_id', opt.value)}
                                styles={selectStyles}
                                placeholder="Search Product..."
                                isSearchable
                                menuPortalTarget={document.body}
                                menuPlacement="auto"
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-sm shadow-none bg-light border-0"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                min="0.0001"
                                step="any"
                                required
                              />
                            </td>
                            <td>
                              <div className="small">
                                {/* input-group input-group-sm <span className="input-group-text bg-light border-0">₹</span> */}
                                <input
                                  type="number"
                                  className="form-control form-control-sm shadow-none bg-light border-0"
                                  value={item.unit_price}
                                  onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                                  step="any"
                                  readOnly
                                />
                              </div>
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-sm shadow-none bg-light border-0"
                                value={item.discount}
                                onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                                step="any"
                              />
                            </td>
                            <td className="text-end fw-bold text-dark small">
                              {(item.quantity * item.unit_price - (item.discount || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td>
                              <button type="button" onClick={() => removeItemRow(index)} className="btn btn-link text-danger p-0 shadow-none">
                                <FiTrash2 />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card border-0 shadow-sm rounded-3 mb-4 bg-light">
                <div className="card-body p-4">
                  <h6 className="fw-bold text-uppercase mb-4 text-dark ls-wide" style={{ fontSize: '0.75rem' }}>Summary</h6>
                  <div className="d-flex justify-content-between mb-3 text-secondary small">
                    <span>Subtotal</span>
                    <span className="fw-bold text-dark">₹{formData.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3 text-secondary small">
                    <span>Total Discount</span>
                    <span className="fw-bold text-danger">- ₹{formData.discount_total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-4 border-bottom pb-2">
                    <span className="text-secondary small">Taxes (Estimated)</span>
                    <span className="fw-bold text-dark">₹{formData.tax_total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="h5 fw-bold text-dark mb-0">Grand Total</span>
                    <span className="h4 fw-bold text-primary mb-0">₹{formData.grand_total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <div className="card border-0 shadow-sm rounded-3 mb-4">
                <div className="card-body p-4">
                  <label className="form-label small fw-bold text-secondary">Internal Notes / Terms</label>
                  <textarea
                    className="form-control shadow-none"
                    rows="4"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  ></textarea>
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-100 py-3 fw-bold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2" disabled={loading}>
                {loading ? <div className="spinner-border spinner-border-sm"></div> : <FiSave />}
                {loading ? 'Updating...' : 'Update Quotation'}
              </button>
            </div>
          </div>
        </form>

        {/* Quick Customer Modal */}
        {showCustomerModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">Quick Customer Registration</h5>
                  <button type="button" className="btn-close shadow-none" onClick={() => setShowCustomerModal(false)}></button>
                </div>
                <form onSubmit={handleQuickCustomerSubmit}>
                  <div className="modal-body p-4">
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Customer Name</label>
                      <input
                        type="text"
                        className="form-control shadow-none"
                        value={newCustomer.name}
                        onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Phone Number</label>
                      <input
                        type="text"
                        className="form-control shadow-none"
                        value={newCustomer.phone}
                        onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Email (Optional)</label>
                      <input
                        type="email"
                        className="form-control shadow-none"
                        value={newCustomer.email}
                        onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                      />
                    </div>
                    <div className="mb-0">
                      <label className="form-label small fw-bold text-secondary">Address</label>
                      <textarea
                        className="form-control shadow-none"
                        rows="2"
                        value={newCustomer.address}
                        onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                  <div className="modal-footer border-0 pt-0">
                    <button type="button" className="btn btn-light btn-sm fw-bold px-3" onClick={() => setShowCustomerModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary btn-sm fw-bold px-4" disabled={savingCustomer}>
                      {savingCustomer ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                      Register & Select
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Quick Dealer Modal */}
        {showDealerModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">Quick Dealear Registration</h5>
                  <button type="button" className="btn-close shadow-none" onClick={() => setShowDealerModal(false)}></button>
                </div>
                <form onSubmit={handleQuickDealerSubmit}>
                  <div className="modal-body p-4">
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Dealer Name</label>
                      <input
                        type="text"
                        className="form-control shadow-none"
                        value={newDealer.name}
                        onChange={(e) => setNewDealer({ ...newDealer, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className='form-label small fw-bold text-secondary'>Company Name</label>
                      <input type="text"
                        className="form-control shadow-none"
                        value={newDealer.company_name}
                        onChange={(e) => setNewDealer({ ...newDealer, company_name: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Phone Number</label>
                      <input
                        type="text"
                        className="form-control shadow-none"
                        value={newDealer.phone}
                        onChange={(e) => setNewDealer({ ...newDealer, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Email (Optional)</label>
                      <input
                        type="email"
                        className="form-control shadow-none"
                        value={newDealer.email}
                        onChange={(e) => setNewDealer({ ...newDealer, email: e.target.value })}
                      />
                    </div>
                    <div className="mb-0">
                      <label className="form-label small fw-bold text-secondary">Address</label>
                      <textarea
                        className="form-control shadow-none"
                        rows="2"
                        value={newDealer.address}
                        onChange={(e) => setNewDealer({ ...newDealer, address: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                  <div className="modal-footer border-0 pt-0">
                    <button type="button" className="btn btn-light btn-sm fw-bold px-3" onClick={() => setShowDealerModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary btn-sm fw-bold px-4" disabled={savingDealer}>
                      {savingDealer ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                      Register & Select
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .border-bottom-custom {
            border-bottom: 1px dashed #e9ecef;
        }
        .border-bottom-custom:last-child {
            border-bottom: none;
        }
        .ls-wide {
            letter-spacing: 0.05em;
        }
        .modal.show {
            display: block;
            z-index: 1055;
        }
      `}</style>
    </DashboardLayout>
  );
}

