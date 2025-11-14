# API Configuration Guide

## Issue Fixed
The frontend was trying to connect to `http://localhost:3000/api/auth/login` but the backend server runs on port `5004`.

## Solution Applied

### 1. Updated Proxy in package.json
Changed proxy from port 5000 to 5004:
```json
"proxy": "http://localhost:5004"
```

### 2. Created API Configuration File
Created `client/src/utils/api.js` with:
- Base URL configuration
- Automatic token injection
- Error handling for 401 (unauthorized)

### 3. Updated Auth Pages
Updated Login.js and Register.js to use the new `api` instance instead of direct `axios` calls.

## How It Works

### Using the API Instance
Instead of:
```javascript
import axios from 'axios';
axios.post('/api/auth/login', data);
```

Now use:
```javascript
import api from '../../utils/api';
api.post('/auth/login', data);
```

### Benefits
1. **Automatic Base URL**: All requests go to `http://localhost:5004/api`
2. **Auto Token Injection**: Token from localStorage is automatically added to headers
3. **Error Handling**: 401 errors automatically redirect to login
4. **Consistent Configuration**: One place to manage API settings

## Environment Variables

You can also set the API URL via environment variable:
```env
REACT_APP_API_URL=http://localhost:5004/api
```

## Testing

After making these changes:
1. Restart the React dev server (if running)
2. Try logging in again
3. The request should now go to `http://localhost:5004/api/auth/login`

## Note

The proxy in `package.json` works for development. In production, you'll need to:
1. Set `REACT_APP_API_URL` environment variable
2. Or configure your web server to proxy API requests
3. Or use CORS on the backend

