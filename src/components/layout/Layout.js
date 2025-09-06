'use client';

import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import Projects from '../projects/Projects';
import Dashboard from '../dashboard/Dashboard';

export default function Layout({ children }) {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleItemSelect = (itemId) => {
    setActiveItem(itemId);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Render content based on active item
  const renderContent = () => {
    switch (activeItem) {
      case 'dashboard':
        return <Dashboard />;
      case 'projects':
        return <Projects />;
      case 'calendar':
        return <div>Calendar coming soon...</div>;
      case 'personal':
      case 'work':
      case 'learning':
        return <div>{activeItem} bucket coming soon...</div>;
      default:
        return children;
    }
  };

  return (
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
        <main className="content-area">{renderContent()}</main>
      </div>
      <Footer />
    </div>
  );
}
