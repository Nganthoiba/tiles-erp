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
          <h3 className="fw-bold mb-1">Welcome back, {user?.name}!</h3>
          <p className="text-secondary mb-0">Here's what is happening with the store operations today.</p>
        </div>
        <div className="d-none d-md-flex align-items-center gap-2">
          <span className="text-secondary fs-7"><FiUserCheck className="me-1" /> Logged in as:</span>
          <span className="badge bg-secondary-subtle text-secondary-emphasis fw-semibold rounded-pill px-3 py-2 text-capitalize">
            {user?.roles?.[0]?.name || 'Staff'}
          </span>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="row g-4 mb-4">
        {stats.map((stat, i) => (
          <div key={i} className="col-12 col-md-6 col-xl-3">
            <div className="card stat-card p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-secondary fw-semibold fs-7">{stat.title}</span>
                <div className={`stat-icon-wrapper ${stat.bgClass}`}>
                  {stat.icon}
                </div>
              </div>
              <h3 className="fw-bold mb-1">{stat.value}</h3>
              <span className="text-success fs-7 fw-medium">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Panel */}
      <div className="card premium-card p-3 mb-4">
        <h5 className="fw-bold text-dark mb-3">Quick Actions</h5>
        <div className="d-flex flex-wrap gap-3">
          {quickActions.map((action, i) => {
            if (action.permission && !user?.permissions?.includes(action.permission)) {
              return null;
            }
            return (
              <button 
                key={i} 
                onClick={() => navigate(action.path)}
                className="btn btn-outline-primary d-flex align-items-center gap-2 px-4 py-2 rounded-3 border-opacity-25"
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
        <div className="col-12 col-lg-7">
          <div className="card premium-card p-4 h-100">
            <h5 className="fw-bold mb-4">Top Selling Products</h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr className="text-secondary fs-7">
                    <th>SKU Code</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th className="text-end">Sales Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p, i) => (
                    <tr key={i}>
                      <td><code className="text-primary fw-medium">{p.sku}</code></td>
                      <td className="fw-semibold text-dark fs-7">{p.name}</td>
                      <td><span className="badge bg-light text-dark">{p.category}</span></td>
                      <td className="text-end fw-semibold text-success">{p.sales}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Operations Log */}
        <div className="col-12 col-lg-5">
          <div className="card premium-card p-4 h-100">
            <h5 className="fw-bold mb-4">Recent Audit Activity</h5>
            <div className="d-flex flex-column gap-3">
              {recentActivities.map((act, i) => (
                <div key={i} className="d-flex gap-3 pb-3 border-bottom last-border-none">
                  <div className="bg-light rounded-circle p-2 d-flex align-items-center justify-content-center text-primary" style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                    <FiActivity />
                  </div>
                  <div>
                    <div className="text-dark fw-semibold fs-7 mb-1">{act.action}</div>
                    <div className="d-flex gap-2 align-items-center fs-8 text-secondary">
                      <span>By {act.user}</span>
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
    </DashboardLayout>
  );
}