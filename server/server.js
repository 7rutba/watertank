const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import configurations
const connectDB = require('./config/database');
const { PORT } = require('./config/constants');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Import routes
const routes = require('./routes');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads)
const path = require('path');
const { UPLOAD_PATH } = require('./config/constants');
app.use('/uploads', express.static(path.join(__dirname, UPLOAD_PATH)));

// API Routes
app.use('/api', routes);

// 404 Handler
app.use(notFound);

// Error Handler (must be last)
app.use(errorHandler);

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

