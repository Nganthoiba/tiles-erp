import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

export default function InvoicesPage() {
  return (
    <DashboardLayout>
      <div className="card premium-card p-4">
        <h4 className="fw-bold mb-3">Invoices & Sales</h4>
        <p className="text-secondary mb-0">Scaffolding for Invoices and Billing Management. (Database and API schema ready)</p>
      </div>
    </DashboardLayout>
  );
}
