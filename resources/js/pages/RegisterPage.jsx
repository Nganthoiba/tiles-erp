import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { fetchUser } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.get('/sanctum/csrf-cookie');
      await api.post('/register', form);
      await fetchUser();
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 422) {
        const firstError =
          Object.values(err.response.data.errors || {})?.[0]?.[0] ||
          'Registration failed.';
        setError(firstError);
      } else {
        setError('Registration failed.');
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
            <div className="col-lg-6 d-none d-lg-flex flex-column justify-content-center align-items-center p-5 position-relative" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff' }}>
                <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'radial-gradient(circle at bottom right, rgba(255,255,255,0.1), transparent 50%)' }}></div>
                <img src="/icons/icon-512x512.png" alt="CeramaFlow Logo" width="120" className="mb-4 shadow-lg rounded-4 bg-white p-1 position-relative z-1" />
                <h2 className="fw-bolder mb-3 text-center position-relative z-1" style={{ letterSpacing: '-0.5px' }}>Join CeramaFlow</h2>
                <p className="lead text-center opacity-75 position-relative z-1 mb-0 px-4">Start optimizing your tiles and sanitaryware operations today.</p>
            </div>

            {/* Register Form Side */}
            <div className="col-lg-6 d-flex align-items-center bg-white p-4 p-sm-5">
              <div className="w-100" style={{ maxWidth: '400px', margin: '0 auto' }}>
                <div className="text-center mb-5 d-lg-none">
                    <img src="/icons/icon-192x192.png" alt="Logo" width="60" className="mb-3 shadow-sm rounded-3" />
                    <h3 className="fw-bolder">CeramaFlow</h3>
                </div>
                
                <h3 className="fw-bold mb-1">Create an account</h3>
                <p className="text-secondary mb-4">Enter your details to register.</p>

                {error && <div className="alert alert-danger rounded-3 border-0 bg-danger-subtle text-danger py-2">{error}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      className="form-control border-light-subtle"
                      id="floatingName"
                      placeholder="John Doe"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                    <label htmlFor="floatingName" className="text-secondary">Full Name</label>
                  </div>

                  <div className="form-floating mb-3">
                    <input
                      type="email"
                      className="form-control border-light-subtle"
                      id="floatingEmail"
                      placeholder="name@example.com"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                    <label htmlFor="floatingEmail" className="text-secondary">Email address</label>
                  </div>

                  <div className="row g-2">
                    <div className="col-12 col-sm-6">
                      <div className="form-floating mb-3">
                        <input
                          type="password"
                          className="form-control border-light-subtle"
                          id="floatingPwd"
                          placeholder="Password"
                          name="password"
                          value={form.password}
                          onChange={handleChange}
                          required
                        />
                        <label htmlFor="floatingPwd" className="text-secondary">Password</label>
                      </div>
                    </div>
                    <div className="col-12 col-sm-6">
                      <div className="form-floating mb-4">
                        <input
                          type="password"
                          className="form-control border-light-subtle"
                          id="floatingConfirmPwd"
                          placeholder="Confirm"
                          name="password_confirmation"
                          value={form.password_confirmation}
                          onChange={handleChange}
                          required
                        />
                        <label htmlFor="floatingConfirmPwd" className="text-secondary">Confirm</label>
                      </div>
                    </div>
                  </div>

                  <button className="btn btn-success w-100 py-3 fw-bold rounded-3 shadow-sm mb-3" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </button>
                </form>
                
                <div className="text-center mb-0 mt-3">
                  <span className="text-secondary">Already have an account? </span>
                  <Link to="/login" className="text-success text-decoration-none fw-bold">Sign in</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}