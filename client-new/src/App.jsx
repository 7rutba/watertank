import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import VendorLayout from './layouts/VendorLayout';
import DriverLayout from './layouts/DriverLayout';
import SocietyLayout from './layouts/SocietyLayout';
import { Login } from './pages/Auth';
import { Dashboard, Vendors, Analytics, Subscriptions, Settings, Support } from './pages/Admin';
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
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

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
          <Route path="payments" element={<VendorPayments />} />
          <Route path="reports" element={<VendorReports />} />
          <Route path="financials" element={<VendorFinancials />} />
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

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
