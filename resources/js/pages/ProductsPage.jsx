import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../layouts/DashboardLayout';
import { FiPlus, FiPackage, FiSearch } from 'react-icons/fi';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/products');
      // Pagination handling - the controller returns a paginated object
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-1">Products Catalog</h2>
            <p className="text-secondary small mb-0">Manage your tiles and sanitaryware inventory items</p>
          </div>
          <Link to="/products/create" className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm">
            <FiPlus /> <span>New Product</span>
          </Link>
        </div>

        <div className="card shadow-sm border-0 rounded-3">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="px-4 py-3 text-secondary small text-uppercase fw-bold">SKU</th>
                    <th className="py-3 text-secondary small text-uppercase fw-bold">Product Name</th>
                    <th className="py-3 text-secondary small text-uppercase fw-bold">Category</th>
                    <th className="py-3 text-secondary small text-uppercase fw-bold">Base Unit</th>
                    <th className="py-3 text-secondary small text-uppercase fw-bold text-end px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-5">
                        <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                        <span className="text-secondary">Loading products...</span>
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-5 text-secondary">
                        <FiPackage size={48} className="mb-3 opacity-25" />
                        <p className="mb-0">No products found. Start by adding a new one!</p>
                      </td>
                    </tr>
                  ) : (
                    products.map(product => (
                      <tr key={product.id}>
                        <td className="px-4 fw-medium text-primary">{product.sku}</td>
                        <td>
                          <div className="fw-bold">{product.name}</div>
                          {product.attributes && (
                            <div className="text-secondary smaller">
                              {product.attributes.brand} | {product.attributes.size}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="badge bg-soft-info text-info rounded-pill px-3">
                            {product.category?.name || 'N/A'}
                          </span>
                        </td>
                        <td className="text-secondary">
                          {product.base_unit?.name}
                        </td>
                        <td className="text-end px-4">
                          <button className="btn btn-sm btn-outline-primary me-2">Edit</button>
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

      <style>{`
        .bg-soft-info { background-color: rgba(13, 202, 240, 0.1); }
        .smaller { font-size: 0.75rem; }
      `}</style>
    </DashboardLayout>
  );
}
