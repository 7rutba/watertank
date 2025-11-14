# Watertank Client - Mobile Responsive with i18n Support

## Features

✅ **Mobile Responsive Design**
- Mobile-first approach
- Responsive breakpoints (320px, 576px, 768px, 992px, 1200px)
- Touch-friendly buttons (min 44px height)
- Optimized typography for mobile
- Flexible layouts

✅ **Internationalization (i18n)**
- English and Hindi language support
- Language switcher component
- Automatic language detection
- Persistent language preference (localStorage)
- Noto Sans Devanagari font for Hindi

## Installation

```bash
npm install
```

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests

## Language Support

The app supports two languages:
- **English (en)** - Default
- **Hindi (hi)** - हिंदी

Language preference is saved in localStorage and persists across sessions.

## Mobile Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 991px
- **Desktop**: ≥ 992px

## Components

All components are mobile-responsive:
- **Button** - Full width on mobile, auto width on desktop
- **Card** - Responsive padding and font sizes
- **Input** - Touch-friendly (44px min height)
- **Container** - Responsive padding
- **LanguageSwitcher** - Compact on mobile

## Usage

### Using Translations

```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return <h1>{t('common.welcome')}</h1>;
}
```

### Changing Language

```jsx
import LanguageSwitcher from './components/LanguageSwitcher';

<LanguageSwitcher />
```

### Responsive Utilities

```jsx
import { isMobile, isTablet, isDesktop } from './utils/responsive';

if (isMobile()) {
  // Mobile-specific code
}
```

## Translation Keys

All translation keys are organized by feature:
- `common.*` - Common UI elements
- `nav.*` - Navigation items
- `auth.*` - Authentication
- `dashboard.*` - Dashboard
- `collection.*` - Water collection
- `delivery.*` - Water delivery
- `vehicle.*` - Vehicles
- `supplier.*` - Suppliers
- `society.*` - Societies
- `expense.*` - Expenses
- `payment.*` - Payments
- `invoice.*` - Invoices
- `report.*` - Reports
- `language.*` - Language switcher

## Adding New Translations

1. Add keys to `src/i18n/locales/en.json`
2. Add Hindi translations to `src/i18n/locales/hi.json`
3. Use `t('key.path')` in components

## Mobile Optimization

- Touch targets are minimum 44x44px
- Font sizes scale down on mobile
- Buttons stack vertically on mobile
- Cards have reduced padding on mobile
- Container padding adjusts for screen size

