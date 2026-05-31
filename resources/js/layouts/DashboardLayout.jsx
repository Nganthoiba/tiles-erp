import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiHome, 
  FiBox, 
  FiLayers, 
  FiFileText, 
  FiClipboard, 
  FiTruck, 
  FiDollarSign, 
  FiBarChart2, 
  FiMenu, 
  FiLogOut, 
  FiUser,
  FiUsers,
  FiPackage,
  FiShoppingCart,
  FiList
} from 'react-icons/fi';

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Define sidebar links mapped to their required permission
  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <FiHome />, permission: 'view-dashboard' },
    { icon: <FiPackage />, label: 'Products', path: '/products', permission: 'manage-products' },
    { icon: <FiUsers />, label: 'Vendors', path: '/vendors', permission: 'manage-products' },
    { icon: <FiShoppingCart />, label: 'Inventory', path: '/inventory', permission: 'manage-inventory', end: true },
    { icon: <FiList />, label: 'Stock Ledger', path: '/inventory/ledger', permission: 'manage-inventory' },
    { path: '/quotations', label: 'Quotations', icon: <FiFileText />, permission: 'create-quotations' },
    { path: '/invoices', label: 'Invoices & Sales', icon: <FiClipboard />, permission: 'create-invoices' },
    { path: '/deliveries', label: 'Deliveries Tracker', icon: <FiTruck />, permission: 'manage-deliveries' },
    { path: '/payments', label: 'Due Collections', icon: <FiDollarSign />, permission: 'record-payments' },
    { path: '/reports', label: 'Reports Hub', icon: <FiBarChart2 />, permission: 'view-reports' },
  ];

  // Helper to resolve role color theme
  const getRoleBadgeClass = (roleSlug) => {
    switch (roleSlug) {
      case 'admin': return 'bg-danger text-white';
      case 'manager': return 'bg-warning text-dark';
      case 'sales': return 'bg-primary text-white';
      case 'warehouse': return 'bg-success text-white';
      case 'accounts': return 'bg-info text-dark';
      case 'delivery': return 'bg-secondary text-white';
      default: return 'bg-light text-dark';
    }
  };

  const primaryRole = user?.roles?.[0] || { name: 'User', slug: 'user' };

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  return (
    <div className="d-flex w-100 min-vh-100">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <div className={`sidebar-wrapper ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <span className="sidebar-icon" style={{color: 'var(--accent-color)'}}><FiLayers /></span>
          <span className="sidebar-brand-text fs-6 text-uppercase fw-bold ls-tight">Tiles <span style={{color: 'var(--accent-color)'}}>ERP</span></span>
        </div>
        
        <ul className="sidebar-menu">
          {navigationItems.map((item) => {
            if (item.permission && !user?.permissions?.includes(item.permission)) {
              return null;
            }
            return (
              <li key={item.path} className="sidebar-menu-item">
                <NavLink 
                  to={item.path} 
                  end={item.end}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  <span className="sidebar-text small">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>

        <div className="sidebar-footer border-top p-3 mt-auto">
          <button 
            className="btn btn-link sidebar-link text-danger w-100 d-flex align-items-center gap-2 border-0 p-0 text-decoration-none shadow-none" 
            onClick={handleLogout}
            style={{ fontSize: '0.85rem' }}
          >
            <FiLogOut />
            <span className="sidebar-text">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="d-flex flex-column flex-grow-1 min-vh-100 overflow-hidden main-content">
        {/* Top Header Bar */}
        <header className="topbar">
          <button 
            className="btn btn-link text-secondary p-0" 
            onClick={toggleSidebar}
          >
            <FiMenu className="fs-5" />
          </button>

          <div className="d-flex align-items-center gap-3">
            <div className="text-end d-none d-sm-block">
              <div className="fw-semibold text-dark small">{user?.name}</div>
              <span className="text-secondary" style={{ fontSize: '0.75rem' }}>
                {primaryRole.name}
              </span>
            </div>
            <div className="dropdown">
              <button 
                className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center border" 
                type="button"
                data-bs-toggle="dropdown" 
                aria-expanded="false"
                style={{ width: '32px', height: '32px' }}
              >
                <FiUser className="fs-6" />
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow-sm border mt-2">
                <li className="px-3 py-2 border-bottom d-sm-none">
                  <div className="fw-semibold text-dark small">{user?.name}</div>
                  <span className="text-secondary small">
                    {primaryRole.name}
                  </span>
                </li>
                <li>
                  <button 
                    className="dropdown-item text-danger d-flex align-items-center gap-2 py-2 small" 
                    onClick={handleLogout}
                  >
                    <FiLogOut /> Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-grow-1 p-3 p-md-4 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
