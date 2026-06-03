import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import DashboardLayout from '../layouts/DashboardLayout';
import Swal from 'sweetalert2';
import QuickAddModal from '../components/QuickAddModal';

export default function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
  
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [brands, setBrands] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [conversions, setConversions] = useState([]);
  
  const selectedCategoryId = watch('category_id');
  const selectedBaseUnitId = watch('base_unit_id');
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Identify "Square Feet" unit
  const isSqft = units.find(u => u.id === parseInt(selectedBaseUnitId))?.slug === 'sft';

  // Quick Add Modal States
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);

  // Unit selections for specs
  const [specUnits, setSpecUnits] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, unitRes, brandRes, prodRes] = await Promise.all([
          axios.get('/api/categories'),
          axios.get('/api/units'),
          axios.get('/api/brands'),
          axios.get(`/api/products/${id}`)
        ]);
        
        setCategories(catRes.data.data || catRes.data || []);
        setUnits(unitRes.data.data || unitRes.data || []);
        setBrands(brandRes.data || []);
        
        const product = prodRes.data?.data || prodRes.data;
        if (!product) throw new Error('Product not found');

        // Populate Core fields
        setValue('name', product.name || '');
        setValue('sku', product.sku || '');
        setValue('barcode', product.barcode || '');
        setValue('category_id', product.category_id || '');
        setValue('brand_id', product.brand_id || '');
        setValue('base_unit_id', product.base_unit_id || '');
        setValue('purchase_price', product.purchase_price || '');
        setValue('sale_price', product.sale_price || '');
        setValue('description', product.description || '');
        setValue('status', product.status || 'active');
        setValue('is_active', !!product.is_active);
        
        // Populate Specs
        if (product.spec_values) {
          product.spec_values.forEach(spec => {
            setValue(`spec_${spec.spec_attribute_id}`, spec.value);
          });
        }

        if (product.unit_conversions) {
          setConversions(product.unit_conversions.map(c => ({
            unit_id: c.from_unit_id,
            factor: c.factor
          })));
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        Swal.fire('Error', 'Could not load product data', 'error');
        navigate('/products');
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [id, setValue, navigate]);

  useEffect(() => {
    if (selectedCategoryId && categories.length > 0) {
      const category = categories.find(c => c.id === parseInt(selectedCategoryId));
      setSelectedCategory(category || null);
    } else {
      setSelectedCategory(null);
    }
  }, [selectedCategoryId, categories]);

  const convertToMm = (val, unit) => {
    const value = parseFloat(val);
    if (isNaN(value)) return val;
    switch (unit) {
      case 'ft': return (value * 304.8).toFixed(2);
      case 'cm': return (value * 10).toFixed(2);
      default: return value;
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Prepare Specs
      const specs = {};
      if (selectedCategory) {
        selectedCategory.spec_attributes.forEach(attr => {
          let val = data[`spec_${attr.id}`];
          const unit = specUnits[attr.id] || 'mm';
          
          // Apply conversion for dimensions
          if (['len_mm', 'wid_mm', 'thk_mm', 'hgt_mm'].includes(attr.system_slug)) {
            val = convertToMm(val, unit);
          }
          
          if (val) specs[attr.id] = val;
        });
      }

      const payload = {
        ...data,
        specs,
        conversions: conversions.map(c => ({
          from_unit_id: c.unit_id,
          factor: c.factor
        }))
      };

      await axios.put(`/api/products/${id}`, payload);
      
      Swal.fire({
        icon: 'success',
        title: 'Product Updated',
        text: 'The product details have been successfully updated.',
        timer: 2000,
        showConfirmButton: false
      });

      navigate('/products');
    } catch (error) {
      console.error('Error updating product:', error);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: error.response?.data?.message || 'Something went wrong while updating the product.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <DashboardLayout>
        <div className="d-flex justify-content-center align-items-center vh-100 p-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold mb-0">Edit Product</h4>
          <button onClick={() => navigate('/products')} className="btn btn-outline-secondary btn-sm px-3 shadow-none">
            Back to Catalog
          </button>
        </div>

        <div className="card premium-card border-0 rounded-3 shadow-sm">
          <div className="card-body p-4 p-md-5">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="row g-4">
                {/* Basic Info Block */}
                <div className="col-12">
                  <h6 className="mb-3 text-primary text-uppercase fw-bold ls-wide" style={{fontSize: '0.75rem'}}>Basic Information</h6>
                  <hr className="mt-0 mb-4 opacity-10" />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary">Product Name</label>
                  <input 
                    type="text" 
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    {...register('name', { required: 'Name is required' })}
                  />
                  {errors.name && <div className="invalid-feedback small">{errors.name.message}</div>}
                </div>

                <div className="col-md-3">
                  <label className="form-label small fw-bold text-secondary">SKU / Item Code</label>
                  <input 
                    type="text" 
                    className={`form-control ${errors.sku ? 'is-invalid' : ''}`}
                    {...register('sku', { required: 'SKU is required' })}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label small fw-bold text-secondary">Barcode</label>
                  <input type="text" className="form-control" {...register('barcode')} />
                </div>

                <div className="col-md-6">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label small fw-bold text-secondary mb-0">Category</label>
                    <button type="button" onClick={() => setShowCategoryModal(true)} className="btn btn-link p-0 text-decoration-none small">
                      + Add New
                    </button>
                  </div>
                  <select 
                    className={`form-select ${errors.category_id ? 'is-invalid' : ''}`}
                    {...register('category_id', { required: 'Category is required' })}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>

                <div className="col-md-6">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label small fw-bold text-secondary mb-0">Brand</label>
                    <button type="button" onClick={() => setShowBrandModal(true)} className="btn btn-link p-0 text-decoration-none small">
                      + Add New
                    </button>
                  </div>
                  <select className="form-select" {...register('brand_id')}>
                    <option value="">Choose Brand</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>

                {/* Calculation Preview Helper */}
                {selectedCategory && (watch('spec_1') || watch('spec_2')) && (
                  <div className="col-12 mt-4">
                    <div className="bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded-3 p-3">
                      <div className="row align-items-center">
                        <div className="col-md-6 border-end border-primary border-opacity-10">
                          <span className="small text-primary fw-bold text-uppercase ls-wide d-block mb-2" style={{fontSize: '0.65rem'}}>Calculated Area (per Piece)</span>
                          <div className="d-flex gap-4">
                            <div>
                                <span className="h4 fw-bold text-dark mb-0 d-block">
                                    {(
                                      convertToMm(watch('spec_1') || 0, specUnits[1] || 'mm') * 
                                      convertToMm(watch('spec_2') || 0, specUnits[2] || 'mm') / 1000000
                                    ).toFixed(4)}
                                </span>
                                <span className="smaller text-secondary">Square Meters (Sqm)</span>
                            </div>
                            <div>
                                <span className="h4 fw-bold text-dark mb-0 d-block">
                                    {(
                                      convertToMm(watch('spec_1') || 0, specUnits[1] || 'mm') * 
                                      convertToMm(watch('spec_2') || 0, specUnits[2] || 'mm') / 92903.04
                                    ).toFixed(4)}
                                </span>
                                <span className="smaller text-secondary">Square Feet (Sqft)</span>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6 ps-md-4">
                          <span className="small text-primary fw-bold text-uppercase ls-wide d-block mb-2" style={{fontSize: '0.65rem'}}>Packaging Impact</span>
                          <div className="d-flex gap-4">
                            <div>
                                <span className="h4 fw-bold text-dark mb-0 d-block">
                                    {(
                                      convertToMm(watch('spec_1') || 0, specUnits[1] || 'mm') * 
                                      convertToMm(watch('spec_2') || 0, specUnits[2] || 'mm') * 
                                      (watch('spec_5') || 1) / 1000000
                                    ).toFixed(4)}
                                </span>
                                <span className="smaller text-secondary">Sqm per Box</span>
                            </div>
                            <div>
                                <span className="h4 fw-bold text-dark mb-0 d-block">
                                    {watch('spec_5') || 1}
                                </span>
                                <span className="smaller text-secondary">Pieces per Box</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pricing Block */}
                <div className="col-12 mt-5">
                  <h6 className="mb-3 text-primary text-uppercase fw-bold ls-wide" style={{fontSize: '0.75rem'}}>Pricing & Units</h6>
                  <hr className="mt-0 mb-4 opacity-10" />
                </div>

                <div className="col-md-3">
                  <label className="form-label small fw-bold text-secondary">Base Unit</label>
                  <select 
                    className={`form-select ${errors.base_unit_id ? 'is-invalid' : ''}`}
                    {...register('base_unit_id', { required: 'Base unit is required' })}
                  >
                    <option value="">Select Unit</option>
                    {units.map(unit => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label small fw-bold text-secondary">Purchase Price</label>
                  <div className="input-group">
                    <span className="input-group-text">₹</span>
                    <input type="number" step="0.01" className="form-control" {...register('purchase_price')} />
                  </div>
                </div>

                <div className="col-md-3">
                  <label className="form-label small fw-bold text-secondary">Sale Price</label>
                  <div className="input-group">
                    <span className="input-group-text">₹</span>
                    <input type="number" step="0.01" className="form-control" {...register('sale_price')} />
                  </div>
                </div>

                <div className="col-md-3">
                  <label className="form-label small fw-bold text-secondary">Status</label>
                  <select className="form-select" {...register('status')}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="discontinued">Discontinued</option>
                  </select>
                </div>

                {/* Dynamic Specifications */}
                {selectedCategory && selectedCategory.spec_attributes && selectedCategory.spec_attributes.length > 0 && (
                  <div className="col-12 mt-5">
                    <h6 className="mb-3 text-primary text-uppercase fw-bold ls-wide" style={{fontSize: '0.75rem'}}>
                      Technical Specifications ({selectedCategory.name})
                    </h6>
                    <hr className="mt-0 mb-4 opacity-10" />
                    <div className="row g-3 p-4 bg-light rounded-3 shadow-none border">
                      {selectedCategory.spec_attributes.map(attr => {
                        const isHidden = isSqft && ['len_mm', 'wid_mm'].includes(attr.system_slug);
                        if (isHidden) return null;

                        return (
                          <div className="col-md-4" key={attr.id}>
                            <label className="form-label small fw-bold text-secondary">
                              {attr.name} {attr.pivot.is_required && <span className="text-danger">*</span>}
                            </label>
                            <div className={['len_mm', 'wid_mm', 'thk_mm', 'hgt_mm'].includes(attr.system_slug) ? 'input-group' : ''}>
                              <input 
                                type={attr.data_type === 'number' ? 'number' : 'text'}
                                step="any"
                                className="form-control"
                                placeholder={attr.name}
                                {...register(`spec_${attr.id}`, { required: attr.pivot.is_required && !isHidden })}
                              />
                              {['len_mm', 'wid_mm', 'thk_mm', 'hgt_mm'].includes(attr.system_slug) && (
                                <select 
                                  className="form-select border-start-0" 
                                  style={{ maxWidth: '80px' }}
                                  value={specUnits[attr.id] || 'mm'}
                                  onChange={(e) => setSpecUnits({...specUnits, [attr.id]: e.target.value})}
                                >
                                  <option value="mm">mm</option>
                                  <option value="cm">cm</option>
                                  <option value="ft">ft</option>
                                </select>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Submit */}
                <div className="col-12 mt-5 pt-3 border-top">
                  <button type="submit" className="btn btn-primary px-5 py-2 fw-bold shadow-sm" disabled={loading}>
                    {loading ? 'Saving Changes...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showCategoryModal && (
        <QuickAddModal 
          type="category" 
          onAdded={(newCat) => {
            setCategories([...categories, newCat]);
            setValue('category_id', newCat.id);
          }}
          onClose={() => setShowCategoryModal(false)}
        />
      )}

      {showBrandModal && (
        <QuickAddModal 
          type="brand" 
          onAdded={(newBrand) => {
            setBrands([...brands, newBrand]);
            setValue('brand_id', newBrand.id);
          }}
          onClose={() => setShowBrandModal(false)}
        />
      )}
    </DashboardLayout>
  );
}
