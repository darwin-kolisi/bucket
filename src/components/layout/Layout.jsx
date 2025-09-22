'use client';
import { useAppContext } from '@/app/providers/Provider';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

export default function Layout({ children }) {
  const {
    isSidebarCollapsed,
    toggleSidebar,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    projects,
  } = useAppContext();

  const [isMobile, setIsMobile] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getCurrentPage = () => {
    if (pathname === '/') return 'dashboard';
    if (pathname === '/dashboard') return 'dashboard';
    if (pathname === '/projects') return 'projects';
    if (pathname.startsWith('/projects/')) return 'projects';
    return pathname.split('/')[1] || 'dashboard';
  };

  const currentPage = getCurrentPage();

  const isProjectView =
    pathname.includes('/projects/') && pathname.split('/').length > 2;
  const projectId = isProjectView ? pathname.split('/')[2] : null;
  const currentProject = projectId
    ? projects.find((p) => p.name === projectId || p.id === parseInt(projectId))
    : null;

  const handleItemSelect = (itemId) => {
    if (itemId === 'dashboard') {
      router.push('/dashboard');
    } else if (itemId === 'projects') {
      router.push('/projects');
    } else {
      router.push(`/${itemId}`);
    }
  };

  const handleProjectSelect = (project) => {
    router.push(`/projects/${project.name}`);
  };

  const handleBackToProjects = () => {
    router.push('/projects');
  };

  const handleCreateProject = (type) => {
    console.log('Creating new project of type:', type);
  };

  const handleMenuClick = () => {
    console.log('Menu clicked on mobile');
  };

  return (
    <div className="app-container">
      <Header
        isCollapsed={isSidebarCollapsed}
        currentPage={currentPage}
        currentProject={currentProject}
        onBack={handleBackToProjects}
        onCreateProject={handleCreateProject}
        projects={projects}
        onProjectSelect={handleProjectSelect}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isMobile={isMobile}
        onMenuClick={handleMenuClick}
      />
      <div className="main-content-wrapper">
        {!isMobile && (
          <Sidebar
            activeItem={currentPage}
            onItemSelect={handleItemSelect}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={toggleSidebar}
          />
        )}
        <main
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isMobile ? 'ml-0' : isSidebarCollapsed ? 'ml-[88px]' : 'ml-[280px]'
          }`}>
          {children}
        </main>
      </div>
      <Footer isCollapsed={isSidebarCollapsed} isMobile={isMobile} />
    </div>
  );
}
