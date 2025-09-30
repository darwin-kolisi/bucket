'use client';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/components/dashboard/Dashboard';
import { useAppContext } from '@/app/providers/Provider';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { projects } = useAppContext();
  const router = useRouter();

  const handleProjectSelect = (project) => {
    router.push(`/projects/${project.name}`);
  };

  const handleNavigate = (page) => {
    router.push(`/${page}`);
  };

  return (
    <Layout>
      <Dashboard
        onProjectSelect={handleProjectSelect}
        onNavigate={handleNavigate}
      />
    </Layout>
  );
}
