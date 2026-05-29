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
          <h2 className="fw-bold">Add New Product</h2>
          <button onClick={() => navigate('/products')} className="btn btn-outline-secondary">
            Back to Catalog
          </button>
        </div>

        <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
          <div className="card-body p-4 p-md-5">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="row g-4">
                {/* Basic Info */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Product Name</label>
                  <input 
                    type="text" 
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    placeholder="e.g. Kajaria Glazed Ceramic Tiles"
                    {...register('name', { required: 'Name is required' })}
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">SKU / Item Code</label>
                  <input 
                    type="text" 
                    className={`form-control ${errors.sku ? 'is-invalid' : ''}`}
                    placeholder="e.g. T-KAJ-6060"
                    {...register('sku', { required: 'SKU is required' })}
                  />
                  {errors.sku && <div className="invalid-feedback">{errors.sku.message}</div>}
                </div>

                {/* Categories & Units */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Category</label>
                  <select 
                    className={`form-select ${errors.category_id ? 'is-invalid' : ''}`}
                    {...register('category_id', { required: 'Category is required' })}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {errors.category_id && <div className="invalid-feedback">{errors.category_id.message}</div>}
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Base Unit</label>
                  <select 
                    className={`form-select ${errors.base_unit_id ? 'is-invalid' : ''}`}
                    {...register('base_unit_id', { required: 'Base unit is required' })}
                  >
                    <option value="">Select Base Unit</option>
                    {units.map(unit => (
                      <option key={unit.id} value={unit.id}>{unit.name}</option>
                    ))}
                  </select>
                  {errors.base_unit_id && <div className="invalid-feedback">{errors.base_unit_id.message}</div>}
                </div>

                {/* Attributes Section */}
                <div className="col-12">
                  <hr className="my-3" />
                  <h5 className="mb-3 text-primary">Technical Attributes</h5>
                </div>

                <div className="col-md-3">
                  <label className="form-label fw-semibold text-muted small">Size (e.g. 60x60 cm)</label>
                  <input type="text" className="form-control" {...register('size')} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold text-muted small">Brand</label>
                  <input type="text" className="form-control" {...register('brand')} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold text-muted small">Material</label>
                  <input type="text" className="form-control" {...register('material')} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold text-muted small">Color</label>
                  <input type="text" className="form-control" {...register('color')} />
                </div>

                {/* Submit */}
                <div className="col-12 mt-5">
                  <button type="submit" className="btn btn-primary px-5 py-2 fw-bold" disabled={loading}>
                    {loading ? 'Creating Product...' : 'Create Product'}
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
