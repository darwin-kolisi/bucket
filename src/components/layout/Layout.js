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
  const [selectedProject, setSelectedProject] = useState(null);

  const handleItemSelect = (itemId) => {
    setActiveItem(itemId);
    setSelectedProject(null);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleCreateProject = (type) => {
    console.log('Creating new project of type:', type);
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
  };

  const renderContent = () => {
    switch (activeItem) {
      case 'projects':
        return (
          <Projects
            isCollapsed={isSidebarCollapsed}
            onProjectSelect={handleProjectSelect}
            selectedProject={selectedProject}
          />
        );

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
      <Header
        isCollapsed={isSidebarCollapsed}
        currentPage={activeItem}
        currentProject={selectedProject}
        onBack={handleBackToProjects}
        onCreateProject={handleCreateProject}
      />
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
