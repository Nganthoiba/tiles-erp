import React from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { 
  FiTrendingUp, 
  FiAlertTriangle, 
  FiClock, 
  FiFileText, 
  FiPlusCircle, 
  FiActivity, 
  FiUserCheck 
} from 'react-icons/fi';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const primaryRole = user?.roles?.[0] || { name: 'User', slug: 'user' };

  // Mock statistics representing realistic Tiles & Sanitary data
  const stats = [
    {
      title: "Total Revenue (MTD)",
      value: "₹4,82,500.00",
      change: "+12.4% vs last month",
      bgClass: "bg-primary-subtle text-primary",
      icon: <FiTrendingUp className="fs-4" />,
    },
    {
      title: "Outstanding Dues",
      value: "₹1,24,320.00",
      change: "Active collections tracking",
      bgClass: "bg-danger-subtle text-danger",
      icon: <FiActivity className="fs-4" />,
    },
    {
      title: "Pending Dispatches",
      value: "8 Deliveries",
      change: "3 vehicles loaded today",
      bgClass: "bg-warning-subtle text-warning",
      icon: <FiClock className="fs-4" />,
    },
    {
      title: "Low Stock Items",
      value: "5 Products",
      change: "Action required soon",
      bgClass: "bg-info-subtle text-info",
      icon: <FiAlertTriangle className="fs-4" />,
    },
  ];

  // Quick Action navigation buttons
  const quickActions = [
    { label: "New Quotation", path: "/quotations", icon: <FiFileText />, permission: "create-quotations" },
    { label: "Register Product", path: "/products", icon: <FiPlusCircle />, permission: "manage-products" },
    { label: "Adjust Stock", path: "/inventory", icon: <FiAlertTriangle />, permission: "manage-inventory" },
  ];

  // Mock Top Selling Products
  const topProducts = [
    { sku: "T-KAJ-6060", name: "Kajaria Glazed Ceramic Tiles (60x60 cm)", category: "Tiles", sales: "240 Boxes" },
    { sku: "S-CERA-WH01", name: "Cera Wall Hung Closet", category: "Sanitaryware", sales: "85 Pcs" },
    { sku: "A-HIND-TAP3", name: "Hindware Brass Basin Mixer", category: "Fittings", sales: "115 Pcs" },
    { sku: "T-SOM-8080", name: "Somany Vitrified Floor Tiles (80x80 cm)", category: "Tiles", sales: "180 Boxes" },
  ];

  // Mock Activities
  const recentActivities = [
    { action: "Invoice created #INV-2026-004", user: "Sales Executive", time: "10 mins ago" },
    { action: "Stock adjustment +50 Pcs (Breaks inspection)", user: "Store Manager", time: "45 mins ago" },
    { action: "Payment of ₹45,000 received from Kajaria Dealer", user: "Accounts Officer", time: "2 hours ago" },
    { action: "Delivery slip dispatched #DEL-2026-012", user: "Delivery Coordinator", time: "3 hours ago" },
  ];

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-dark">Store Overview</h4>
          <p className="text-secondary small mb-0">Operational performance summary for today.</p>
        </div>
        <div className="d-none d-md-flex align-items-center gap-2">
          <span className="text-secondary" style={{fontSize: '0.75rem'}}>Logged in as:</span>
          <span className="fw-semibold text-dark small text-capitalize">
            {primaryRole.name}
          </span>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="row g-3 mb-4">
        {stats.map((stat, i) => (
          <div key={i} className="col-12 col-md-6 col-xl-3">
            <div className="card stat-card p-3 border-0 shadow-sm rounded-3">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <span className="text-secondary fw-semibold" style={{fontSize: '0.75rem', letterSpacing: '0.3px'}}>{stat.title}</span>
                <div className="text-secondary opacity-50">
                  {stat.icon}
                </div>
              </div>
              <h5 className="fw-bold mb-1 text-dark">{stat.value}</h5>
              <div className="text-success" style={{fontSize: '0.7rem'}}>{stat.change}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Panel */}
      <div className="card premium-card p-3 mb-4 border-0 shadow-sm rounded-3">
        <h6 className="fw-bold text-dark mb-3 small opacity-75 text-uppercase">Direct Actions</h6>
        <div className="d-flex flex-wrap gap-2">
          {quickActions.map((action, i) => {
            if (action.permission && !user?.permissions?.includes(action.permission)) {
              return null;
            }
            return (
              <button 
                key={i} 
                onClick={() => navigate(action.path)}
                className="btn btn-light d-flex align-items-center gap-2 px-3 py-2 small border rounded-pill text-dark"
                style={{ fontSize: '0.8rem' }}
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Content */}
      <div className="row g-4">
        {/* Top Selling Products */}
        <div className="col-12 col-lg-8">
          <div className="card premium-card border-0 rounded-3 shadow-sm">
            <div className="card-header bg-white py-3 border-bottom">
              <h6 className="fw-bold mb-0">Bestselling Items</h6>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 small">
                  <thead>
                    <tr className="text-secondary">
                      <th className="px-4">SKU</th>
                      <th>Product</th>
                      <th>Category</th>
                      <th className="text-end px-4">Sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((p, i) => (
                      <tr key={i}>
                        <td className="px-4"><code className="text-secondary">{p.sku}</code></td>
                        <td className="fw-semibold">{p.name}</td>
                        <td>{p.category}</td>
                        <td className="text-end px-4 fw-bold text-success">{p.sales}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Operations Log */}
        <div className="col-12 col-lg-4">
          <div className="card premium-card border-0 rounded-3 shadow-sm">
            <div className="card-header bg-white py-3 border-bottom">
              <h6 className="fw-bold mb-0">System Activity</h6>
            </div>
            <div className="card-body p-3">
              <div className="d-flex flex-column gap-3">
                {recentActivities.map((act, i) => (
                  <div key={i} className="d-flex gap-3 pb-3 border-bottom last-border-none">
                    <div className="bg-light rounded-circle p-2 d-flex align-items-center justify-content-center text-secondary border" style={{ width: '32px', height: '32px', flexShrink: 0 }}>
                      <FiActivity style={{fontSize: '0.8rem'}} />
                    </div>
                    <div>
                      <div className="text-dark fw-semibold small mb-0">{act.action}</div>
                      <div className="d-flex gap-2 align-items-center text-muted" style={{fontSize: '0.7rem'}}>
                        <span>{act.user}</span>
                        <span>•</span>
                        <span>{act.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}