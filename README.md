# Watertank Multi-Vendor SaaS Platform

A complete MERN stack application for managing water tanker businesses with multi-vendor support, GPS tracking, automated billing, and comprehensive financial management.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB (v4+)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd watertank
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   ```

3. **Configure Environment Variables**
   Create `.env` file in `server/` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/watertank
   JWT_SECRET=your-secret-key-change-in-production
   JWT_EXPIRE=30d
   NODE_ENV=development
   ```

4. **Seed Database**
   ```bash
   npm run seed
   ```
   This creates sample data for testing. See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for credentials.

5. **Start Backend Server**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:5000`

6. **Setup Frontend**
   ```bash
   cd ../client
   npm install
   ```

7. **Start Frontend**
   ```bash
   npm start
   ```
   App runs on `http://localhost:3000`

## 📚 Documentation

- **[WORKFLOW.md](./WORKFLOW.md)** - Complete workflow and data flow documentation
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Testing scenarios and test credentials
- **[COMPLETE_FEATURES.md](./COMPLETE_FEATURES.md)** - Complete features list
- **[VENDOR_FEATURES.md](./VENDOR_FEATURES.md)** - Vendor features documentation

## 👥 User Roles

1. **Super Admin** - Platform management
2. **Vendor/Owner** - Business management
3. **Accountant** - Financial management
4. **Driver** - Daily operations (mobile app)
5. **Society Admin** - Society portal

## 🎯 Key Features

- ✅ Multi-vendor support
- ✅ Water collection & delivery tracking
- ✅ GPS location capture
- ✅ Photo upload (meter readings, receipts)
- ✅ Digital signature capture
- ✅ Automated monthly billing
- ✅ Expense management & approval
- ✅ Payment processing
- ✅ Financial reports (P&L, Outstanding, Monthly)
- ✅ Mobile-responsive design
- ✅ Hindi/English language support

## 📱 Routes

### Public
- `/login` - Login page
- `/register` - Register page

### Driver (`/driver/*`)
- `/driver/dashboard` - Driver dashboard
- `/driver/collection` - Log collection
- `/driver/delivery` - Log delivery
- `/driver/expense` - Submit expense
- `/driver/history` - Trip history

### Vendor/Accountant (`/vendor/*`)
- `/vendor/dashboard` - Dashboard
- `/vendor/suppliers` - Manage suppliers
- `/vendor/societies` - Manage societies
- `/vendor/vehicles` - Manage vehicles
- `/vendor/expenses` - Approve expenses
- `/vendor/invoices` - Generate invoices
- `/vendor/payments` - Process payments
- `/vendor/reports` - View reports

### Society Admin (`/society/*`)
- `/society/dashboard` - Society dashboard

### Super Admin (`/admin/*`)
- `/admin/dashboard` - Admin dashboard

## 🧪 Test Credentials

After running `npm run seed`:

**Super Admin:**
- Email: `admin@watertank.com`
- Password: `admin123`

**Vendor:**
- Email: `vendor@watertank.com`
- Password: `vendor123`

**Accountant:**
- Email: `accountant@watertank.com`
- Password: `accountant123`

**Driver:**
- Email: `driver1@watertank.com` or `driver2@watertank.com`
- Password: `driver123`

**Society Admin:**
- Email: `society1@watertank.com` or `society2@watertank.com`
- Password: `society123`

## 🛠️ Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Multer (File Uploads)
- Bcryptjs (Password Hashing)

### Frontend
- React
- React Router DOM
- Axios
- i18next (Internationalization)
- CSS Variables (Theming)

## 📁 Project Structure

```
watertank/
├── server/           # Backend API
│   ├── config/      # Configuration files
│   ├── controllers/ # Route controllers
│   ├── middleware/  # Custom middleware
│   ├── models/      # Mongoose models
│   ├── routes/      # API routes
│   ├── scripts/     # Seed scripts
│   └── utils/       # Utility functions
│
├── client/          # Frontend React app
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── layouts/     # Layout components
│   │   ├── pages/       # Page components
│   │   ├── i18n/        # Translations
│   │   └── utils/       # Utility functions
│   └── public/
│
└── docs/            # Documentation files
```

## 🔧 Development

### Backend Scripts
```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
npm run seed     # Seed database with sample data
```

### Frontend Scripts
```bash
npm start        # Start development server
npm build        # Build for production
npm test         # Run tests
```

## 📝 API Endpoints

See [WORKFLOW.md](./WORKFLOW.md) for complete API documentation.

## 🌐 Internationalization

The app supports:
- **English** (en)
- **Hindi** (hi)

Language can be switched using the language switcher in the header.

## 📱 Mobile Responsive

The application is fully responsive:
- Mobile (< 768px)
- Tablet (768px - 991px)
- Desktop (≥ 992px)

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Protected routes
- Input validation

## 📄 License

ISC

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines first.

## 📧 Support

For support, email support@watertank.com or create an issue in the repository.

---

**Built with ❤️ for water tanker businesses**
