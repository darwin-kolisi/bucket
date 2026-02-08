'use client';
import { useAppContext } from '@/app/providers/Provider';
import { useParams, useRouter } from 'next/navigation';
import ProjectKanban from '@/components/projects/ProjectKanban';
import Layout from '@/components/layout/Layout';

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const { projects, setProjects, isSidebarCollapsed } = useAppContext();
  const router = useRouter();

  const project = projects.find((p) => p.id === projectId);

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

  const normalizeTaskStatus = (status) =>
    status?.toString().toLowerCase().replace(/_/g, '-') || 'todo';

  const computeProjectStatus = (tasks) => {
    if (!tasks.length) {
      return 'in_progress';
    }

    const now = new Date();
    const hasOverdueTask = tasks.some((task) => {
      const normalizedStatus = normalizeTaskStatus(task.status);
      if (!task.dueDate || normalizedStatus === 'done') return false;
      const dueDate = new Date(task.dueDate);
      if (Number.isNaN(dueDate.getTime())) return false;
      return dueDate < now;
    });

    if (hasOverdueTask) {
      return 'at_risk';
    }

    const allDone = tasks.every(
      (task) => normalizeTaskStatus(task.status) === 'done'
    );
    if (allDone) {
      return 'completed';
    }

    const anyProgress = tasks.some((task) => {
      const normalizedStatus = normalizeTaskStatus(task.status);
      return (
        normalizedStatus === 'in-progress' ||
        normalizedStatus === 'in-review' ||
        normalizedStatus === 'done'
      );
    });

    return anyProgress ? 'on_track' : 'in_progress';
  };

  const updateProjectTasks = (updatedTasks) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== project.id) return p;
        const totalTasks = updatedTasks.length;
        const completedTasks = updatedTasks.filter(
          (task) => normalizeTaskStatus(task.status) === 'done'
        ).length;
        return {
          ...p,
          tasks: updatedTasks,
          totalTasks,
          completedTasks,
          status: computeProjectStatus(updatedTasks),
        };
      })
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
