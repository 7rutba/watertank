# Server Structure

This directory contains the Express.js backend server for the MERN application.

## Folder Structure

```
server/
├── config/           # Configuration files
│   ├── database.js   # MongoDB connection
│   └── constants.js  # App constants
├── controllers/      # Route controllers (business logic)
│   └── healthController.js
├── middleware/       # Custom middleware
│   ├── errorHandler.js
│   └── notFound.js
├── models/          # Mongoose models
│   └── index.js
├── routes/          # API routes
│   └── index.js
├── utils/           # Utility functions
│   ├── asyncHandler.js
│   └── logger.js
├── server.js        # Main server file
├── package.json
└── .env            # Environment variables (not in git)
```

## Adding New Features

### 1. Create a Model
Create a new file in `models/` directory:
```javascript
// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
```

### 2. Create a Controller
Create a new file in `controllers/` directory:
```javascript
// controllers/userController.js
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json(users);
});

module.exports = { getUsers };
```

### 3. Create Routes
Create a new file in `routes/` directory:
```javascript
// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getUsers } = require('../controllers/userController');

router.get('/', getUsers);

module.exports = router;
```

### 4. Register Routes
Add to `routes/index.js`:
```javascript
const userRoutes = require('./userRoutes');
router.use('/users', userRoutes);
```

## Environment Variables

Create a `.env` file in the server directory:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/watertank
NODE_ENV=development
```

## Running the Server

```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

