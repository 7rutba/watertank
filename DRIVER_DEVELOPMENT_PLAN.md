# Driver Features Development Plan

## 📋 Overview

**Status**: Backend APIs ✅ Complete | Frontend ❌ Missing  
**Priority**: HIGH (Drivers generate all platform data)  
**Target**: Mobile-First Design  
**Estimated Time**: 2-3 days

---

## 🎯 Features to Implement

### 1. Driver Layout (`/driver`)
### 2. Driver Dashboard (`/driver/dashboard`)
### 3. Log Collection (`/driver/collection`)
### 4. Log Delivery (`/driver/delivery`)
### 5. Submit Expense (`/driver/expense`)
### 6. Trip History (`/driver/history`)

---

## 📁 File Structure

```
client-new/src/
├── layouts/
│   └── DriverLayout.jsx          # Bottom navigation for mobile
├── pages/
│   └── Driver/
│       ├── Dashboard.jsx         # Today's stats, quick actions, recent trips
│       ├── LogCollection.jsx     # GPS + photo upload form
│       ├── LogDelivery.jsx        # GPS + photo + signature form
│       ├── SubmitExpense.jsx     # Expense submission form
│       ├── TripHistory.jsx       # Filterable list of trips
│       └── index.jsx             # Export all pages
├── components/
│   ├── SignatureCanvas.jsx       # Canvas component for signature capture
│   └── GPSLocation.jsx           # GPS location capture hook/component
└── hooks/
    └── useGeolocation.js         # Custom hook for GPS
```

---

## 🔌 API Endpoints Mapping

### ✅ Existing Backend APIs

#### Collections
- `GET /api/collections` - Get all collections (filtered by driverId)
- `GET /api/collections/:id` - Get single collection
- `POST /api/collections` - Create collection (requires `driverOnly` middleware)
  - Body: `{ vehicleId, supplierId, quantity, purchaseRate, location, meterPhoto, notes }`
  - File: `meterPhoto` (multipart/form-data)
- `PUT /api/collections/:id` - Update collection (requires `driverOnly`)

#### Deliveries
- `GET /api/deliveries` - Get all deliveries (filtered by driverId)
- `GET /api/deliveries/:id` - Get single delivery
- `POST /api/deliveries` - Create delivery (requires `driverOnly` middleware)
  - Body: `{ vehicleId, societyId, collectionId?, quantity, deliveryRate, location, meterPhoto, signature, signedBy, notes }`
  - Files: `meterPhoto`, `signature` (multipart/form-data)
- `PUT /api/deliveries/:id` - Update delivery (requires `driverOnly`)

#### Expenses
- `GET /api/expenses` - Get all expenses (filtered by driverId)
- `GET /api/expenses/:id` - Get single expense
- `POST /api/expenses` - Create expense (requires `driverOnly` middleware)
  - Body: `{ category, amount, expenseDate, description, receipt }`
  - File: `receipt` (multipart/form-data)
- `PUT /api/expenses/:id` - Update expense (requires `driverOnly`)

#### Supporting APIs (for dropdowns)
- `GET /api/vehicles` - Get all vehicles (for driver's vendor)
- `GET /api/suppliers` - Get all suppliers (for driver's vendor)
- `GET /api/societies` - Get all societies (for driver's vendor)

### ❌ Missing Backend APIs (Need to Create)

#### Driver Dashboard Stats
- `GET /api/driver/dashboard/stats` - Get driver-specific dashboard stats
  - Response: `{ todayCollections, todayDeliveries, todayRevenue, pendingExpenses }`
- `GET /api/driver/dashboard/recent-trips` - Get recent trips (collections + deliveries)
  - Response: `[{ type, id, date, location, quantity, amount, status }]`

**Action Required**: Create `server/controllers/driverDashboardController.js` and `server/routes/driverDashboardRoutes.js`

---

## 🛠️ Technical Implementation Details

### 1. Driver Layout (`DriverLayout.jsx`)

**Design**: Bottom navigation bar (mobile-first)

**Features**:
- Fixed bottom navigation with 5 icons
- Active route highlighting
- Mobile-responsive (hide labels on small screens, show icons only)
- Logout button in header or menu

**Navigation Items**:
1. 📊 Dashboard (`/driver/dashboard`)
2. 💧 Collection (`/driver/collection`)
3. 🚚 Delivery (`/driver/delivery`)
4. 💰 Expense (`/driver/expense`)
5. 📜 History (`/driver/history`)

**Code Structure**:
```jsx
<DriverLayout>
  <Outlet /> {/* Page content */}
  <BottomNav /> {/* Fixed bottom navigation */}
</DriverLayout>
```

---

### 2. Driver Dashboard (`Dashboard.jsx`)

**Statistics Cards** (4 cards):
1. **Today's Collections**
   - Count: Number of collections today
   - Icon: 💧
   - Color: Blue

2. **Today's Deliveries**
   - Count: Number of deliveries today
   - Icon: 🚚
   - Color: Green

3. **Today's Revenue**
   - Amount: Sum of delivery amounts today
   - Icon: 💵
   - Color: Gold

4. **Pending Expenses**
   - Count: Number of pending expenses
   - Icon: ⏳
   - Color: Orange

**Quick Actions** (3 buttons):
- Log Collection → Navigate to `/driver/collection`
- Log Delivery → Navigate to `/driver/delivery`
- Submit Expense → Navigate to `/driver/expense`

**Recent Trips**:
- Last 5-10 trips (collections + deliveries combined)
- Display: Date, Type (Collection/Delivery), Location, Quantity, Amount
- Click to view details
- Empty state: "No trips today"

**API Calls**:
- `GET /api/driver/dashboard/stats` (if exists)
- `GET /api/driver/dashboard/recent-trips` (if exists)
- OR: `GET /api/collections?driverId=current&limit=5` + `GET /api/deliveries?driverId=current&limit=5`

---

### 3. Log Collection (`LogCollection.jsx`)

**Form Fields**:

1. **Vehicle Selection** (Required)
   - Dropdown: Fetch from `GET /api/vehicles`
   - Filter: Only show vehicles assigned to driver (or all vendor vehicles)
   - Display: Vehicle Number + Type

2. **Supplier Selection** (Required)
   - Dropdown: Fetch from `GET /api/suppliers`
   - Display: Supplier Name

3. **Quantity** (Required)
   - Input: Number (liters)
   - Min: 1
   - Max: Vehicle capacity (if available)

4. **Purchase Rate** (Required)
   - Input: Number (₹/liter)
   - Auto-fill: From selected supplier's `purchaseRate`
   - Editable: Allow manual override

5. **GPS Location** (Required)
   - Auto-capture: Use browser Geolocation API
   - Display: Latitude, Longitude
   - Button: "Capture Location" or auto-capture on form load
   - Format: `{ latitude: number, longitude: number }`

6. **Meter Photo** (Required)
   - File input: `<input type="file" accept="image/*" capture="camera">`
   - Preview: Show selected image
   - Max size: 5MB
   - Formats: JPG, PNG

7. **Notes** (Optional)
   - Textarea: Multi-line text

**Calculations**:
- **Total Amount**: `quantity * purchaseRate` (auto-calculate, display readonly)

**Form Validation**:
- All required fields must be filled
- Quantity must be > 0
- Purchase rate must be > 0
- GPS location must be captured
- Meter photo must be uploaded

**Submit**:
- `POST /api/collections` with FormData
- Include: All form fields + meterPhoto file
- Show loading state
- Success: Show success message, reset form, navigate to dashboard or history
- Error: Show error message

**Mobile Considerations**:
- Large touch targets (min 44px)
- Camera capture on mobile
- GPS permission request
- Offline handling (store locally, sync later)

---

### 4. Log Delivery (`LogDelivery.jsx`)

**Form Fields**:

1. **Vehicle Selection** (Required)
   - Same as Collection form

2. **Society Selection** (Required)
   - Dropdown: Fetch from `GET /api/societies`
   - Display: Society Name

3. **Link Collection** (Optional)
   - Dropdown: Recent collections (last 10)
   - Purpose: Link delivery to a previous collection
   - Display: Collection date + supplier name

4. **Quantity** (Required)
   - Input: Number (liters)
   - Min: 1

5. **Delivery Rate** (Required)
   - Input: Number (₹/liter)
   - Auto-fill: From selected society's `deliveryRate`
   - Editable: Allow manual override

6. **GPS Location** (Required)
   - Same as Collection form

7. **Meter Photo** (Required)
   - Same as Collection form

8. **Digital Signature** (Required)
   - Canvas component: `SignatureCanvas.jsx`
   - Clear button: Reset canvas
   - Display: Show signature preview
   - Convert: Canvas to image (base64 or blob)

9. **Signed By** (Required)
   - Input: Text (name of person who signed)
   - Placeholder: "Enter signer's name"

10. **Notes** (Optional)
    - Textarea: Multi-line text

**Calculations**:
- **Total Amount**: `quantity * deliveryRate` (auto-calculate)

**Form Validation**:
- All required fields must be filled
- Signature must be captured (canvas not empty)
- Signed by name must be provided

**Submit**:
- `POST /api/deliveries` with FormData
- Include: All form fields + meterPhoto file + signature file
- Convert signature canvas to blob/file before sending

**Signature Canvas Component**:
- HTML5 Canvas element
- Touch/mouse support
- Clear button
- Export to image (PNG/JPEG)
- Responsive sizing

---

### 5. Submit Expense (`SubmitExpense.jsx`)

**Form Fields**:

1. **Category** (Required)
   - Dropdown: `['fuel', 'toll', 'maintenance', 'food', 'medical', 'personal', 'other']`
   - Display: Translated category names

2. **Amount** (Required)
   - Input: Number (₹)
   - Min: 0.01
   - Format: Currency input

3. **Expense Date** (Required)
   - Date picker: Default to today
   - Max: Today (can't be future date)
   - Format: DD/MM/YYYY

4. **Description** (Required)
   - Textarea: Multi-line text
   - Min length: 10 characters
   - Placeholder: "Describe the expense..."

5. **Receipt Photo** (Optional but recommended)
   - File input: `<input type="file" accept="image/*" capture="camera">`
   - Preview: Show selected image
   - Max size: 5MB

**Form Validation**:
- Category required
- Amount > 0
- Date required and not future
- Description min 10 chars
- Receipt recommended (show warning if missing)

**Submit**:
- `POST /api/expenses` with FormData
- Include: All form fields + receipt file (if provided)
- Success: Show success message, reset form
- Status: Automatically set to 'pending'

---

### 6. Trip History (`TripHistory.jsx`)

**Features**:

1. **Filters**:
   - Type: All / Collections / Deliveries (radio buttons or tabs)
   - Date Range: Start date + End date (date pickers)
   - Reset button: Clear all filters

2. **List View**:
   - Card-based layout (mobile-friendly)
   - Each card shows:
     - Type icon (💧 Collection / 🚚 Delivery)
     - Date & Time
     - Location (if available)
     - Quantity (liters)
     - Amount (₹)
     - Status badge
   - Click card: Open details modal

3. **Details Modal**:
   - Show all trip details
   - For Collection: Supplier, Vehicle, Purchase Rate, Meter Photo
   - For Delivery: Society, Vehicle, Delivery Rate, Meter Photo, Signature, Signed By
   - Close button

4. **Empty State**:
   - "No trips found" message
   - Show when filters return no results

5. **Pagination** (Optional):
   - Load more button
   - Or infinite scroll

**API Calls**:
- `GET /api/collections?driverId=current&startDate=...&endDate=...`
- `GET /api/deliveries?driverId=current&startDate=...&endDate=...`
- Combine results, sort by date (newest first)

**Data Processing**:
- Merge collections and deliveries into single array
- Add `type` field ('collection' or 'delivery')
- Sort by `createdAt` descending
- Filter by type if selected

---

## 🎨 UI/UX Considerations

### Mobile-First Design
- **Touch Targets**: Minimum 44x44px
- **Form Inputs**: Large, easy to tap
- **Bottom Navigation**: Fixed at bottom, always visible
- **Cards**: Full width on mobile, rounded corners
- **Spacing**: Generous padding (16px minimum)

### Colors & Icons
- **Collections**: Blue theme 💧
- **Deliveries**: Green theme 🚚
- **Expenses**: Orange theme 💰
- **Dashboard**: Multi-color cards
- **History**: Gray/neutral theme

### Loading States
- Show loading spinner during API calls
- Disable form submit button while submitting
- Show "Submitting..." text

### Error Handling
- Show error messages below form fields
- Toast notifications for success/error
- Network error handling
- GPS permission denied handling

### Accessibility
- Proper labels for all inputs
- ARIA attributes where needed
- Keyboard navigation support
- Screen reader friendly

---

## 🌐 Translation Keys Needed

Add to `client-new/src/i18n/locales/en.json` and `hi.json`:

```json
{
  "driver": {
    "dashboard": "Dashboard",
    "collection": "Collection",
    "delivery": "Delivery",
    "expense": "Expense",
    "history": "History",
    "todayCollections": "Today's Collections",
    "todayDeliveries": "Today's Deliveries",
    "todayRevenue": "Today's Revenue",
    "pendingExpenses": "Pending Expenses",
    "quickActions": "Quick Actions",
    "logCollection": "Log Collection",
    "logDelivery": "Log Delivery",
    "submitExpense": "Submit Expense",
    "recentTrips": "Recent Trips",
    "noTripsToday": "No trips today",
    "vehicle": "Vehicle",
    "selectVehicle": "Select Vehicle",
    "supplier": "Supplier",
    "selectSupplier": "Select Supplier",
    "society": "Society",
    "selectSociety": "Select Society",
    "quantity": "Quantity",
    "quantityLiters": "Quantity (Liters)",
    "purchaseRate": "Purchase Rate",
    "deliveryRate": "Delivery Rate",
    "ratePerLiter": "Rate per Liter (₹)",
    "gpsLocation": "GPS Location",
    "captureLocation": "Capture Location",
    "locationCaptured": "Location Captured",
    "meterPhoto": "Meter Photo",
    "takePhoto": "Take Photo",
    "selectPhoto": "Select Photo",
    "signature": "Signature",
    "signHere": "Sign Here",
    "clearSignature": "Clear Signature",
    "signedBy": "Signed By",
    "enterSignerName": "Enter signer's name",
    "linkCollection": "Link Collection (Optional)",
    "selectCollection": "Select Collection",
    "category": "Category",
    "selectCategory": "Select Category",
    "amount": "Amount",
    "expenseDate": "Expense Date",
    "description": "Description",
    "receiptPhoto": "Receipt Photo",
    "totalAmount": "Total Amount",
    "submit": "Submit",
    "submitting": "Submitting...",
    "collectionLogged": "Collection logged successfully",
    "deliveryLogged": "Delivery logged successfully",
    "expenseSubmitted": "Expense submitted successfully",
    "tripHistory": "Trip History",
    "filterByType": "Filter by Type",
    "all": "All",
    "collections": "Collections",
    "deliveries": "Deliveries",
    "dateRange": "Date Range",
    "startDate": "Start Date",
    "endDate": "End Date",
    "noTripsFound": "No trips found",
    "tripDetails": "Trip Details",
    "collectionDetails": "Collection Details",
    "deliveryDetails": "Delivery Details",
    "date": "Date",
    "time": "Time",
    "location": "Location",
    "status": "Status",
    "pending": "Pending",
    "completed": "Completed",
    "approved": "Approved",
    "rejected": "Rejected"
  }
}
```

---

## 🔧 Backend Work Required

### Create Driver Dashboard Controller

**File**: `server/controllers/driverDashboardController.js`

```javascript
const Collection = require('../models/Collection');
const Delivery = require('../models/Delivery');
const Expense = require('../models/Expense');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get driver dashboard stats
// @route   GET /api/driver/dashboard/stats
// @access  Private (Driver)
const getDriverDashboardStats = asyncHandler(async (req, res) => {
  const driverId = req.user._id;
  const vendorId = req.user.vendorId;
  
  // Today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Today's collections count
  const todayCollections = await Collection.countDocuments({
    driverId,
    vendorId,
    createdAt: { $gte: today, $lt: tomorrow },
  });
  
  // Today's deliveries count
  const todayDeliveries = await Delivery.countDocuments({
    driverId,
    vendorId,
    createdAt: { $gte: today, $lt: tomorrow },
  });
  
  // Today's revenue (from deliveries)
  const todayDeliveriesData = await Delivery.find({
    driverId,
    vendorId,
    createdAt: { $gte: today, $lt: tomorrow },
    status: 'completed',
  });
  const todayRevenue = todayDeliveriesData.reduce((sum, d) => sum + (d.totalAmount || 0), 0);
  
  // Pending expenses count
  const pendingExpenses = await Expense.countDocuments({
    driverId,
    vendorId,
    status: 'pending',
  });
  
  res.json({
    todayCollections,
    todayDeliveries,
    todayRevenue,
    pendingExpenses,
  });
});

// @desc    Get driver recent trips
// @route   GET /api/driver/dashboard/recent-trips
// @access  Private (Driver)
const getDriverRecentTrips = asyncHandler(async (req, res) => {
  const driverId = req.user._id;
  const vendorId = req.user.vendorId;
  const limit = parseInt(req.query.limit) || 10;
  
  // Get recent collections
  const collections = await Collection.find({ driverId, vendorId })
    .populate('supplierId', 'name')
    .populate('vehicleId', 'vehicleNumber')
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('supplierId vehicleId quantity totalAmount location createdAt status');
  
  // Get recent deliveries
  const deliveries = await Delivery.find({ driverId, vendorId })
    .populate('societyId', 'name')
    .populate('vehicleId', 'vehicleNumber')
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('societyId vehicleId quantity totalAmount location createdAt status');
  
  // Combine and format
  const trips = [];
  
  collections.forEach(c => {
    trips.push({
      id: c._id,
      type: 'collection',
      date: c.createdAt,
      location: c.location,
      quantity: c.quantity,
      amount: c.totalAmount,
      status: c.status,
      supplier: c.supplierId?.name,
      vehicle: c.vehicleId?.vehicleNumber,
    });
  });
  
  deliveries.forEach(d => {
    trips.push({
      id: d._id,
      type: 'delivery',
      date: d.createdAt,
      location: d.location,
      quantity: d.quantity,
      amount: d.totalAmount,
      status: d.status,
      society: d.societyId?.name,
      vehicle: d.vehicleId?.vehicleNumber,
    });
  });
  
  // Sort by date and limit
  trips.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  res.json(trips.slice(0, limit));
});

module.exports = {
  getDriverDashboardStats,
  getDriverRecentTrips,
};
```

### Create Driver Dashboard Routes

**File**: `server/routes/driverDashboardRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const { getDriverDashboardStats, getDriverRecentTrips } = require('../controllers/driverDashboardController');
const { protect, driverOnly } = require('../middleware/auth');

router.use(protect, driverOnly);

router.get('/dashboard/stats', getDriverDashboardStats);
router.get('/dashboard/recent-trips', getDriverRecentTrips);

module.exports = router;
```

### Update Main Routes

**File**: `server/routes/index.js`

Add:
```javascript
router.use('/driver', require('./driverDashboardRoutes'));
```

---

## ✅ Implementation Checklist

### Phase 1: Setup & Layout
- [ ] Create `DriverLayout.jsx` with bottom navigation
- [ ] Add driver routes to `App.jsx`
- [ ] Create `pages/Driver/index.jsx` exports
- [ ] Add driver translations to `en.json` and `hi.json`
- [ ] Test navigation between pages

### Phase 2: Dashboard
- [ ] Create `Dashboard.jsx`
- [ ] Implement stats cards (4 cards)
- [ ] Implement quick actions (3 buttons)
- [ ] Implement recent trips list
- [ ] Create/use driver dashboard API endpoints
- [ ] Test dashboard data loading

### Phase 3: Log Collection
- [ ] Create `LogCollection.jsx`
- [ ] Implement form fields
- [ ] Implement GPS location capture (`useGeolocation` hook)
- [ ] Implement photo upload with preview
- [ ] Implement form validation
- [ ] Implement form submission
- [ ] Test on mobile device

### Phase 4: Log Delivery
- [ ] Create `LogDelivery.jsx`
- [ ] Create `SignatureCanvas.jsx` component
- [ ] Implement form fields (including signature)
- [ ] Implement GPS location capture
- [ ] Implement photo upload
- [ ] Implement signature capture and conversion
- [ ] Implement form validation
- [ ] Implement form submission
- [ ] Test signature on mobile (touch)

### Phase 5: Submit Expense
- [ ] Create `SubmitExpense.jsx`
- [ ] Implement form fields
- [ ] Implement category dropdown
- [ ] Implement date picker
- [ ] Implement receipt photo upload
- [ ] Implement form validation
- [ ] Implement form submission
- [ ] Test form submission

### Phase 6: Trip History
- [ ] Create `TripHistory.jsx`
- [ ] Implement filters (type, date range)
- [ ] Implement trip list (collections + deliveries)
- [ ] Implement details modal
- [ ] Implement empty state
- [ ] Test filtering and sorting

### Phase 7: Backend APIs
- [ ] Create `driverDashboardController.js`
- [ ] Create `driverDashboardRoutes.js`
- [ ] Add routes to `server/routes/index.js`
- [ ] Test API endpoints

### Phase 8: Testing & Polish
- [ ] Test all forms on mobile devices
- [ ] Test GPS capture on mobile
- [ ] Test camera capture on mobile
- [ ] Test signature capture on mobile (touch)
- [ ] Test offline scenarios
- [ ] Fix any bugs
- [ ] Optimize performance
- [ ] Add loading states everywhere
- [ ] Add error handling everywhere

---

## 🚀 Implementation Order

1. **Day 1 Morning**: Setup & Layout + Dashboard
   - Create DriverLayout
   - Create Dashboard page
   - Add routes
   - Add translations

2. **Day 1 Afternoon**: Log Collection
   - Create LogCollection page
   - Implement GPS hook
   - Implement photo upload
   - Test form submission

3. **Day 2 Morning**: Log Delivery
   - Create SignatureCanvas component
   - Create LogDelivery page
   - Implement signature capture
   - Test signature on mobile

4. **Day 2 Afternoon**: Submit Expense + Trip History
   - Create SubmitExpense page
   - Create TripHistory page
   - Implement filters
   - Test all pages

5. **Day 3**: Backend APIs + Testing
   - Create driver dashboard APIs
   - Test all features on mobile
   - Fix bugs
   - Polish UI/UX

---

## 📱 Mobile Testing Checklist

- [ ] GPS location capture works
- [ ] Camera capture works (both file picker and camera)
- [ ] Signature capture works with touch
- [ ] Forms are easy to fill on mobile
- [ ] Bottom navigation is accessible
- [ ] All buttons are tappable (min 44px)
- [ ] Text is readable (min 16px font)
- [ ] Forms don't get cut off on small screens
- [ ] Loading states work correctly
- [ ] Error messages are visible
- [ ] Offline handling (if implemented)

---

## 🐛 Known Issues & Solutions

### GPS Permission Denied
- **Issue**: User denies GPS permission
- **Solution**: Show error message, allow manual location entry

### Camera Not Available
- **Issue**: Device doesn't have camera or permission denied
- **Solution**: Fallback to file picker, show warning

### Signature Not Capturing on Mobile
- **Issue**: Touch events not working on canvas
- **Solution**: Use touch event handlers (`touchstart`, `touchmove`, `touchend`)

### Large File Uploads
- **Issue**: Photo files too large
- **Solution**: Compress images before upload, show max size warning

### Network Errors
- **Issue**: API calls fail due to network issues
- **Solution**: Show retry button, store form data locally for later sync

---

## 📚 Resources

- [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [File API](https://developer.mozilla.org/en-US/docs/Web/API/File)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [FormData API](https://developer.mozilla.org/en-US/docs/Web/API/FormData)

---

**Last Updated**: After PDF Invoice Download completion  
**Next Action**: Start implementing Driver Layout and Dashboard

