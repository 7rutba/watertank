import React from 'react';
import { Outlet } from 'react-router-dom';
import LanguageSwitcher from '../components/LanguageSwitcher';
import Container from '../components/Container';
import './SocietyLayout.css';

const SocietyLayout = () => {
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
      <main className="society-main">
        <Container>
          <Outlet />
        </Container>
      </main>
    </div>
  );
};

export default SocietyLayout;

