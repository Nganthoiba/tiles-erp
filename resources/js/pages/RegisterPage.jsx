import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function RegisterPage() {
  const navigate = useNavigate();

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
    <div className="container py-5" style={{ maxWidth: '420px' }}>
      <div className="card shadow-sm">
        <div className="card-body p-4">
          <h3 className="mb-4">Register</h3>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

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

            <div className="mb-3">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-control"
                name="password_confirmation"
                value={form.password_confirmation}
                onChange={handleChange}
                required
              />
            </div>

            <button className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <div className="mt-3 text-center">
            <Link to="/login">Already have an account? Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}