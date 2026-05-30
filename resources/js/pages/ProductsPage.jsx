import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../layouts/DashboardLayout';
import { FiPlus, FiBox, FiCheck } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [vendors, setVendors] = useState([]);
  
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    fetchProducts();
    fetchWarehouses();
    fetchVendors();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/products');
      // The API returns a paginated response or a simple array
      const data = response.data.data || response.data;
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await axios.get('/api/warehouses');
      setWarehouses(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await axios.get('/api/vendors');
      const data = response.data.data || response.data;
      setVendors(Array.isArray(data) ? data.filter(v => v.is_active) : []);
    } catch (err) {
      console.error(err);
    }
  };

  const openStockModal = (product) => {
    setSelectedProduct(product);
    setShowStockModal(true);
  };

  const handleQuickStockAdd = async (data) => {
    try {
      await axios.post('/api/inventory/adjust', {
        ...data,
        product_id: selectedProduct.id,
        unit_id: selectedProduct.base_unit_id,
        type: 'addition'
      });
      Swal.fire({
        icon: 'success',
        title: 'Stock Updated',
        text: `${data.quantity} units added to ${selectedProduct.name}`,
        timer: 1500,
        showConfirmButton: false
      });
      setShowStockModal(false);
      reset();
      fetchProducts(); // Refresh list
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to update stock', 'error');
    }
  };

  return (
    <DashboardLayout>
      <div className="container-fluid py-3 px-md-4">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <h4 className="fw-bold mb-0 text-dark">Products Hub <span className="badge bg-light text-muted fw-normal" style={{fontSize: '0.6rem'}}>v2.1</span></h4>
            <p className="text-secondary small mb-0">Centralized catalog & rapid inventory actions</p>
          </div>
          <Link to="/products/create" className="btn btn-primary d-flex align-items-center gap-2 px-3 btn-sm fw-semibold">
            <FiPlus /> New Product
          </Link>
        </div>

        <div className="card premium-card border-0 rounded-3 shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 small">
                <thead>
                  <tr className="text-secondary">
                    <th className="px-4">SKU</th>
                    <th>Product Details</th>
                    <th>Category</th>
                    <th>Base Unit</th>
                    <th className="text-end px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="5" className="text-center py-5">
                      <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                      Loading products...
                    </td></tr>
                  ) : products.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-5 text-secondary">No products found in catalog.</td></tr>
                  ) : products.map(product => (
                    <tr key={product.id}>
                      <td className="px-4"><code className="text-secondary">{product.sku}</code></td>
                      <td>
                        <div className="fw-semibold text-dark">{product.name}</div>
                        <div className="text-muted smaller">
                          {product.attributes?.brand} {product.attributes?.size && `| ${product.attributes.size}`}
                        </div>
                      </td>
                      <td>
                        <span className="text-secondary">{product.category?.name}</span>
                      </td>
                      <td>{product.base_unit?.name}</td>
                      <td className="text-end px-4">
                        <button 
                          className="btn btn-link btn-sm text-decoration-none text-success fw-bold me-2"
                          onClick={() => openStockModal(product)}
                        >
                          <FiPlus className="me-1" /> Add Stock
                        </button>
                        <Link 
                          to={`/products/${product.id}/edit`}
                          className="btn btn-link btn-sm text-decoration-none text-secondary"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Stock Modal */}
      {showStockModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 9999}}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content border-0 rounded-3 shadow-lg">
              <div className="modal-header border-bottom bg-light px-3 py-2">
                <h6 className="modal-title fw-bold m-0 small">Receive Stock</h6>
                <button type="button" className="btn-close shadow-none" style={{fontSize: '0.7rem'}} onClick={() => setShowStockModal(false)}></button>
              </div>
              <div className="modal-body p-3">
                <p className="small mb-3">Adding stock for: <br/><strong className="text-primary">{selectedProduct?.name}</strong></p>
                <form onSubmit={handleSubmit(handleQuickStockAdd)}>
                  <div className="mb-3">
                    <label className="form-label smaller fw-bold text-secondary">Warehouse</label>
                    <select className="form-select form-select-sm" {...register('warehouse_id', { required: true })}>
                      <option value="">Select Location</option>
                      {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label smaller fw-bold text-secondary">Quantity ({selectedProduct?.base_unit?.name})</label>
                    <input type="number" step="0.01" className="form-control form-control-sm" {...register('quantity', { required: true, min: 0.001 })} placeholder="e.g. 2500" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label smaller fw-bold text-secondary">Supplier / Vendor</label>
                    <select className="form-select form-select-sm" {...register('vendor_id')}>
                      <option value="">Select Vendor</option>
                      {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="form-label smaller fw-bold text-secondary">Reference / Note</label>
                    <input type="text" className="form-control form-control-sm" {...register('note')} placeholder="Batch # or PO #" />
                  </div>
                  <button type="submit" className="btn btn-primary w-100 btn-sm py-2 fw-bold rounded-pill d-flex align-items-center justify-content-center gap-2">
                    <FiCheck /> Confirm Arrival
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
