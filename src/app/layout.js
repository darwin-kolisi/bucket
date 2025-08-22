'use client';
import { useState } from 'react';
import { Geist } from 'next/font/google';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export default function RootLayout({ children }) {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleItemSelect = (itemId) => {
    setActiveItem(itemId);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <html lang="en">
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <div
          className={`app-container ${
            isSidebarCollapsed ? 'sidebar-collapsed' : ''
          }`}>
          <Header />
          <div className="main-container">
            <Sidebar
              activeItem={activeItem}
              onItemSelect={handleItemSelect}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={toggleSidebar}
            />
            <main className="content-area">{children}</main>
          </div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
