import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import DashboardLayout from '../layouts/DashboardLayout';
import Swal from 'sweetalert2';

export default function ProductCreate() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch categories and units
    axios.get('/api/categories').then(res => setCategories(res.data));
    axios.get('/api/units').then(res => setUnits(res.data));
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Attributes handling (Size, Brand, Material, Color)
      const payload = {
        ...data,
        attributes: {
          size: data.size,
          brand: data.brand,
          material: data.material,
          color: data.color
        }
      };

      await axios.post('/api/products', payload);
      
      Swal.fire({
        icon: 'success',
        title: 'Product Created',
        text: 'The new product has been successfully added to the catalog.',
        timer: 2000,
        showConfirmButton: false
      });

      navigate('/products');
    } catch (error) {
      console.error('Error creating product:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong while creating the product.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold mb-0">New Product Entry</h4>
          <button onClick={() => navigate('/products')} className="btn btn-outline-secondary btn-sm px-3">
            Back to Catalog
          </button>
        </div>

        <div className="card premium-card border-0 rounded-3">
          <div className="card-body p-4 p-md-5">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="row g-4">
                {/* Basic Info */}
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary">Product Name</label>
                  <input 
                    type="text" 
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    placeholder="e.g. Kajaria Glazed Ceramic Tiles"
                    {...register('name', { required: 'Name is required' })}
                  />
                  {errors.name && <div className="invalid-feedback small">{errors.name.message}</div>}
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary">SKU / Item Code</label>
                  <input 
                    type="text" 
                    className={`form-control ${errors.sku ? 'is-invalid' : ''}`}
                    placeholder="e.g. T-KAJ-6060"
                    {...register('sku', { required: 'SKU is required' })}
                  />
                  {errors.sku && <div className="invalid-feedback small">{errors.sku.message}</div>}
                </div>

                {/* Categories & Units */}
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary">Category</label>
                  <select 
                    className={`form-select ${errors.category_id ? 'is-invalid' : ''}`}
                    {...register('category_id', { required: 'Category is required' })}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {errors.category_id && <div className="invalid-feedback small">{errors.category_id.message}</div>}
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary">Base Unit</label>
                  <select 
                    className={`form-select ${errors.base_unit_id ? 'is-invalid' : ''}`}
                    {...register('base_unit_id', { required: 'Base unit is required' })}
                  >
                    <option value="">Select Base Unit</option>
                    {units.map(unit => (
                      <option key={unit.id} value={unit.id}>{unit.name}</option>
                    ))}
                  </select>
                  {errors.base_unit_id && <div className="invalid-feedback small">{errors.base_unit_id.message}</div>}
                </div>

                {/* Attributes Section */}
                <div className="col-12 mt-5">
                  <h6 className="mb-3 text-secondary text-uppercase fw-bold ls-wide" style={{fontSize: '0.75rem'}}>Technical Detail</h6>
                  <hr className="mt-0 mb-4 opacity-10" />
                </div>

                <div className="col-md-3">
                  <label className="form-label small fw-bold text-secondary">Size</label>
                  <input type="text" className="form-control" placeholder="60x60 cm" {...register('size')} />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-bold text-secondary">Brand</label>
                  <input type="text" className="form-control" {...register('brand')} />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-bold text-secondary">Material</label>
                  <input type="text" className="form-control" {...register('material')} />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-bold text-secondary">Color</label>
                  <input type="text" className="form-control" {...register('color')} />
                </div>

                {/* Submit */}
                <div className="col-12 mt-5 pt-3">
                  <button type="submit" className="btn btn-primary px-5 py-2 fw-bold" disabled={loading}>
                    {loading ? 'Processing...' : 'Register Product'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
