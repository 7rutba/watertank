import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import VendorLayout from './layouts/VendorLayout';
import DriverLayout from './layouts/DriverLayout';
import SocietyLayout from './layouts/SocietyLayout';
import { Login } from './pages/Auth';
import { Dashboard, Vendors, Analytics, Subscriptions, Settings, Support, AdminExpenses } from './pages/Admin';
import { 
  Dashboard as VendorDashboard, 
  Drivers as VendorDrivers, 
  Vehicles as VendorVehicles, 
  Suppliers as VendorSuppliers, 
  Societies as VendorSocieties,
  Collections as VendorCollections,
  Deliveries as VendorDeliveries,
  Expenses as VendorExpenses,
  Invoices as VendorInvoices,
  Payments as VendorPayments,
  Reports as VendorReports,
  Financials as VendorFinancials,
  AllPayments as VendorAllPayments,
  SupplierPayments as VendorSupplierPayments,
  SocietyPayments as VendorSocietyPayments,
  DriverPayments as VendorDriverPayments,
  RecordPayment as VendorRecordPayment,
  Onboarding as VendorOnboarding,
} from './pages/Vendor';
import { 
  Dashboard as DriverDashboard, 
  LogCollection, 
  LogDelivery, 
  SubmitExpense, 
  TripHistory 
} from './pages/Driver';
import { 
  Dashboard as SocietyDashboard,
  Deliveries as SocietyDeliveries,
  Invoices as SocietyInvoices,
  Payments as SocietyPayments,
} from './pages/Society';
import { Accountants as VendorAccountants } from './pages/Vendor';
import Homepage from './pages/Homepage';
import ContactSupport from './pages/ContactSupport';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/vendor/onboarding" element={<VendorOnboarding />} />
        <Route path="/contact" element={<ContactSupport />} />
        <Route path="/support" element={<ContactSupport />} />

        {/* Super Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="settings" element={<Settings />} />
          <Route path="support" element={<Support />} />
          <Route path="expenses" element={<AdminExpenses />} />
        </Route>

        {/* Vendor Routes */}
        <Route
          path="/vendor"
          element={
            <ProtectedRoute allowedRoles={['vendor', 'accountant']}>
              <VendorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/vendor/dashboard" replace />} />
          <Route path="dashboard" element={<VendorDashboard />} />
          <Route path="drivers" element={<VendorDrivers />} />
          <Route path="vehicles" element={<VendorVehicles />} />
          <Route path="suppliers" element={<VendorSuppliers />} />
          <Route path="societies" element={<VendorSocieties />} />
          <Route path="collections" element={<VendorCollections />} />
          <Route path="deliveries" element={<VendorDeliveries />} />
          <Route path="expenses" element={<VendorExpenses />} />
          <Route path="invoices" element={<VendorInvoices />} />
          <Route path="payments" element={<VendorAllPayments />} />
          <Route path="payments/suppliers" element={<VendorSupplierPayments />} />
          <Route path="payments/societies" element={<VendorSocietyPayments />} />
          <Route path="payments/drivers" element={<VendorDriverPayments />} />
          <Route path="payments/record" element={<VendorRecordPayment />} />
          <Route path="reports" element={<VendorReports />} />
          <Route path="financials" element={<VendorFinancials />} />
          <Route path="accountants" element={<VendorAccountants />} />
        </Route>

        {/* Driver Routes */}
        <Route
          path="/driver"
          element={
            <ProtectedRoute allowedRoles={['driver']}>
              <DriverLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/driver/dashboard" replace />} />
          <Route path="dashboard" element={<DriverDashboard />} />
          <Route path="collection" element={<LogCollection />} />
          <Route path="delivery" element={<LogDelivery />} />
          <Route path="expense" element={<SubmitExpense />} />
          <Route path="history" element={<TripHistory />} />
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
          <Route index element={<Navigate to="/society/dashboard" replace />} />
          <Route path="dashboard" element={<SocietyDashboard />} />
          <Route path="deliveries" element={<SocietyDeliveries />} />
          <Route path="invoices" element={<SocietyInvoices />} />
          <Route path="payments" element={<SocietyPayments />} />
        </Route>

        {/* Root Route - Homepage with smart redirect */}
        <Route path="/" element={<Homepage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
