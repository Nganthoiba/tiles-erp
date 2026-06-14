import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../services/api';
import { FiEye, FiEyeOff, FiLock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function ChangePasswordPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setGeneralError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setGeneralError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const res = await api.post('/change-password', {
        current_password: form.current_password,
        new_password: form.new_password,
        new_password_confirmation: form.new_password_confirmation,
      });

      setSuccessMessage(res.data?.message || 'Password changed successfully!');
      setForm({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });

      // Redirect to dashboard after a delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2500);

    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data?.errors || {});
        setGeneralError(err.response.data?.message || 'Validation failed. Please correct the fields.');
      } else {
        const msg = err.response 
          ? `Error (${err.response.status}): ${err.response.data?.message || err.message}` 
          : `Network error: ${err.message}`;
        setGeneralError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-4">
        <h4 className="fw-bold mb-1 text-dark">Account Settings</h4>
        <p className="text-secondary small mb-0">Update your account credentials to keep your profile secure.</p>
      </div>

      <div className="row">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card premium-card border-0 shadow-sm rounded-3 overflow-hidden">
            <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
              <FiLock className="text-secondary fs-5" />
              <h6 className="fw-bold mb-0">Change Password</h6>
            </div>
            
            <div className="card-body p-4">
              {successMessage && (
                <div className="alert alert-success border-0 rounded-3 bg-success-subtle text-success d-flex align-items-center gap-2 mb-4 py-2" role="alert">
                  <FiCheckCircle className="fs-5" />
                  <span className="small">{successMessage} Redirecting to dashboard...</span>
                </div>
              )}

              {generalError && (
                <div className="alert alert-danger border-0 rounded-3 bg-danger-subtle text-danger d-flex align-items-center gap-2 mb-4 py-2" role="alert">
                  <FiAlertCircle className="fs-5" />
                  <span className="small">{generalError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Current Password */}
                <div className="mb-3">
                  <label htmlFor="current_password" className="form-label fw-semibold text-dark small">Current Password</label>
                  <div className="input-group position-relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      className={`form-control border-light-subtle rounded-3 ${errors.current_password ? 'is-invalid' : ''}`}
                      id="current_password"
                      name="current_password"
                      placeholder="Enter current password"
                      value={form.current_password}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      className="btn position-absolute end-0 top-50 translate-middle-y border-0 text-secondary me-2 shadow-none py-0 px-2"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      style={{ zIndex: 5, background: 'transparent' }}
                    >
                      {showCurrentPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                  {errors.current_password && (
                    <div className="text-danger mt-1 small" style={{ fontSize: '0.8rem' }}>
                      {errors.current_password[0]}
                    </div>
                  )}
                </div>

                {/* New Password */}
                <div className="mb-3">
                  <label htmlFor="new_password" className="form-label fw-semibold text-dark small">New Password</label>
                  <div className="input-group position-relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      className={`form-control border-light-subtle rounded-3 ${errors.new_password ? 'is-invalid' : ''}`}
                      id="new_password"
                      name="new_password"
                      placeholder="Enter new password (min. 8 chars)"
                      value={form.new_password}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      className="btn position-absolute end-0 top-50 translate-middle-y border-0 text-secondary me-2 shadow-none py-0 px-2"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{ zIndex: 5, background: 'transparent' }}
                    >
                      {showNewPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                  {errors.new_password && (
                    <div className="text-danger mt-1 small" style={{ fontSize: '0.8rem' }}>
                      {errors.new_password[0]}
                    </div>
                  )}
                </div>

                {/* Confirm New Password */}
                <div className="mb-4">
                  <label htmlFor="new_password_confirmation" className="form-label fw-semibold text-dark small">Confirm New Password</label>
                  <div className="input-group position-relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="form-control border-light-subtle rounded-3"
                      id="new_password_confirmation"
                      name="new_password_confirmation"
                      placeholder="Confirm new password"
                      value={form.new_password_confirmation}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      className="btn position-absolute end-0 top-50 translate-middle-y border-0 text-secondary me-2 shadow-none py-0 px-2"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{ zIndex: 5, background: 'transparent' }}
                    >
                      {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-light border px-4 py-2"
                    onClick={() => navigate('/dashboard')}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-4 py-2"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
