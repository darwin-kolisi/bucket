'use client';
import { useAppContext } from '@/app/providers/Provider';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth-client';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const session = authClient.useSession();
  const isAuthRoute = pathname?.startsWith('/auth');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    if (isAuthRoute) {
      return;
    }
    if (session.isPending) {
      return;
    }
    if (!session.data) {
      router.replace('/auth');
    }
  }, [isAuthRoute, router, session.data, session.isPending]);

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
    ? projects.find((p) => p.id === projectId)
    : null;
  const contentClassName = isProjectView ? 'w-full' : 'content-shell';

  const handleItemSelect = (itemId) => {
    if (itemId === 'dashboard') {
      router.push('/dashboard');
    } else if (itemId === 'projects') {
      router.push('/projects');
    } else {
      router.push(`/${itemId}`);
    }
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleProjectSelect = (project) => {
    router.push(`/projects/${project.id}`);
  };

  const handleBackToProjects = () => {
    router.push('/projects');
  };

  const handleCreateProject = (type) => {
    console.log('Creating new project of type:', type);
  };

  const handleMenuClick = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  if (!isAuthRoute && (session.isPending || !session.data)) {
    return null;
  }

  return (
    <div className="app-container">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 right-0 z-[45] h-[var(--chrome-height)] border-b border-gray-200"
      />
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
        onToggleSidebar={toggleSidebar}
        onNavigate={handleItemSelect}
        isMobile={isMobile}
        isMobileMenuOpen={isMobileMenuOpen}
        onMenuClick={handleMenuClick}
      />
      <div className="main-content-wrapper">
        {isMobile && (
          <>
            <div
              aria-hidden="true"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`fixed inset-0 z-[55] bg-black/30 transition-opacity duration-200 ${
                isMobileMenuOpen
                  ? 'opacity-100'
                  : 'pointer-events-none opacity-0'
              }`}
            />
            <Sidebar
              activeItem={currentPage}
              onItemSelect={handleItemSelect}
              isCollapsed={false}
              onToggleCollapse={toggleSidebar}
              isMobile
              isOpen={isMobileMenuOpen}
              onClose={() => setIsMobileMenuOpen(false)}
            />
          </>
        )}
        {!isMobile && (
          <Sidebar
            activeItem={currentPage}
            onItemSelect={handleItemSelect}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={toggleSidebar}
          />
        )}
        <main
          className={`flex-1 overflow-y-auto pt-[var(--chrome-height)] pb-[var(--footer-height-mobile)] md:pb-[var(--footer-height)] transition-all duration-300 ease-in-out ${
            isMobile
              ? 'ml-0'
              : isSidebarCollapsed
                ? 'ml-[70px]'
                : 'ml-[220px]'
          }`}>
          <div className={contentClassName}>{children}</div>
        </main>
      </div>
      <Footer isCollapsed={isSidebarCollapsed} isMobile={isMobile} />
    </div>
  );
}
