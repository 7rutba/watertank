import React from 'react';
import { Outlet } from 'react-router-dom';
import LanguageSwitcher from '../components/LanguageSwitcher';
import VendorNav from '../components/VendorNav';
import Container from '../components/Container';
import './VendorLayout.css';

const VendorLayout = () => {
  return (
    <div className="App">
      <header className="App-topbar">
        <Container>
          <div className="topbar-content">
            <h1 className="app-logo">Watertank</h1>
            <LanguageSwitcher />
          </div>
        </Container>
      </header>
      <VendorNav />
      <main className="vendor-main">
        <Container>
          <Outlet />
        </Container>
      </main>
    </div>
  );
};

export default VendorLayout;

