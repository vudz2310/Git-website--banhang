import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { SettingsProvider } from '../context/SettingsContext';

const Layout: React.FC = () => {
  return (
    <SettingsProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </SettingsProvider>
  );
};

export default Layout; 