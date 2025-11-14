# Watertank Platform - Complete Workflow Guide

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [User Roles & Permissions](#user-roles--permissions)
3. [Complete Workflow](#complete-workflow)
4. [Data Flow Diagrams](#data-flow-diagrams)
5. [API Endpoints](#api-endpoints)

---

## 🎯 System Overview

The Watertank Platform is a Multi-Vendor SaaS system for managing water tanker businesses. It tracks water collection from suppliers, delivery to societies, and handles complete financial management.

### Key Entities
- **Vendor**: Business owner managing multiple vehicles
- **Driver**: Logs collections and deliveries
- **Supplier**: Source of water (purchase)
- **Society**: Customer receiving water (delivery)
- **Vehicle**: Tanker/tractor used for transport
- **Collection**: Water collected from supplier
- **Delivery**: Water delivered to society
- **Expense**: Driver expenses (fuel, toll, etc.)
- **Invoice**: Monthly billing for societies/suppliers
- **Payment**: Payment transactions

---

## 👥 User Roles & Permissions

### 1. Super Admin 🔴
**Access**: Platform-wide management
- Manage all vendors
- View system analytics
- Handle subscriptions
- System configuration

### 2. Vendor/Owner 🟢
**Access**: Own business management
- Manage drivers, vehicles, suppliers, societies
- View profit/loss reports
- Approve expenses
- Generate invoices
- Process payments

### 3. Driver 🚛
**Access**: Mobile app for daily operations
- Log water collection (from supplier)
- Log water delivery (to society)
- Submit expenses
- View trip history

### 4. Accountant 💰
**Access**: Financial management
- Process supplier payments
- Generate society invoices
- Approve driver expenses
- Financial reports
- Monthly reconciliation

### 5. Society Admin 🏘️
**Access**: Society portal
- View delivery history
- View monthly bills
- Make payments
- Track consumption

---

## 🔄 Complete Workflow

### Phase 1: Initial Setup (Vendor)

1. **Vendor Registration**
   ```
   Vendor registers → Creates account → Gets vendor ID
   ```

2. **Add Suppliers**
   ```
   Vendor → Add Supplier → Enter details:
   - Name, contact, phone, email
   - Purchase rate per liter
   - Payment terms (cash/credit)
   - Address
   ```

3. **Add Societies**
   ```
   Vendor → Add Society → Enter details:
   - Name, contact, phone, email
   - Delivery rate per liter
   - Payment terms
   - Address
   ```

4. **Add Vehicles**
   ```
   Vendor → Add Vehicle → Enter:
   - Vehicle number
   - Type (tanker/tractor/truck)
   - Capacity (liters)
   - Assign driver (optional)
   ```

5. **Add Drivers**
   ```
   Vendor → Register Driver → Enter:
   - Name, email, phone
   - Assign to vehicle
   - Driver gets login credentials
   ```

---

### Phase 2: Daily Operations (Driver)

#### Morning: Water Collection

1. **Driver Logs In**
   ```
   Driver opens app → Login → Dashboard shows today's tasks
   ```

2. **Go to Supplier Location**
   ```
   Driver → Select Vehicle → Navigate to Supplier
   ```

3. **Log Collection**
   ```
   Driver → Log Collection → Fill form:
   - Select Vehicle
   - Select Supplier
   - Enter Quantity (liters)
   - System auto-fills Purchase Rate
   - Capture GPS Location (automatic)
   - Take Photo of Meter Reading
   - Submit
   
   System calculates:
   - Total Cost = Quantity × Purchase Rate
   - Updates Collection record
   - Updates Supplier ledger
   - Notifies Vendor Dashboard
   ```

#### Afternoon: Water Delivery

4. **Go to Society Location**
   ```
   Driver → Navigate to Society
   ```

5. **Log Delivery**
   ```
   Driver → Log Delivery → Fill form:
   - Select Vehicle
   - Select Society
   - Link to Collection (optional)
   - Enter Quantity (liters)
   - System auto-fills Delivery Rate
   - Capture GPS Location (automatic)
   - Take Photo of Meter Reading
   - Get Digital Signature from Society Contact
   - Enter Signed By Name
   - Submit
   
   System calculates:
   - Total Amount = Quantity × Delivery Rate
   - Updates Delivery record
   - Updates Society ledger
   - Adds to Pending Invoice Items
   - Notifies Vendor Dashboard
   ```

#### Evening: Expense Submission

6. **Submit Expenses**
   ```
   Driver → Submit Expense → Fill form:
   - Select Category (fuel/toll/maintenance/food/medical/personal)
   - Enter Amount
   - Select Date
   - Enter Description
   - Upload Receipt Photo
   - Submit
   
   System:
   - Creates Expense record with status "pending"
   - Notifies Vendor/Accountant
   ```

---

### Phase 3: Financial Management (Vendor/Accountant)

#### Expense Approval

1. **Review Expenses**
   ```
   Vendor/Accountant → Expenses Page → View Pending Expenses
   ```

2. **Approve/Reject**
   ```
   Vendor → Review Expense → View Receipt Photo:
   - Click "Approve" → Status changes to "approved"
   - Click "Reject" → Enter reason → Status changes to "rejected"
   
   System:
   - Updates Expense status
   - If approved, adds to expense ledger
   ```

#### Invoice Generation (Monthly - Automated)

3. **Generate Monthly Invoices**
   ```
   On 1st of Month (Automated Job):
   
   For Each Society:
   1. Fetch all unbilled deliveries from previous month
   2. Calculate:
      - Total deliveries
      - Total liters
      - Subtotal (liters × delivery rate)
      - Tax (if applicable)
      - Total amount
   3. Generate Invoice PDF
   4. Save to database
   5. Send email/SMS/WhatsApp
   6. Update outstanding amount
   
   For Each Supplier (if needed):
   - Similar process for purchase invoices
   ```

4. **Manual Invoice Generation**
   ```
   Vendor → Invoices → Generate Monthly Invoice:
   - Select Society or Supplier
   - Select Date Range
   - Click Generate
   - System creates invoice with all deliveries/collections
   ```

#### Payment Processing

5. **Process Payments**
   ```
   Accountant → Payments → Add Payment:
   - Select Payment Type (purchase/delivery/expense)
   - Link to Invoice (optional - auto-fills amount)
   - Link to Expense (optional - auto-fills amount)
   - Enter Amount
   - Select Payment Method (cash/bank/UPI/cheque/card)
   - Enter Payment Date
   - Enter Reference Number
   - Add Notes
   - Submit
   
   System:
   - Creates Payment record
   - Updates Invoice status (if linked)
   - Updates Expense status to "paid" (if linked)
   - Updates Outstanding amounts
   ```

---

### Phase 4: Reports & Analytics

#### View Reports

1. **Profit & Loss Report**
   ```
   Vendor → Reports → Profit & Loss:
   - Select Date Range
   - View:
     * Revenue (from deliveries)
     * Costs (purchases + expenses)
     * Gross Profit
     * Net Profit
     * Profit Margin
   ```

2. **Outstanding Report**
   ```
   Vendor → Reports → Outstanding:
   - Filter by Type (supplier/society/all)
   - View:
     * Total Outstanding Amount
     * List of unpaid invoices
     * Due dates
     * Payment status
   ```

3. **Monthly Report**
   ```
   Vendor → Reports → Monthly:
   - Select Month & Year
   - View:
     * Total Deliveries
     * Total Collections
     * Revenue
     * Purchase Costs
     * Expenses
     * Net Profit
   ```

---

### Phase 5: Society Portal

1. **View Deliveries**
   ```
   Society Admin → Login → Dashboard:
   - View all deliveries
   - See consumption statistics
   - View delivery history
   ```

2. **View Invoices**
   ```
   Society Admin → Dashboard:
   - View all invoices
   - See payment status
   - View outstanding amounts
   ```

3. **Make Payment**
   ```
   Society Admin → Invoice → Click "Pay":
   - Enter payment details
   - Submit
   - System updates invoice status
   ```

---

## 📊 Data Flow Diagrams

### Water Collection Flow
```
Driver App
    ↓
Select Supplier
    ↓
Enter Quantity
    ↓
Capture GPS + Photo
    ↓
Submit → API: POST /api/collections
    ↓
Server calculates: Quantity × Purchase Rate
    ↓
Save to Database:
  - Collection record
  - Update Supplier ledger
  - Update Vehicle location
    ↓
Notify Vendor Dashboard
```

### Water Delivery Flow
```
Driver App
    ↓
Select Society
    ↓
Enter Quantity
    ↓
Capture GPS + Photo + Signature
    ↓
Submit → API: POST /api/deliveries
    ↓
Server calculates: Quantity × Delivery Rate
    ↓
Save to Database:
  - Delivery record
  - Update Society ledger
  - Add to Pending Invoice Items
  - Update Vehicle location
    ↓
Notify Vendor Dashboard
```

### Monthly Billing Flow
```
1st Day of Month (Automated)
    ↓
For Each Society:
    ↓
Fetch Unbilled Deliveries
    ↓
Calculate Totals
    ↓
Generate Invoice PDF
    ↓
Save Invoice Record
    ↓
Send Notification (Email/SMS)
    ↓
Update Outstanding Amount
```

### Expense Approval Flow
```
Driver submits expense
    ↓
Status: "pending"
    ↓
Vendor/Accountant reviews
    ↓
Approve → Status: "approved"
Reject → Status: "rejected" (with reason)
    ↓
If approved:
  - Add to expense ledger
  - Available for payment
```

### Payment Processing Flow
```
Accountant → Add Payment
    ↓
Link to Invoice/Expense (optional)
    ↓
Enter Payment Details
    ↓
Submit → API: POST /api/payments
    ↓
Server:
  - Creates Payment record
  - Updates Invoice status (if linked)
  - Updates Expense status (if linked)
  - Updates Outstanding amounts
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Collections
- `GET /api/collections` - Get all collections
- `POST /api/collections` - Create collection
- `GET /api/collections/:id` - Get collection by ID

### Deliveries
- `GET /api/deliveries` - Get all deliveries
- `POST /api/deliveries` - Create delivery
- `GET /api/deliveries/:id` - Get delivery by ID

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id/approve` - Approve/reject expense

### Invoices
- `GET /api/invoices` - Get all invoices
- `POST /api/invoices/generate-monthly` - Generate monthly invoice
- `PUT /api/invoices/:id/send` - Send invoice

### Payments
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Create payment

### Reports
- `GET /api/reports/profit-loss` - Profit & Loss report
- `GET /api/reports/outstanding` - Outstanding report
- `GET /api/reports/monthly` - Monthly report

---

## 🎯 Key Features

### 1. GPS Tracking
- Automatic location capture on collection/delivery
- Stored in database for verification
- Can be used for route optimization

### 2. Photo Capture
- Meter reading photos
- Receipt photos for expenses
- Stored in `/uploads` directory

### 3. Digital Signature
- Captured on delivery
- Stored as image file
- Proof of delivery

### 4. Automated Billing
- Monthly invoice generation
- Automatic calculation
- Email/SMS notifications

### 5. Financial Tracking
- Real-time profit/loss calculation
- Outstanding amount tracking
- Payment history

---

## 📱 Mobile App Flow (Driver)

```
Login Screen
    ↓
Dashboard (Today's Stats)
    ↓
┌─────────────────────────┐
│  Quick Actions:         │
│  - Log Collection       │
│  - Log Delivery         │
│  - Submit Expense       │
│  - View History         │
└─────────────────────────┘
    ↓
Collection Form:
  - Select Vehicle
  - Select Supplier
  - Enter Quantity
  - GPS (auto)
  - Photo (camera)
  - Submit
    ↓
Delivery Form:
  - Select Vehicle
  - Select Society
  - Enter Quantity
  - GPS (auto)
  - Photo (camera)
  - Signature (canvas)
  - Submit
    ↓
Expense Form:
  - Category
  - Amount
  - Date
  - Description
  - Receipt Photo
  - Submit
```

---

## 💡 Best Practices

1. **Daily Operations**
   - Drivers should log collections immediately after collection
   - Drivers should log deliveries immediately after delivery
   - Photos should be clear and readable

2. **Financial Management**
   - Review expenses daily
   - Approve/reject expenses promptly
   - Generate invoices on 1st of each month
   - Process payments regularly

3. **Data Accuracy**
   - Verify GPS locations
   - Check meter readings
   - Validate signatures
   - Review expense receipts

4. **Security**
   - Use strong passwords
   - Don't share login credentials
   - Log out after use
   - Report suspicious activity

---

## 🚀 Getting Started

1. **Setup Backend**
   ```bash
   cd server
   npm install
   # Configure .env
   npm run dev
   ```

2. **Setup Frontend**
   ```bash
   cd client
   npm install
   npm start
   ```

3. **Seed Database**
   ```bash
   cd server
   node scripts/seedData.js
   ```

4. **Login & Test**
   - Use seed data credentials
   - Test each role
   - Verify workflows

---

This workflow guide covers all aspects of the Watertank Platform. Use it as a reference for understanding how the system works end-to-end.

