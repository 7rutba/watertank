# Watertank Platform - Client

A modern React application built with Vite, Tailwind CSS v4, and basic UI components.

## 🚀 Tech Stack

- **React 19** - Latest React version
- **Vite 7** - Fast build tool and dev server
- **Tailwind CSS v4** - Latest Tailwind CSS with PostCSS
- **ES Modules** - Modern JavaScript modules

## 📦 Installation

```bash
cd client-new
npm install
```

## 🏃 Running the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🏗️ Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
client-new/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button/         # Button component
│   │   ├── Card/           # Card component
│   │   ├── Input/          # Input component
│   │   └── Container/      # Container component
│   ├── utils/              # Utility functions
│   │   ├── api.js         # Axios instance with interceptors
│   │   └── api.example.js # Example API usage
│   ├── App.jsx             # Main App component
│   ├── App.css             # App-specific styles
│   ├── index.css           # Global styles & Tailwind imports
│   └── main.jsx            # Entry point
├── public/                 # Static assets
├── index.html              # HTML template
├── vite.config.js          # Vite configuration
├── postcss.config.js       # PostCSS configuration
└── package.json            # Dependencies

```

## 🎨 UI Components

### Button
- Variants: `primary`, `secondary`, `success`, `danger`, `warning`, `info`, `outline`
- Sizes: `small`, `medium`, `large`
- Supports disabled state

### Card
- Title prop for card headers
- Responsive padding and shadows
- Customizable with className

### Input
- Label support
- Error state display
- Disabled state
- All standard input types

### Container
- Max-width container
- Responsive padding
- Centered content

## 🌐 API Configuration

### Axios Instance (`src/utils/api.js`)

A pre-configured axios instance with interceptors:

**Features:**
- ✅ Automatic token injection from localStorage
- ✅ Request/Response logging in development
- ✅ Automatic 401 handling (redirects to login)
- ✅ Error handling for network and server errors
- ✅ Configurable base URL via environment variables
- ✅ 10-second timeout

**Environment Variables:**
Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:5004/api
```

**Usage:**
```javascript
import api from './utils/api';

// GET request
const response = await api.get('/users');

// POST request
const response = await api.post('/users', { name: 'John' });

// With authentication (token automatically added)
const response = await api.get('/profile');
```

See `src/utils/api.example.js` for more examples.

## 🎨 Tailwind CSS Configuration

Custom theme variables are defined in `src/index.css` using Tailwind v4's `@theme` directive:

- Primary colors
- Success, Danger, Warning, Info colors
- Custom font families
- Light color variants

## 📱 Responsive Design

All components are mobile-first and fully responsive using Tailwind's responsive utilities.

## 🔧 Configuration Files

- **vite.config.js** - Vite configuration
- **postcss.config.js** - PostCSS with Tailwind CSS v4 plugin
- **package.json** - Dependencies and scripts

## 📝 Notes

- All components use `.jsx` extension
- Components are exported via `index.jsx` files
- ES Modules are used throughout (`"type": "module"` in package.json)
- Tailwind CSS v4 uses `@import "tailwindcss"` instead of traditional directives
