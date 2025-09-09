'use client';

import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import Projects from '../projects/Projects';
import NotFound from './NotFound';

export default function Layout({ children }) {
  const [activeItem, setActiveItem] = useState('projects');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleItemSelect = (itemId) => {
    setActiveItem(itemId);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const renderContent = () => {
    switch (activeItem) {
      case 'projects':
        // Pass the isCollapsed prop to Projects
        return <Projects isCollapsed={isSidebarCollapsed} />;

      // All other cases will now render the NotFoundPage
      case 'dashboard':
      case 'calendar':
      case 'personal':
      case 'work':
      case 'learning':
        return <NotFound isCollapsed={isSidebarCollapsed} />;

      default:
        return children;
    }
  };

  return (
    <div
      className={`app-container ${
        isSidebarCollapsed ? 'sidebar-collapsed' : ''
      }`}>
      <Header isCollapsed={isSidebarCollapsed} />
      <div className="main-content-wrapper">
        <Sidebar
          activeItem={activeItem}
          onItemSelect={handleItemSelect}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />
        <main className="content-area">{renderContent()}</main>
      </div>
      <Footer isCollapsed={isSidebarCollapsed} />
    </div>
  );
}
