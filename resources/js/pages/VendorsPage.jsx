import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import DashboardLayout from '../layouts/DashboardLayout';
import Swal from 'sweetalert2';
import { FiPlus, FiUsers, FiEdit2, FiTrash2, FiCheck, FiX } from 'react-icons/fi';

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/vendors');
      setVendors(response.data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (vendor = null) => {
    setEditingVendor(vendor);
    if (vendor) {
      setValue('name', vendor.name);
      setValue('email', vendor.email);
      setValue('phone', vendor.phone);
      setValue('address', vendor.address);
      setValue('landmark', vendor.landmark);
      setValue('category', vendor.category);
    } else {
      reset();
    }
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingVendor) {
        await axios.put(`/api/vendors/${editingVendor.id}`, data);
        Swal.fire({ icon: 'success', title: 'Updated!', text: 'Vendor details updated.', timer: 1500, showConfirmButton: false });
      } else {
        await axios.post('/api/vendors', data);
        Swal.fire({ icon: 'success', title: 'Created!', text: 'New vendor added.', timer: 1500, showConfirmButton: false });
      }
      setShowModal(false);
      fetchVendors();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to save vendor', 'error');
    }
  };

  const toggleStatus = async (vendor) => {
    try {
      await axios.put(`/api/vendors/${vendor.id}`, { ...vendor, is_active: !vendor.is_active });
      fetchVendors();
    } catch (error) {
      Swal.fire('Error', 'Failed to update status', 'error');
    }
  };

  return (
    <DashboardLayout>
      <div className="container-fluid py-3 px-md-4">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <h4 className="fw-bold mb-0">Vendors & Suppliers</h4>
            <p className="text-secondary small mb-0">Manage your procurement network</p>
          </div>
          <button className="btn btn-primary btn-sm px-3 fw-bold d-flex align-items-center gap-2" onClick={() => handleOpenModal()}>
            <FiPlus /> Add Vendor
          </button>
        </div>

        <div className="card premium-card border-0 rounded-3 shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 small">
                <thead>
                  <tr className="text-secondary">
                    <th className="px-4">Vendor Details</th>
                    <th>Category</th>
                    <th>Contact Info</th>
                    <th>State</th>
                    <th className="text-end px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="5" className="text-center py-5">Loading...</td></tr>
                  ) : vendors.map(vendor => (
                    <tr key={vendor.id} className={!vendor.is_active ? 'opacity-50' : ''}>
                      <td className="px-4">
                        <div className="fw-bold">{vendor.name}</div>
                        <div className="text-muted smaller">{vendor.landmark ? `${vendor.landmark}, ` : ''}{vendor.address}</div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border px-2 py-1">{vendor.category}</span>
                      </td>
                      <td>
                        <div className="smaller">{vendor.phone}</div>
                        <div className="text-muted" style={{fontSize: '0.7rem'}}>{vendor.email}</div>
                      </td>
                      <td>
                        {vendor.is_active ? 
                          <span className="text-success smaller d-flex align-items-center gap-1"><FiCheck /> Active</span> : 
                          <span className="text-danger smaller d-flex align-items-center gap-1"><FiX /> Inactive</span>
                        }
                      </td>
                      <td className="text-end px-4">
                        <button className="btn btn-link btn-sm text-secondary me-2 p-0" onClick={() => handleOpenModal(vendor)}><FiEdit2 /></button>
                        <button className={`btn btn-link btn-sm ${vendor.is_active ? 'text-danger' : 'text-success'} p-0`} onClick={() => toggleStatus(vendor)}>
                          {vendor.is_active ? <FiTrash2 /> : <FiCheck />}
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

      {/* Vendor Modal */}
      {showModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 9999}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-3 shadow-lg">
              <div className="modal-header border-bottom bg-light px-4 py-3">
                <h6 className="modal-title fw-bold m-0">{editingVendor ? 'Edit Vendor' : 'Add New Vendor'}</h6>
                <button type="button" className="btn-close shadow-none" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="mb-3">
                    <label className="form-label smaller fw-bold text-secondary">Vendor Name</label>
                    <input type="text" className="form-control form-control-sm" {...register('name', { required: true })} />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label smaller fw-bold text-secondary">Phone</label>
                      <input type="text" className="form-control form-control-sm" {...register('phone')} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label smaller fw-bold text-secondary">Email</label>
                      <input type="email" className="form-control form-control-sm" {...register('email')} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label smaller fw-bold text-secondary">Category</label>
                    <select className="form-select form-select-sm" {...register('category', { required: true })}>
                      <option value="Supplier">Supplier</option>
                      <option value="Manufacturer">Manufacturer</option>
                      <option value="Distributor">Distributor</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label smaller fw-bold text-secondary">Full Address</label>
                    <textarea className="form-control form-control-sm" rows="2" {...register('address')}></textarea>
                  </div>
                  <div className="mb-4">
                    <label className="form-label smaller fw-bold text-secondary">Landmark / Street</label>
                    <input type="text" className="form-control form-control-sm" {...register('landmark')} />
                  </div>
                  <div className="d-grid pt-2">
                    <button type="submit" className="btn btn-primary py-2 fw-bold rounded-pill">
                      {editingVendor ? 'Update Vendor' : 'Save Vendor'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
