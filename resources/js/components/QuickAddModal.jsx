import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function QuickAddModal({ type, onAdded, onClose }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const endpoint = type === 'category' ? '/api/categories' : '/api/brands';
      const res = await axios.post(endpoint, { name });
      
      Swal.fire({
        icon: 'success',
        title: `${type === 'category' ? 'Category' : 'Brand'} Added`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });

      onAdded(res.data);
      setName('');
      onClose();
    } catch (error) {
      console.error('Error adding new entry:', error);
      Swal.fire({
        icon: 'error',
        title: 'Entry Failed',
        text: error.response?.data?.message || 'Something went wrong.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header border-bottom-0 pt-4 px-4">
            <h5 className="modal-title fw-bold">Add New {type === 'category' ? 'Category' : 'Brand'}</h5>
            <button type="button" className="btn-close shadow-none" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary">Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder={`Enter ${type} name`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  required
                />
              </div>
            </div>
            <div className="modal-footer border-top-0 pb-4 px-4">
              <button type="button" className="btn btn-light px-4 rounded-pill" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary px-4 rounded-pill shadow-sm" disabled={loading}>
                {loading ? 'Adding...' : 'Save Entry'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
