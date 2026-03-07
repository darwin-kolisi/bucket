'use client';
import { useAppContext } from '@/app/providers/Provider';
import { useParams, useRouter } from 'next/navigation';
import ProjectKanban from '@/components/projects/ProjectKanban';
import Layout from '@/components/layout/Layout';
import NotFound from '@/components/layout/NotFound';

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const { projects, setProjects, isSidebarCollapsed } = useAppContext();
  const router = useRouter();

  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <Layout>
        <NotFound
          title="Project Not Found"
          message="That project was deleted, archived, or you no longer have access to it."
          primaryLabel="Back to Projects"
          primaryHref="/projects"
          secondaryLabel="Go to Dashboard"
          secondaryHref="/dashboard"
        />
      </Layout>
    );
  }

  const handleBackToProjects = () => {
    router.push('/projects');
  };

  const normalizeTaskStatus = (status) =>
    status?.toString().toLowerCase().replace(/_/g, '-') || 'todo';

  const getTaskCompletionUnits = (task) => {
    const subtasks = Array.isArray(task.subtasks) ? task.subtasks : [];
    if (subtasks.length === 0) {
      const status = normalizeTaskStatus(task.status);
      return { total: 1, completed: status === 'done' ? 1 : 0 };
    }
    const completed = subtasks.filter((subtask) => subtask?.completed).length;
    return { total: subtasks.length, completed };
  };

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
        const totals = updatedTasks.reduce(
          (acc, task) => {
            const units = getTaskCompletionUnits(task);
            acc.total += units.total;
            acc.completed += units.completed;
            return acc;
          },
          { total: 0, completed: 0 }
        );
        return {
          ...p,
          tasks: updatedTasks,
          totalTasks: totals.total,
          completedTasks: totals.completed,
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
