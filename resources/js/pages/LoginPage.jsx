import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: '',
    password: '',
    remember: false,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(form.email, form.password, form.remember);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 422) {
        setError(err.response.data?.message || 'Invalid credentials.');
      } else {
        const msg = err.response ? `Login failed (${err.response.status}): ${err.response.data?.message || err.message}` : `Login failed: ${err.message}`;
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light font-sans py-5">
      <div className="container">
        <div className="card border-0 shadow-lg overflow-hidden" style={{ borderRadius: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
          <div className="row g-0">
            {/* Branding Side */}
            <div className="col-lg-6 d-none d-lg-flex flex-column justify-content-center align-items-center p-5 position-relative" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', color: '#fff' }}>
                <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'radial-gradient(circle at top left, rgba(255,255,255,0.1), transparent 50%)' }}></div>
                <img src="/icons/icon-512x512.png" alt="CeramaFlow Logo" width="120" className="mb-4 shadow rounded-4 bg-white p-1 position-relative z-1" />
                <h2 className="fw-bolder mb-3 text-center position-relative z-1" style={{ letterSpacing: '-0.5px' }}>CeramaFlow ERP</h2>
                <p className="lead text-center opacity-75 position-relative z-1 mb-0 px-4">The industry standard for Tiles & Sanitaryware operations.</p>
            </div>

            {/* Login Form Side */}
            <div className="col-lg-6 d-flex align-items-center bg-white p-4 p-sm-5">
              <div className="w-100" style={{ maxWidth: '400px', margin: '0 auto' }}>
                <div className="text-center mb-5 d-lg-none">
                    <img src="/icons/icon-192x192.png" alt="Logo" width="60" className="mb-3 shadow-sm rounded-3" />
                    <h3 className="fw-bolder">CeramaFlow</h3>
                </div>
                
                <h3 className="fw-bold mb-1">Welcome back</h3>
                <p className="text-secondary mb-4">Please enter your details to sign in.</p>

                {error && <div className="alert alert-danger rounded-3 border-0 bg-danger-subtle text-danger py-2">{error}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="form-floating mb-3">
                    <input
                      type="email"
                      className="form-control border-light-subtle"
                      id="floatingInput"
                      placeholder="name@example.com"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                    <label htmlFor="floatingInput" className="text-secondary">Email address</label>
                  </div>

                  <div className="form-floating mb-3 position-relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control border-light-subtle"
                      id="floatingPassword"
                      placeholder="Password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                    />
                    <label htmlFor="floatingPassword" className="text-secondary">Password</label>
                    <button 
                      type="button" 
                      className="btn position-absolute end-0 top-50 translate-middle-y border-0 text-secondary me-2 shadow-none"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ zIndex: 5 }}
                    >
                      {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                    </button>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-4">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input shadow-none"
                          name="remember"
                          checked={form.remember}
                          onChange={handleChange}
                          id="remember"
                          style={{ cursor: 'pointer' }}
                        />
                        <label className="form-check-label text-secondary" htmlFor="remember" style={{ cursor: 'pointer', fontSize: '0.9rem' }}>
                          Remember me
                        </label>
                      </div>
                      <a href="#" className="text-primary text-decoration-none fw-medium" style={{ fontSize: '0.9rem' }}>Forgot password?</a>
                  </div>

                  <button className="btn btn-primary w-100 py-3 fw-bold rounded-3 shadow-sm mb-3" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>
                
                <div className="text-center mb-0 mt-4">
                  <span className="text-secondary">Don't have an account? </span>
                  <Link to="/register" className="text-primary text-decoration-none fw-bold">Sign up</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}