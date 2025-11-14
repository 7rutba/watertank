# Vendor Section TODO

## Current Status

### ✅ Completed
- Super Admin can create vendors (backend + frontend)
- Vendor backend endpoints exist (`/api/vendors`)
- Vendor model exists with all fields

### ❌ Missing - Vendor Frontend

## What Needs to Be Created

### 1. **Vendor Onboarding** (HIGH PRIORITY - START HERE)
- [ ] Vendor Registration Page
  - Form to register new vendor account
  - Link from Super Admin vendor creation
  - Email verification flow
- [ ] Vendor Login Page (already exists, needs vendor role support)
- [ ] Vendor Profile Setup
  - Complete business information
  - Upload documents
  - Bank details

### 2. **Vendor Dashboard** (HIGH PRIORITY - START HERE)
- [ ] Dashboard Stats
  - Today's Revenue & Deliveries
  - Monthly Profit/Loss
  - Outstanding Amounts
  - Active Drivers/Tractors count
  - Pending Expenses
- [ ] Recent Activities
- [ ] Quick Actions
- [ ] Charts/Graphs (revenue trends)

### 3. **Vendor Management Pages**

#### Drivers Management
- [ ] List Drivers
- [ ] Add/Edit Driver
- [ ] View Driver Details
- [ ] Assign Drivers to Vehicles
- [ ] Driver Performance Reports

#### Vehicles Management
- [ ] List Vehicles/Tractors
- [ ] Add/Edit Vehicle
- [ ] Vehicle Status Tracking
- [ ] GPS Tracking Integration

#### Suppliers Management
- [ ] List Suppliers
- [ ] Add/Edit Supplier
- [ ] Supplier Payment History
- [ ] Outstanding Payments

#### Societies Management
- [ ] List Societies (Customers)
- [ ] Add/Edit Society
- [ ] Society Delivery History
- [ ] Outstanding Invoices

#### Collections (View Only)
- [ ] View All Collections
- [ ] Filter by Date/Supplier/Driver
- [ ] Collection Details

#### Deliveries (View Only)
- [ ] View All Deliveries
- [ ] Filter by Date/Society/Driver
- [ ] Delivery Details
- [ ] Pending Deliveries

#### Expenses (Approve)
- [ ] View Pending Expenses
- [ ] Approve/Reject Expenses
- [ ] Expense History
- [ ] Expense Reports

#### Invoices (Generate/View)
- [ ] Generate Monthly Invoices
- [ ] View All Invoices
- [ ] Invoice Details
- [ ] Download PDF
- [ ] Send to Society

#### Payments (View)
- [ ] View Payments Received
- [ ] Payment History
- [ ] Outstanding Payments

#### Reports
- [ ] Profit/Loss Report
- [ ] Monthly Report
- [ ] Driver Performance Report
- [ ] Supplier Ledger
- [ ] Society Ledger

#### Financials
- [ ] Financial Dashboard
- [ ] Revenue Analytics
- [ ] Expense Analytics
- [ ] Cash Flow

### 4. **Vendor Layout & Navigation**
- [ ] VendorLayout component (sidebar + navbar)
- [ ] Navigation menu based on permissions
- [ ] Profile dropdown
- [ ] Logout functionality

## Recommended Build Order

### Phase 1: Foundation (DO THIS FIRST)
1. ✅ Vendor Onboarding (Registration + Login)
2. ✅ Vendor Dashboard (Stats + Quick Actions)
3. ✅ Vendor Layout (Sidebar + Navigation)

### Phase 2: Core Management
4. Drivers Management
5. Vehicles Management
6. Suppliers Management
7. Societies Management

### Phase 3: Operations
8. Collections View
9. Deliveries View
10. Expenses Approval

### Phase 4: Financials
11. Invoices
12. Payments
13. Reports
14. Financials Dashboard

## Backend Endpoints Needed

### Dashboard
- `GET /api/vendor/dashboard/stats` - Dashboard statistics
- `GET /api/vendor/dashboard/recent-activity` - Recent activities

### Already Exist (Need Frontend Integration)
- Drivers: `/api/drivers/*` (check if exists)
- Vehicles: `/api/vehicles/*` ✅
- Suppliers: `/api/suppliers/*` ✅
- Societies: `/api/societies/*` ✅
- Collections: `/api/collections/*` ✅
- Deliveries: `/api/deliveries/*` ✅
- Expenses: `/api/expenses/*` ✅
- Invoices: `/api/invoices/*` ✅
- Payments: `/api/payments/*` ✅
- Reports: `/api/reports/*` ✅

## Decision: Build Vendor First

**Why Vendor First?**
1. Vendor is the main tenant - they need to exist before drivers/accountants
2. Vendor dashboard is the central hub for all operations
3. Vendor creates and manages drivers/vehicles/suppliers
4. Once vendor is set up, they can onboard their team (drivers, accountants)

**Next Steps:**
1. Build Vendor Onboarding (Registration)
2. Build Vendor Dashboard
3. Build Vendor Layout
4. Then build Driver/Accountant features

