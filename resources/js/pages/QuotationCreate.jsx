import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../layouts/DashboardLayout';
import { FiPlus, FiTrash2, FiSave, FiX, FiUserPlus } from 'react-icons/fi';
import Swal from 'sweetalert2';
import Select from 'react-select';

export default function QuotationCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [products, setProducts] = useState([]);
  const [units, setUnits] = useState([]);

  // Modal State
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    is_active: true
  });
  const [savingCustomer, setSavingCustomer] = useState(false);

  const [formData, setFormData] = useState({
    contact_id: '',
    contact_type: 'App\\Models\\Customer',
    valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    items: [
      { product_id: '', unit_id: '', quantity: 1, unit_price: 0, discount: 0, tax: 0, total_price: 0 }
    ],
    subtotal: 0,
    discount_total: 0,
    tax_total: 0,
    grand_total: 0
  });

  useEffect(() => {
    fetchBaseData();
  }, []);

  const fetchBaseData = async () => {
    try {
      const [custRes, dealerRes, prodRes, unitRes] = await Promise.all([
        axios.get('/api/customers'),
        axios.get('/api/dealers'),
        axios.get('/api/products'),
        axios.get('/api/units')
      ]);
      setCustomers(custRes.data.data || custRes.data);
      setDealers(dealerRes.data.data || dealerRes.data);
      setProducts(prodRes.data.data || prodRes.data);
      setUnits(unitRes.data.data || unitRes.data);
    } catch (err) {
      console.error('Error fetching form data:', err);
    }
  };

  useEffect(() => {
    calculateTotals();
  }, [formData.items]);

  const calculateTotals = () => {
    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;

    formData.items.forEach(item => {
      const lineTotal = item.quantity * item.unit_price;
      const lineTax = (lineTotal - item.discount) * (item.tax / 100);
      subtotal += lineTotal;
      discountTotal += Number(item.discount);
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

    // Recalculate line total
    const lineTotal = newItems[index].quantity * newItems[index].unit_price;
    newItems[index].total_price = lineTotal - (newItems[index].discount || 0);

    setFormData({ ...formData, items: newItems });
  };

  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items, 
        { 
          product_id: '', 
          unit_id: '', 
          quantity: 1, 
          unit_price: 0, 
          discount: 0, 
          tax: 0, 
          total_price: 0 
        }
      ]
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
      const response = await axios.post('/api/customers', newCustomer);
      Swal.fire('Success', 'Customer created successfully', 'success');
      
      // Refresh customers list and auto-select the new one
      const custRes = await axios.get('/api/customers');
      const updatedCustomers = custRes.data.data || custRes.data;
      setCustomers(updatedCustomers);
      
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.contact_id) {
      Swal.fire('Error', 'Please select a customer or dealer', 'error');
      return;
    }
    
    setLoading(true);
    try {
      await axios.post('/api/quotations', formData);
      Swal.fire('Success', 'Quotation created successfully', 'success');
      navigate('/quotations');
    } catch (err) {
      console.error('Error creating quotation:', err);
      Swal.fire('Error', err.response?.data?.message || 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Custom styles for react-select to match Bootstrap floating/light style
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

  return (
    <DashboardLayout>
      <div className="container-fluid py-3 px-md-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold mb-0 text-dark">Create New Quotation</h4>
          <button onClick={() => navigate('/quotations')} className="btn btn-outline-secondary btn-sm px-3 shadow-none">
            <FiX className="me-1" /> Discard
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            {/* Left Column: Basic Info */}
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm rounded-3 mb-4">
                <div className="card-body p-4">
                  <h6 className="fw-bold text-uppercase mb-4 text-primary ls-wide" style={{fontSize: '0.75rem'}}>Header Information</h6>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label small fw-bold text-secondary">Contact Type</label>
                      <select 
                        className="form-select shadow-none" 
                        value={formData.contact_type}
                        onChange={(e) => setFormData({...formData, contact_type: e.target.value, contact_id: ''})}
                      >
                        <option value="App\\Models\\Customer">Customer (Individual)</option>
                        <option value="App\\Models\\Dealer">Dealer (Business)</option>
                      </select>
                    </div>
                    <div className="col-md-8">
                      <div className="d-flex justify-content-between align-items-end mb-2">
                        <label className="form-label small fw-bold text-secondary mb-0">Select {formData.contact_type.includes('Customer') ? 'Customer' : 'Dealer'}</label>
                        {formData.contact_type.includes('Customer') && (
                          <button 
                            type="button" 
                            className="btn btn-link btn-sm p-0 m-0 text-decoration-none d-flex align-items-center gap-1 fw-bold text-primary"
                            onClick={() => setShowCustomerModal(true)}
                          >
                            <FiUserPlus fontSize="0.9rem" /> Quick Add
                          </button>
                        )}
                      </div>
                      <select 
                        className="form-select shadow-none"
                        value={formData.contact_id}
                        onChange={(e) => setFormData({...formData, contact_id: e.target.value})}
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
                        onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="card border-0 shadow-sm rounded-3">
                <div className="card-body p-2">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-bold text-uppercase mb-0 text-primary ls-wide" style={{fontSize: '0.75rem'}}>Quotation Items</h6>
                    <button type="button" onClick={addItemRow} className="btn btn-outline-primary btn-sm rounded-pill px-3 shadow-none fw-semibold">
                      <FiPlus className="me-1" /> Add Row
                    </button>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-borderless align-middle">
                      <thead>
                        <tr className="text-secondary small fw-bold border-bottom">
                          <th style={{minWidth: '250px'}}>Product</th>
                          <th style={{width: '100px'}}>Quantity</th>
                          <th style={{width: '120px'}}>Unit Price (₹)</th>
                          <th style={{width: '100px'}}>Discount (₹)</th>
                          <th className="text-end">Total (₹)</th>
                          <th style={{width: '50px'}}></th>
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
                                placeholder="Search Your Product..."
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
                              <div className='small'>
                                {/* className="input-group input-group-sm" <span className="input-group-text bg-light border-0">₹</span> */}
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
                              {(item.quantity * item.unit_price - (item.discount || 0)).toLocaleString(undefined, {minimumFractionDigits: 2})}
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

            {/* Right Column: Summary & Notes */}
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm rounded-3 mb-4 bg-light">
                <div className="card-body p-4">
                  <h6 className="fw-bold text-uppercase mb-4 text-dark ls-wide" style={{fontSize: '0.75rem'}}>Summary</h6>
                  
                  <div className="d-flex justify-content-between mb-3 text-secondary small">
                    <span>Subtotal</span>
                    <span className="fw-bold text-dark">₹{formData.subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  
                  <div className="d-flex justify-content-between mb-3 text-secondary small">
                    <span>Total Discount</span>
                    <span className="fw-bold text-danger">- ₹{formData.discount_total.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>

                  <div className="d-flex justify-content-between mb-4 text-secondary small">
                    <span>Taxes (Estimated)</span>
                    <span className="fw-bold text-dark">₹{formData.tax_total.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>

                  <hr className="opacity-10" />

                  <div className="d-flex justify-content-between align-items-center mt-4">
                    <span className="h6 fw-bold mb-0">Grand Total</span>
                    <span className="h4 fw-bold text-primary mb-0">₹{formData.grand_total.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                </div>
              </div>

              <div className="card border-0 shadow-sm rounded-3 mb-4">
                <div className="card-body p-4">
                    <label className="form-label small fw-bold text-secondary">Internal Notes / Terms</label>
                    <textarea 
                        className="form-control shadow-none" 
                        rows="4" 
                        placeholder="Add special instructions or terms..."
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    ></textarea>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary w-100 py-3 fw-bold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? <div className="spinner-border spinner-border-sm"></div> : <FiSave />}
                {loading ? 'Creating...' : 'Save Quotation (Draft)'}
              </button>
            </div>
          </div>
        </form>

        {/* Quick Customer Modal */}
        {showCustomerModal && (
          <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
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
                        onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Phone Number</label>
                      <input 
                        type="text" 
                        className="form-control shadow-none" 
                        value={newCustomer.phone}
                        onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Email (Optional)</label>
                      <input 
                        type="email" 
                        className="form-control shadow-none" 
                        value={newCustomer.email}
                        onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                      />
                    </div>
                    <div className="mb-0">
                      <label className="form-label small fw-bold text-secondary">Address</label>
                      <textarea 
                        className="form-control shadow-none" 
                        rows="2"
                        value={newCustomer.address}
                        onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
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
      `}</style>
    </DashboardLayout>
  );
}

