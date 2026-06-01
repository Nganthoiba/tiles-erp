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
  const [warehouses, setWarehouses] = useState([]);
  const [vendors, setVendors] = useState([]);
  
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    fetchProducts();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchProducts();
  }, [debouncedSearch]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/products', {
        params: { search: debouncedSearch }
      });
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

  // Removed openStockModal

  // Removed handleQuickStockAdd

  return (
    <DashboardLayout>
      <div className="container-fluid py-3 px-md-4">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <h4 className="fw-bold mb-0 text-dark">Products Hub <span className="badge bg-light text-muted fw-normal" style={{fontSize: '0.6rem'}}>v2.1</span></h4>
            <p className="text-secondary small mb-0">Centralized catalog & management</p>
          </div>
          <div className="d-flex gap-3 align-items-center">
            <div className="input-group input-group-sm" style={{width: '250px'}}>
              <span className="input-group-text bg-white border-end-0 text-secondary"><FiBox style={{fontSize: '0.8rem'}} /></span>
              <input 
                type="text" 
                className="form-control border-start-0 ps-0 shadow-none" 
                placeholder="Search by name or SKU..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Link to="/products/create" className="btn btn-primary d-flex align-items-center gap-2 px-3 btn-sm fw-semibold">
              <FiPlus /> New Product
            </Link>
          </div>
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
                        <td className="px-4">
                          <code className="text-secondary">{product.sku}</code>
                          {product.barcode && <div className="smaller text-muted opacity-50">{product.barcode}</div>}
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="fw-semibold text-dark">{product.name}</div>
                            {product.brand && <span className="badge bg-light text-primary border rounded-pill smaller">{product.brand.name}</span>}
                          </div>
                          
                          <div className="text-muted smaller d-flex flex-wrap gap-1 mt-1">
                            {product.type && <span className="fw-bold text-secondary me-1">{product.type.name}</span>}
                            {product.spec_values?.map((spec, i) => (
                              <span key={spec.id}>
                                {i > 0 && <span className="mx-1 text-light">|</span>}
                                {spec.attribute.name}: {spec.value}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <span className="text-secondary">{product.category?.name}</span>
                        </td>
                        <td>
                          <div>{product.base_unit?.name}</div>
                          {product.sale_price > 0 && <div className="smaller text-primary fw-bold">₹{product.sale_price}</div>}
                        </td>
                        <td className="text-end px-4">
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

      {/* Quick Add Stock Modal Removed */}
    </DashboardLayout>
  );
}
