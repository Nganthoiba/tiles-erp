import React from 'react';
import { Link } from 'react-router-dom';
import { FiBox, FiTrendingUp, FiTruck, FiSmartphone, FiArrowRight } from 'react-icons/fi';

export default function LandingPage() {
  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom py-3 shadow-sm">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold text-primary" to="/">
            <img src="/icons/icon-192x192.png" alt="Logo" width="40" height="40" className="rounded shadow-sm" />
            <span className="fs-4">New Life Tiles & Sanitary World</span>
          </Link>
          <div className="ms-auto flex-row d-flex">
            <Link to="/login" className="btn btn-outline-primary px-4 fw-medium rounded-pill me-2">Log In</Link>
            <Link to="/register" className="btn btn-primary px-4 fw-medium rounded-pill shadow-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow-1">
        <section className="py-5 bg-white text-center position-relative overflow-hidden">
          <div className="position-absolute top-0 start-50 translate-middle-x w-100 h-100" style={{ background: 'radial-gradient(circle at center, #e0e7ff 0%, transparent 70%)', opacity: 0.5, zIndex: 0 }}></div>
          <div className="container py-xl-5 position-relative z-1">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <span className="badge bg-primary-subtle text-primary fw-semibold px-3 py-2 rounded-pill mb-3 border border-primary-subtle">Introducing CeramaFlow</span>
                <h1 className="display-4 fw-bolder text-dark mb-4" style={{ letterSpacing: '-1px' }}>
                  The Premium ERP for <br className="d-none d-md-block" />
                  <span className="text-primary">Tiles & Sanitaryware</span>
                </h1>
                <p className="lead text-secondary mb-5 px-md-5">
                  Streamline your inventory, manage multi-unit conversions effortlessly (Box, Piece, SFT), and accelerate your sales cycle with our industry-tailored platform.
                </p>
                <div className="d-flex justify-content-center gap-3">
                  <Link to="/login" className="btn btn-primary btn-lg px-5 rounded-pill shadow d-flex align-items-center gap-2">
                    Enter Application <FiArrowRight />
                  </Link>
                </div>
              </div>
            </div>

            {/* Dashboard Mockup Preview */}
            <div className="row justify-content-center mt-5 pt-3">
              <div className="col-11 col-lg-10">
                <div className="bg-light rounded-4 shadow-lg p-2 border border-light-subtle">
                  <div className="bg-white rounded-3 shadow-sm overflow-hidden d-flex flex-column align-items-center justify-content-center" style={{ height: '400px', backgroundImage: 'linear-gradient(to bottom right, #f8fafc, #eff6ff)' }}>
                    <div className="text-center text-secondary opacity-50">
                      <img src="/icons/icon-512x512.png" width="100" className="mb-3 grayscale" style={{ filter: 'grayscale(100%) opacity(0.5)' }} alt="tiles" />
                      <h4 className="fw-bold">Intelligent Dashboard Awaits</h4>
                      <p>Sign in to view your real-time analytics.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-5 bg-light">
          <div className="container py-5">
            <div className="text-center mb-5">
              <h2 className="fw-bolder" style={{ letterSpacing: '-0.5px' }}>Built for Your Industry</h2>
              <p className="text-secondary">Everything you need to run your tiles and sanitaryware business efficiently.</p>
            </div>
            <div className="row g-4">
              <div className="col-md-6 col-lg-3">
                <div className="card h-100 border-0 shadow-sm rounded-4 p-4 hover-lift border-top border-4 border-primary">
                  <div className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                    <FiBox size={24} />
                  </div>
                  <h5 className="fw-bold">Multi-Unit Inventory</h5>
                  <p className="text-secondary small mb-0">Track stock flawlessly across Boxes, Pieces, and Square Feet with our advanced conversion engine.</p>
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="card h-100 border-0 shadow-sm rounded-4 p-4 hover-lift border-top border-4 border-success">
                  <div className="bg-success-subtle text-success rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                    <FiTrendingUp size={24} />
                  </div>
                  <h5 className="fw-bold">Smart Sales & Billing</h5>
                  <p className="text-secondary small mb-0">Generate quotations instantly and convert them to invoices with automated stock deduction.</p>
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="card h-100 border-0 shadow-sm rounded-4 p-4 hover-lift border-top border-4 border-warning">
                  <div className="bg-warning-subtle text-warning rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                    <FiTruck size={24} />
                  </div>
                  <h5 className="fw-bold">Logistics Tracking</h5>
                  <p className="text-secondary small mb-0">Print delivery slips and track dispatch status from warehouse to customer destination.</p>
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="card h-100 border-0 shadow-sm rounded-4 p-4 hover-lift border-top border-4 border-info">
                  <div className="bg-info-subtle text-info rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                    <FiSmartphone size={24} />
                  </div>
                  <h5 className="fw-bold">Mobile Optimized</h5>
                  <p className="text-secondary small mb-0">PWA-ready design ensures you can manage your operations from the showroom floor or on the go.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-dark text-white py-4 mt-auto">
        <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2 mb-3 mb-md-0">
            <img src="/icons/icon-192x192.png" alt="Logo" width="30" height="30" className="rounded shadow-sm opacity-75" />
            <span className="fw-bold">New Life Tiles & Sanitary World</span>
          </div>
          <p className="mb-0 text-white-50 small">© {new Date().getFullYear()} New Life Tiles & Sanitary World. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
