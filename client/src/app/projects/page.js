'use client';
import { useAppContext } from '../providers/Provider';
import { useRouter } from 'next/navigation';
import Projects from '@/components/projects/Projects';
import Layout from '@/components/layout/Layout';

export default function ProjectsPage() {
  const {
    isSidebarCollapsed,
    statusFilter,
    searchQuery,
  } = useAppContext();

  const router = useRouter();

  const handleProjectSelect = (project) => {
    router.push(`/projects/${project.id}`);
  };

  return (
    <Layout>
      <Projects
        isCollapsed={isSidebarCollapsed}
        onProjectSelect={handleProjectSelect}
        selectedProject={null}
        statusFilter={statusFilter}
        searchQuery={searchQuery}
      />
    </Layout>
  );
}
