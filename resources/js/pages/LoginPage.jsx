import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
        setError('Login failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: '420px' }}>
      <div className="card shadow-sm">
        <div className="card-body p-4">
          <h3 className="mb-4">Login</h3>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-check mb-3">
              <input
                type="checkbox"
                className="form-check-input"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
                id="remember"
              />
              <label className="form-check-label" htmlFor="remember">
                Remember me
              </label>
            </div>

            <button className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>
          <div className="mt-3 text-center">
            <Link to="/register">Don't have an account? Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
}