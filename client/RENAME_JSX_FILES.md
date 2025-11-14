# JSX Files Renaming Guide

## Issue
Vite with ES modules (`"type": "module"`) requires JSX files to have `.jsx` extension.

## Files Already Renamed ✅
- `src/index.js` → `src/index.jsx`
- `src/App.js` → `src/App.jsx`
- `src/pages/Admin/Dashboard.js` → `src/pages/Admin/Dashboard.jsx`
- `src/pages/Admin/Vendors.js` → `src/pages/Admin/Vendors.jsx`
- `src/pages/Vendor/Reports.js` → `src/pages/Vendor/Reports.jsx`
- `src/pages/Society/Dashboard.js` → `src/pages/Society/Dashboard.jsx`
- `src/layouts/AdminLayout.js` → `src/layouts/AdminLayout.jsx`
- `src/components/ProtectedRoute/ProtectedRoute.js` → `src/components/ProtectedRoute/ProtectedRoute.jsx`

## Files Still Need Renaming ⚠️

### Pages
- `pages/Auth/Login.js` → `Login.jsx`
- `pages/Auth/Register.js` → `Register.jsx`
- `pages/Driver/Dashboard.js` → `Dashboard.jsx`
- `pages/Driver/LogCollection.js` → `LogCollection.jsx`
- `pages/Driver/LogDelivery.js` → `LogDelivery.jsx`
- `pages/Driver/SubmitExpense.js` → `SubmitExpense.jsx`
- `pages/Driver/TripHistory.js` → `TripHistory.jsx`
- `pages/Vendor/Dashboard.js` → `Dashboard.jsx`
- `pages/Vendor/ManageSuppliers.js` → `ManageSuppliers.jsx`
- `pages/Vendor/ManageSocieties.js` → `ManageSocieties.jsx`
- `pages/Vendor/ManageVehicles.js` → `ManageVehicles.jsx`
- `pages/Vendor/ExpenseApproval.js` → `ExpenseApproval.jsx`
- `pages/Vendor/InvoiceGeneration.js` → `InvoiceGeneration.jsx`
- `pages/Vendor/PaymentProcessing.js` → `PaymentProcessing.jsx`

### Layouts
- `layouts/DriverLayout.js` → `DriverLayout.jsx`
- `layouts/VendorLayout.js` → `VendorLayout.jsx`
- `layouts/SocietyLayout.js` → `SocietyLayout.jsx`

### Components
- `components/LanguageSwitcher/LanguageSwitcher.js` → `LanguageSwitcher.jsx`
- `components/VendorNav/VendorNav.js` → `VendorNav.jsx`

## Quick Fix Script

Run this in the client directory:
```bash
cd client/src

# Rename all JSX files
find pages layouts components -name "*.js" -type f | while read file; do
  if grep -qE "(return.*<|<[A-Z]|<div|<button|<input|<form|<select|<span|<p|<h)" "$file" 2>/dev/null; then
    mv "$file" "${file%.js}.jsx"
    echo "Renamed: $file → ${file%.js}.jsx"
  fi
done
```

Then update all imports in index.js files and App.jsx to use `.jsx` extensions.

