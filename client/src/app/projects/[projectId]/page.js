'use client';
import { useAppContext } from '@/app/providers/Provider';
import { useParams, useRouter } from 'next/navigation';
import ProjectKanban from '@/components/projects/ProjectKanban';
import Layout from '@/components/layout/Layout';

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const { projects, setProjects, isSidebarCollapsed } = useAppContext();
  const router = useRouter();

  const project = projects.find(
    (p) => p.name === projectId || p.id === parseInt(projectId)
  );

  if (!project) {
    return (
      <Layout>
        <div className="overflow-y-auto flex-1 bg-white">
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-800">
              Project Not Found
            </h1>
            <p className="mt-4 max-w-sm text-base text-gray-600">
              The project you are looking for does not exist.
            </p>
            <button
              onClick={() => router.push('/projects')}
              className="mt-8 flex items-center justify-center rounded-lg border border-gray-800 bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-900">
              Back to Projects
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleBackToProjects = () => {
    router.push('/projects');
  };

  const updateProjectTasks = (updatedTasks) => {
    setProjects(
      projects.map((p) =>
        p.id === project.id ? { ...p, tasks: updatedTasks } : p
      )
    );
  };

  return (
    <Layout>
      <ProjectKanban
        project={project}
        onBack={handleBackToProjects}
        isCollapsed={isSidebarCollapsed}
        tasks={project.tasks}
        onUpdateTasks={updateProjectTasks}
      />
    </Layout>
  );
}
