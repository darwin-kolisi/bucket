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
  const [statusFilter, setStatusFilter] = useState('all');

  const initialProjects = [
    {
      id: 1,
      name: 'bucket',
      description: 'project management app',
      dueDate: '15 Aug 2025',
      status: 'In Progress',
      tasks: [
        {
          id: 1,
          title: 'Create landing page design',
          subtitle: 'Marketing website',
          date: '15 Aug 2024',
          progress: 0,
          total: 10,
          status: 'todo',
          priority: 'high',
          subtasks: [
            { id: 1, title: 'Design header section', completed: false },
            { id: 2, title: 'Create hero banner', completed: false },
            { id: 3, title: 'Design footer', completed: false },
          ],
        },
        {
          id: 2,
          title: 'Update component library',
          subtitle: 'Design system',
          date: '18 Aug 2024',
          progress: 0,
          total: 8,
          status: 'todo',
          priority: 'low',
        },
      ],
    },
    {
      id: 2,
      name: 'consumption-doc',
      description: 'media log',
      dueDate: '18 Aug 2025',
      status: 'On Track',
      tasks: [
        {
          id: 1,
          title: 'Design media upload interface',
          subtitle: 'User experience',
          date: '16 Aug 2024',
          progress: 0,
          total: 8,
          status: 'todo',
          priority: 'high',
        },
        {
          id: 2,
          title: 'Implement search functionality',
          subtitle: 'Backend integration',
          date: '19 Aug 2024',
          progress: 0,
          total: 6,
          status: 'todo',
          priority: 'medium',
        },
      ],
    },
    {
      id: 3,
      name: 'beep boop',
      description: 'my resume/cv website',
      dueDate: '20 Aug 2025',
      status: 'At Risk',
      tasks: [],
    },
    {
      id: 4,
      name: 'employment',
      description: 'get a job...',
      dueDate: '25 Aug 2025',
      status: 'At Risk',
      tasks: [],
    },
    {
      id: 5,
      name: 'physics',
      description: 'want to get into circuits and physics',
      dueDate: '28 Aug 2025',
      status: 'At Risk',
      tasks: [],
    },
  ];

  const [projects, setProjects] = useState(initialProjects);

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
            projects={projects}
            setProjects={setProjects}
            statusFilter={statusFilter}
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
        projects={projects}
        onProjectSelect={handleProjectSelect}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
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
