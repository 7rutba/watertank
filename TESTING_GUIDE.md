# Testing Guide - Watertank Platform

## 🚀 Quick Start

### 1. Setup Backend
```bash
cd server
npm install
# Create .env file:
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/watertank
# JWT_SECRET=your-secret-key-change-in-production
npm run dev
```

### 2. Seed Database
```bash
cd server
npm run seed
```

This will create:
- 1 Super Admin
- 1 Vendor
- 1 Accountant
- 2 Drivers
- 2 Suppliers
- 3 Societies (with 2 Society Admins)
- 3 Vehicles
- 20 Collections
- 30 Deliveries
- 15 Expenses
- 2 Invoices
- 10 Payments

### 3. Setup Frontend
```bash
cd client
npm install
npm start
```

---

## 📝 Test Credentials

### Super Admin 🔴
```
Email: admin@watertank.com
Password: admin123
Route: /admin/dashboard
```

### Vendor/Owner 🟢
```
Email: vendor@watertank.com
Password: vendor123
Route: /vendor/dashboard
```

### Accountant 💰
```
Email: accountant@watertank.com
Password: accountant123
Route: /vendor/dashboard
```

### Driver 1 🚛
```
Email: driver1@watertank.com
Password: driver123
Route: /driver/dashboard
Vehicle: MH-01-AB-1234
```

### Driver 2 🚛
```
Email: driver2@watertank.com
Password: driver123
Route: /driver/dashboard
Vehicle: MH-01-CD-5678
```

### Society Admin 1 🏘️
```
Email: society1@watertank.com
Password: society123
Route: /society/dashboard
Society: Green Valley Society
```

### Society Admin 2 🏘️
```
Email: society2@watertank.com
Password: society123
Route: /society/dashboard
Society: Sunshine Apartments
```

---

## 🧪 Testing Scenarios

### Scenario 1: Driver Daily Operations

1. **Login as Driver**
   - Go to `/login`
   - Use: `driver1@watertank.com` / `driver123`
   - Should redirect to `/driver/dashboard`

2. **Log Water Collection**
   - Click "Log Collection" or go to `/driver/collection`
   - Select Vehicle: `MH-01-AB-1234`
   - Select Supplier: `Ganga Water Source`
   - Enter Quantity: `8000` liters
   - Click "Get Location" (GPS)
   - Upload meter photo (or skip for testing)
   - Click "Submit"
   - Verify: Collection appears in dashboard

3. **Log Water Delivery**
   - Click "Log Delivery" or go to `/driver/delivery`
   - Select Vehicle: `MH-01-AB-1234`
   - Select Society: `Green Valley Society`
   - Link to Collection (optional)
   - Enter Quantity: `5000` liters
   - Click "Get Location" (GPS)
   - Upload meter photo
   - Draw signature (or skip for testing)
   - Enter Signed By: `Anil Mehta`
   - Click "Submit"
   - Verify: Delivery appears in dashboard

4. **Submit Expense**
   - Click "Submit Expense" or go to `/driver/expense`
   - Select Category: `Fuel`
   - Enter Amount: `500`
   - Select Date: Today
   - Enter Description: `Fuel for tanker`
   - Upload receipt photo (or skip)
   - Click "Submit"
   - Verify: Expense appears with "Pending" status

5. **View Trip History**
   - Click "Trip History" or go to `/driver/history`
   - Filter by type: All/Collection/Delivery
   - Filter by date range
   - Verify: All trips are listed

---

### Scenario 2: Vendor/Accountant Management

1. **Login as Vendor**
   - Go to `/login`
   - Use: `vendor@watertank.com` / `vendor123`
   - Should redirect to `/vendor/dashboard`

2. **View Dashboard**
   - Check statistics cards:
     * Today's Revenue
     * Monthly Profit
     * Active Vehicles
     * Pending Expenses
     * Outstanding Invoices
   - Check recent activities
   - Verify: All data is displayed

3. **Manage Suppliers**
   - Go to `/vendor/suppliers`
   - Click "Add Supplier"
   - Fill form:
     * Name: `New Supplier`
     * Contact Person: `John Doe`
     * Phone: `+91-9876543299`
     * Email: `new@supplier.com`
     * Purchase Rate: `3.00`
     * Payment Terms: `Credit 15 days`
     * Address: Fill all fields
   - Click "Add"
   - Verify: Supplier appears in list
   - Click "Edit" on any supplier
   - Modify details
   - Click "Save"
   - Verify: Changes are saved
   - Click "Delete" (confirm)
   - Verify: Supplier is removed

4. **Manage Societies**
   - Go to `/vendor/societies`
   - Similar to suppliers
   - Add/Edit/Delete societies
   - Verify: All operations work

5. **Manage Vehicles**
   - Go to `/vendor/vehicles`
   - Click "Add Vehicle"
   - Fill form:
     * Vehicle Number: `MH-01-GH-3456`
     * Type: `Tanker`
     * Capacity: `15000`
     * Driver: Select driver
   - Click "Add"
   - Verify: Vehicle appears in list

6. **Approve Expenses**
   - Go to `/vendor/expenses`
   - Filter: Pending
   - View expense details
   - Click "Approve" or "Reject"
   - If reject, enter reason
   - Verify: Status changes
   - Filter: Approved
   - Verify: Approved expenses appear

7. **Generate Invoice**
   - Go to `/vendor/invoices`
   - Click "Generate Monthly Invoice"
   - Select Type: `Society`
   - Select Society: `Green Valley Society`
   - Select Start Date: First day of last month
   - Select End Date: Last day of last month
   - Click "Generate Monthly Invoice"
   - Verify: Invoice is created
   - Click "Send Invoice"
   - Verify: Status changes to "Sent"

8. **Process Payment**
   - Go to `/vendor/payments`
   - Click "Add Payment"
   - Select Type: `Delivery`
   - Link to Invoice: Select invoice (auto-fills amount)
   - Select Payment Method: `UPI`
   - Enter Payment Date: Today
   - Enter Reference Number: `UPI123456`
   - Add Notes: `Payment received`
   - Click "Submit"
   - Verify: Payment is recorded

9. **View Reports**
   - Go to `/vendor/reports`
   - **Profit & Loss Tab:**
     * Select date range
     * View revenue, costs, profit
   - **Outstanding Tab:**
     * Filter by type
     * View outstanding invoices
   - **Monthly Tab:**
     * Select month and year
     * View monthly statistics

---

### Scenario 3: Society Admin

1. **Login as Society Admin**
   - Go to `/login`
   - Use: `society1@watertank.com` / `society123`
   - Should redirect to `/society/dashboard`

2. **View Dashboard**
   - Check statistics:
     * Total Deliveries
     * Total Consumption
     * Outstanding Invoices
     * Outstanding Amount
   - View recent deliveries
   - View invoices

3. **View Deliveries**
   - Check delivery history
   - Verify: Only deliveries for Green Valley Society
   - Check consumption statistics

4. **View Invoices**
   - Check invoice list
   - View invoice details
   - Click "Pay" button
   - Enter payment details
   - Submit payment
   - Verify: Invoice status updates

---

### Scenario 4: Super Admin

1. **Login as Super Admin**
   - Go to `/login`
   - Use: `admin@watertank.com` / `admin123`
   - Should redirect to `/admin/dashboard`

2. **View Dashboard**
   - Check platform statistics:
     * Total Vendors
     * Active Vendors
     * Subscriptions
     * Platform Revenue
   - View vendor list
   - Check vendor status and subscriptions

---

## 🔍 Testing Checklist

### Authentication
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (should show error)
- [ ] Register new user
- [ ] Role-based redirect after login
- [ ] Protected routes (try accessing without login)
- [ ] Logout functionality

### Driver Features
- [ ] View dashboard
- [ ] Log collection (with GPS and photo)
- [ ] Log delivery (with GPS, photo, signature)
- [ ] Submit expense
- [ ] View trip history
- [ ] Filter trips by type and date

### Vendor Features
- [ ] View dashboard with statistics
- [ ] Add/Edit/Delete suppliers
- [ ] Add/Edit/Delete societies
- [ ] Add/Edit/Delete vehicles
- [ ] Approve/Reject expenses
- [ ] Generate invoices
- [ ] Process payments
- [ ] View reports (P&L, Outstanding, Monthly)

### Society Features
- [ ] View dashboard
- [ ] View deliveries
- [ ] View invoices
- [ ] Make payments

### Admin Features
- [ ] View platform dashboard
- [ ] View vendor list
- [ ] View vendor details

### Mobile Responsiveness
- [ ] Test on mobile viewport (< 768px)
- [ ] Test on tablet viewport (768px - 991px)
- [ ] Test on desktop viewport (> 992px)
- [ ] Verify touch targets are large enough
- [ ] Verify navigation works on mobile

### Internationalization
- [ ] Switch to Hindi
- [ ] Verify all text is translated
- [ ] Switch back to English
- [ ] Verify language persists on refresh

---

## 🐛 Common Issues & Solutions

### Issue: Cannot connect to MongoDB
**Solution**: 
- Check MongoDB is running: `mongod`
- Verify MONGO_URI in .env file
- Check MongoDB connection string format

### Issue: JWT token errors
**Solution**:
- Check JWT_SECRET in .env file
- Verify token is being sent in Authorization header
- Check token expiration

### Issue: File upload not working
**Solution**:
- Check uploads directory exists: `mkdir -p server/uploads`
- Verify multer configuration
- Check file size limits

### Issue: GPS location not capturing
**Solution**:
- Check browser permissions for location
- Test on HTTPS (required for geolocation API)
- Use browser dev tools to check console errors

### Issue: Routes not working
**Solution**:
- Verify React Router is installed
- Check route paths match exactly
- Verify ProtectedRoute component is working
- Check role permissions

---

## 📊 Sample Data Created

### Suppliers
- **Ganga Water Source**: ₹2.50/liter, Credit 15 days
- **Yamuna Water Supply**: ₹2.75/liter, Cash

### Societies
- **Green Valley Society**: ₹5.00/liter, Credit 30 days
- **Sunshine Apartments**: ₹5.50/liter, Credit 30 days
- **Royal Heights**: ₹6.00/liter, Cash

### Vehicles
- **MH-01-AB-1234**: Tanker, 10,000L, Driver: Amit Kumar
- **MH-01-CD-5678**: Tanker, 12,000L, Driver: Suresh Singh
- **MH-01-EF-9012**: Tractor, 8,000L, No driver assigned

### Collections & Deliveries
- 20 collections from past 30 days
- 30 deliveries to societies
- Random quantities and dates

### Expenses
- 15 expenses with various categories
- Mix of pending, approved, rejected, paid statuses

### Invoices
- 2 invoices for societies (last month)
- One paid, one sent

### Payments
- 10 payment records
- Various types and methods

---

## 🎯 Next Steps After Testing

1. **Verify all features work**
2. **Test edge cases**
3. **Check error handling**
4. **Test performance**
5. **Deploy to production**

---

Happy Testing! 🚀

