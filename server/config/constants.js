module.exports = {
  PORT: process.env.PORT || 5004,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  UPLOAD_PATH: process.env.UPLOAD_PATH || 'uploads',
};

