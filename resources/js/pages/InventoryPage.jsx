import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

export default function InventoryPage() {
  return (
    <DashboardLayout>
      <div className="card premium-card p-4">
        <h4 className="fw-bold mb-3">Inventory Ledger</h4>
        <p className="text-secondary mb-0">Scaffolding for Warehouse Stock Balances and Ledger. (Database and API schema ready)</p>
      </div>
    </DashboardLayout>
  );
}
