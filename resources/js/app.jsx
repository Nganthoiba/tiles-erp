import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import ProductCreate from './pages/ProductCreate';
import ProductEdit from './pages/ProductEdit';
import InventoryPage from './pages/InventoryPage';
import QuotationCreate from './pages/QuotationCreate';
import QuotationEdit from './pages/QuotationEdit';
import QuotationDetail from './pages/QuotationDetail';
import QuotationsPage from './pages/QuotationsPage';
import InvoicesPage from './pages/InvoicesPage';
import DeliveriesPage from './pages/DeliveriesPage';
import PaymentsPage from './pages/PaymentsPage';
import ReportsPage from './pages/ReportsPage';
import VendorsPage from './pages/VendorsPage';
import StockLedgerPage from './pages/StockLedgerPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../css/app.css';

import LandingPage from './pages/LandingPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredPermission="view-dashboard">
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute requiredPermission="manage-products">
                <ProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/create"
            element={
              <ProtectedRoute requiredPermission="manage-products">
                <ProductCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/:id/edit"
            element={
              <ProtectedRoute requiredPermission="manage-products">
                <ProductEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute requiredPermission="manage-inventory">
                <InventoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/ledger"
            element={
              <ProtectedRoute requiredPermission="manage-inventory">
                <StockLedgerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quotations"
            element={
              <ProtectedRoute requiredPermission="create-quotations">
                <QuotationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quotations/create"
            element={
              <ProtectedRoute requiredPermission="create-quotations">
                <QuotationCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quotations/:id"
            element={
              <ProtectedRoute requiredPermission="create-quotations">
                <QuotationDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quotations/:id/edit"
            element={
              <ProtectedRoute requiredPermission="create-quotations">
                <QuotationEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices"
            element={
              <ProtectedRoute requiredPermission="create-invoices">
                <InvoicesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deliveries"
            element={
              <ProtectedRoute requiredPermission="manage-deliveries">
                <DeliveriesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute requiredPermission="record-payments">
                <PaymentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute requiredPermission="view-reports">
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendors"
            element={
              <ProtectedRoute requiredPermission="manage-products">
                <VendorsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);