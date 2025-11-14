import React from 'react';
import { Outlet } from 'react-router-dom';
import DriverNav from '../components/DriverNav';
import LanguageSwitcher from '../components/LanguageSwitcher';
import './DriverLayout.css';

const DriverLayout = () => {
  return (
    <div className="driver-layout">
      <header className="driver-header">
        <div className="header-content">
          <h1 className="app-title">Watertank</h1>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="driver-main">
        <Outlet />
      </main>

      <DriverNav />
    </div>
  );
};

export default DriverLayout;

