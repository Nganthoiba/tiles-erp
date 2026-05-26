import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

export default function ProductsPage() {
  return (
    <DashboardLayout>
      <div className="card premium-card p-4">
        <h4 className="fw-bold mb-3">Products Hub</h4>
        <p className="text-secondary mb-0">Scaffolding for Product & Variant Catalog Management. (Database and API schema ready)</p>
      </div>
    </DashboardLayout>
  );
}
