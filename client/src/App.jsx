import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import DriverLayout from './layouts/DriverLayout.jsx';
import VendorLayout from './layouts/VendorLayout.jsx';
import SocietyLayout from './layouts/SocietyLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';

// Auth Pages
import { Login, Register } from './pages/Auth';

// Driver Pages
import {
  DriverDashboard,
  LogCollection,
  LogDelivery,
  SubmitExpense,
  TripHistory,
} from './pages/Driver';

// Vendor Pages
import {
  VendorDashboard,
  ManageSuppliers,
  ManageSocieties,
  ManageVehicles,
  ExpenseApproval,
  InvoiceGeneration,
  PaymentProcessing,
} from './pages/Vendor';
import Reports from './pages/Vendor/Reports.jsx';

// Society Pages
import { SocietyDashboard } from './pages/Society';

// Admin Pages
import { AdminDashboard } from './pages/Admin';
import Vendors from './pages/Admin/Vendors.jsx';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Driver Routes */}
        <Route
          path="/driver"
          element={
            <ProtectedRoute allowedRoles={['driver']}>
              <DriverLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DriverDashboard />} />
          <Route path="dashboard" element={<DriverDashboard />} />
          <Route path="collection" element={<LogCollection />} />
          <Route path="delivery" element={<LogDelivery />} />
          <Route path="expense" element={<SubmitExpense />} />
          <Route path="history" element={<TripHistory />} />
        </Route>

        {/* Vendor/Accountant Routes */}
        <Route
          path="/vendor"
          element={
            <ProtectedRoute allowedRoles={['vendor', 'accountant']}>
              <VendorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<VendorDashboard />} />
          <Route path="dashboard" element={<VendorDashboard />} />
          <Route path="suppliers" element={<ManageSuppliers />} />
          <Route path="societies" element={<ManageSocieties />} />
          <Route path="vehicles" element={<ManageVehicles />} />
          <Route path="expenses" element={<ExpenseApproval />} />
          <Route path="invoices" element={<InvoiceGeneration />} />
          <Route path="payments" element={<PaymentProcessing />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        {/* Society Admin Routes */}
        <Route
          path="/society"
          element={
            <ProtectedRoute allowedRoles={['society_admin']}>
              <SocietyLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<SocietyDashboard />} />
          <Route path="dashboard" element={<SocietyDashboard />} />
        </Route>

        {/* Super Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="vendors" element={<Vendors />} />
        </Route>

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

