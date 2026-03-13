'use client';
import { useEffect, useState } from 'react';
import { useAppContext } from '@/app/providers/Provider';
import { useParams, useRouter } from 'next/navigation';
import ProjectKanban from '@/components/projects/ProjectKanban';
import Layout from '@/components/layout/Layout';
import NotFound from '@/components/layout/NotFound';

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const { projects, setProjects, isSidebarCollapsed } = useAppContext();
  const router = useRouter();
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const [isProjectLoading, setIsProjectLoading] = useState(true);
  const [isProjectMissing, setIsProjectMissing] = useState(false);

  const project = projects.find((p) => p.id === projectId);

  useEffect(() => {
    let isMounted = true;

    const loadProject = async () => {
      if (!projectId) {
        if (isMounted) {
          setIsProjectMissing(true);
          setIsProjectLoading(false);
        }
        return;
      }

      if (project) {
        if (isMounted) {
          setIsProjectMissing(false);
          setIsProjectLoading(false);
        }
        return;
      }

      if (isMounted) {
        setIsProjectLoading(true);
      }

      try {
        const response = await fetch(`${apiBase}/api/projects/${projectId}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          if (isMounted) {
            setIsProjectMissing(true);
          }
          return;
        }

        const data = await response.json();
        if (!data?.project) {
          if (isMounted) {
            setIsProjectMissing(true);
          }
          return;
        }

        if (isMounted) {
          setProjects((prev) => {
            const existingIndex = prev.findIndex((item) => item.id === data.project.id);
            if (existingIndex === -1) {
              return [...prev, data.project];
            }
            return prev.map((item) => (item.id === data.project.id ? data.project : item));
          });
          setIsProjectMissing(false);
        }
      } catch (error) {
        if (isMounted) {
          setIsProjectMissing(true);
        }
      } finally {
        if (isMounted) {
          setIsProjectLoading(false);
        }
      }
    };

    loadProject();

    return () => {
      isMounted = false;
    };
  }, [apiBase, projectId, project, setProjects]);

  if (isProjectLoading) {
    return (
      <Layout>
        <div className="p-6 text-sm text-gray-500">Loading project...</div>
      </Layout>
    );
  }

  if (!project && isProjectMissing) {
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

  if (!project) {
    return null;
  }

  const handleBackToProjects = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
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
