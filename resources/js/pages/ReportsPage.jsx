import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="card premium-card p-4">
        <h4 className="fw-bold mb-3">Reports Hub</h4>
        <p className="text-secondary mb-0">Scaffolding for Sales, Stock, Dues, and CSV/Excel exports. (Database and API schema ready)</p>
      </div>
    </DashboardLayout>
  );
}
