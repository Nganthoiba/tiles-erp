import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

export default function PaymentsPage() {
  return (
    <DashboardLayout>
      <div className="card premium-card p-4">
        <h4 className="fw-bold mb-3">Due Collections</h4>
        <p className="text-secondary mb-0">Scaffolding for Partial/Full Payments and Customer Outstanding tracking. (Database and API schema ready)</p>
      </div>
    </DashboardLayout>
  );
}
