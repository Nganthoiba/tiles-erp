import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import DashboardLayout from '../layouts/DashboardLayout';
import Swal from 'sweetalert2';

export default function ProductCreate() {
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversions, setConversions] = useState([]);

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
        },
        conversions: conversions.map(c => ({
          from_unit_id: c.unit_id,
          factor: c.factor
        }))
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
                <div className="col-12">
                  <label className="form-label small fw-bold text-secondary">Description (Optional)</label>
                  <textarea 
                    className="form-control" 
                    rows="3" 
                    placeholder="Enter product details, usage instructions, or search keywords..."
                    {...register('description')}
                  ></textarea>
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

                {/* Conversions Section */}
                <div className="col-12 mt-5">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0 text-secondary text-uppercase fw-bold ls-wide" style={{fontSize: '0.75rem'}}>Unit Conversions (e.g. Box to Pieces)</h6>
                    <button 
                      type="button" 
                      className="btn btn-outline-primary btn-sm rounded-pill px-3"
                      onClick={() => setConversions([...conversions, { unit_id: '', factor: '' }])}
                    >
                      + Add Alternative Unit
                    </button>
                  </div>
                  <hr className="mt-0 mb-4 opacity-10" />
                  
                  {conversions.length === 0 ? (
                    <div className="p-4 border rounded-3 bg-light text-center">
                      <span className="text-secondary small">No conversions defined. Standard base unit will be used.</span>
                    </div>
                  ) : (
                    conversions.map((conv, index) => (
                      <div key={index} className="row g-3 mb-3 align-items-end p-3 border rounded-3 bg-light mx-0">
                        <div className="col-md-5">
                          <label className="form-label small fw-bold">1 Unit of...</label>
                          <select 
                            className="form-select" 
                            value={conv.unit_id} 
                            onChange={(e) => {
                              const newConvs = [...conversions];
                              newConvs[index].unit_id = e.target.value;
                              setConversions(newConvs);
                            }}
                            required
                          >
                            <option value="">Select Unit</option>
                            {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                          </select>
                        </div>
                        <div className="col-md-5">
                          <label className="form-label small fw-bold">Contains how many base units?</label>
                          <div className="input-group">
                            <input 
                              type="number" step="0.0001" className="form-control" 
                              value={conv.factor}
                              onChange={(e) => {
                                const newConvs = [...conversions];
                                newConvs[index].factor = e.target.value;
                                setConversions(newConvs);
                              }}
                              placeholder="e.g. 1.44 or 4"
                              required
                            />
                            <span className="input-group-text small">
                              {units.find(u => u.id === parseInt(watch('base_unit_id')))?.name || 'Base Unit'}
                            </span>
                          </div>
                        </div>
                        <div className="col-md-2">
                          <button 
                            type="button" 
                            className="btn btn-outline-danger btn-sm w-100 border-0"
                            onClick={() => setConversions(conversions.filter((_, i) => i !== index))}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))
                  )}
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
