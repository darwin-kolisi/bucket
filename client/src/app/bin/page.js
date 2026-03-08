'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useAppContext } from '@/app/providers/Provider';
import { useErrorToast } from '@/components/ui/ErrorToastProvider';
import AppSelect from '@/components/ui/AppSelect';

const TRASH_RETENTION_DAYS = 30;

const trashFilterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Projects', value: 'projects' },
  { label: 'Tasks', value: 'tasks' },
  { label: 'Notifications', value: 'notifications' },
];

const formatDateTime = (value) => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
};

const formatExpiryDate = (value) => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  parsed.setDate(parsed.getDate() + TRASH_RETENTION_DAYS);
  return formatDateTime(parsed);
};

const buildTrashQuery = (workspaceId) => {
  const params = new URLSearchParams();
  if (workspaceId) {
    params.set('workspaceId', workspaceId);
  }
  return params.toString();
};

export default function BinPage() {
  const { pushError } = useErrorToast();
  const {
    selectedWorkspaceId,
    workspaces,
    refreshProjects,
    refreshNotifications,
  } = useAppContext();
  const [trashFilter, setTrashFilter] = useState('all');
  const [trashData, setTrashData] = useState({
    projects: [],
    tasks: [],
    notifications: [],
  });
  const [isTrashLoading, setIsTrashLoading] = useState(true);
  const [activeTrashAction, setActiveTrashAction] = useState('');

  const currentWorkspace = useMemo(
    () => workspaces.find((workspace) => workspace.id === selectedWorkspaceId) || null,
    [selectedWorkspaceId, workspaces]
  );

  const fetchTrash = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) {
        setIsTrashLoading(true);
      }

      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const query = buildTrashQuery(selectedWorkspaceId);
      const suffix = query ? `?${query}` : '';
      const notificationSuffix = suffix ? `${suffix}&limit=200` : '?limit=200';

      try {
        const [projectsResponse, tasksResponse, notificationsResponse] = await Promise.all([
          fetch(`${apiBase}/api/projects/trash${suffix}`, {
            credentials: 'include',
          }),
          fetch(`${apiBase}/api/tasks/trash${suffix}`, {
            credentials: 'include',
          }),
          fetch(`${apiBase}/api/notifications/trash${notificationSuffix}`, {
            credentials: 'include',
          }),
        ]);

        if (
          !projectsResponse.ok ||
          !tasksResponse.ok ||
          !notificationsResponse.ok
        ) {
          throw new Error('Failed to load bin');
        }

        const [projectsPayload, tasksPayload, notificationsPayload] = await Promise.all([
          projectsResponse.json(),
          tasksResponse.json(),
          notificationsResponse.json(),
        ]);

        setTrashData({
          projects: Array.isArray(projectsPayload?.projects) ? projectsPayload.projects : [],
          tasks: Array.isArray(tasksPayload?.tasks) ? tasksPayload.tasks : [],
          notifications: Array.isArray(notificationsPayload?.notifications)
            ? notificationsPayload.notifications
            : [],
        });
      } catch (error) {
        pushError(error?.message || 'Failed to load bin');
      } finally {
        if (!silent) {
          setIsTrashLoading(false);
        }
      }
    },
    [pushError, selectedWorkspaceId]
  );

  useEffect(() => {
    fetchTrash();
  }, [fetchTrash]);

  const runTrashAction = useCallback(
    async ({ actionKey, url, method, successKind }) => {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      setActiveTrashAction(actionKey);

      try {
        const response = await fetch(`${apiBase}${url}`, {
          method,
          credentials: 'include',
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error || 'Bin action failed');
        }

        await fetchTrash({ silent: true });

        if (successKind === 'project') {
          await refreshProjects();
        }

        if (successKind === 'notification') {
          await refreshNotifications({ silent: true });
        }
      } catch (error) {
        pushError(error?.message || 'Bin action failed');
      } finally {
        setActiveTrashAction('');
      }
    },
    [fetchTrash, pushError, refreshNotifications, refreshProjects]
  );

  const handleRestoreProject = async (projectId) => {
    await runTrashAction({
      actionKey: `project:${projectId}:restore`,
      url: `/api/projects/${projectId}/restore`,
      method: 'PATCH',
      successKind: 'project',
    });
  };

  const handleDeleteProjectPermanently = async (projectId) => {
    const confirmed = window.confirm('Permanently delete this project from bin?');
    if (!confirmed) return;

    await runTrashAction({
      actionKey: `project:${projectId}:delete`,
      url: `/api/projects/${projectId}/permanent`,
      method: 'DELETE',
      successKind: 'project',
    });
  };

  const handleRestoreTask = async (taskId) => {
    await runTrashAction({
      actionKey: `task:${taskId}:restore`,
      url: `/api/tasks/${taskId}/restore`,
      method: 'PATCH',
      successKind: 'task',
    });
  };

  const handleDeleteTaskPermanently = async (taskId) => {
    const confirmed = window.confirm('Permanently delete this task from bin?');
    if (!confirmed) return;

    await runTrashAction({
      actionKey: `task:${taskId}:delete`,
      url: `/api/tasks/${taskId}/permanent`,
      method: 'DELETE',
      successKind: 'task',
    });
  };

  const handleRestoreNotification = async (notificationId) => {
    await runTrashAction({
      actionKey: `notification:${notificationId}:restore`,
      url: `/api/notifications/${notificationId}/restore`,
      method: 'PATCH',
      successKind: 'notification',
    });
  };

  const handleDeleteNotificationPermanently = async (notificationId) => {
    const confirmed = window.confirm('Permanently delete this notification from bin?');
    if (!confirmed) return;

    await runTrashAction({
      actionKey: `notification:${notificationId}:delete`,
      url: `/api/notifications/${notificationId}/permanent`,
      method: 'DELETE',
      successKind: 'notification',
    });
  };

  const combinedTrashItems = useMemo(() => {
    const projects = trashData.projects.map((project) => ({
      kind: 'project',
      id: project.id,
      title: project.name,
      deletedAt: project.deletedAt,
      description: project.description || 'No description',
      meta: project.workspace?.name || 'Workspace project',
      detail: project.dueDate ? `Due ${formatDateTime(project.dueDate)}` : 'No due date',
      restoreLabel: 'Restore project',
      deleteLabel: 'Delete permanently',
      onRestore: () => handleRestoreProject(project.id),
      onDelete: () => handleDeleteProjectPermanently(project.id),
      actionKeyBase: `project:${project.id}`,
    }));

    const tasks = trashData.tasks.map((task) => {
      const parentProjectDeleted = Boolean(task.project?.deletedAt);
      return {
        kind: 'task',
        id: task.id,
        title: task.title,
        deletedAt: task.deletedAt,
        description: task.subtitle || 'No description',
        meta: task.project?.name || 'Project unavailable',
        detail: task.date || 'No due date',
        restoreLabel: parentProjectDeleted ? 'Restore project first' : 'Restore task',
        deleteLabel: 'Delete permanently',
        onRestore: () => handleRestoreTask(task.id),
        onDelete: () => handleDeleteTaskPermanently(task.id),
        actionKeyBase: `task:${task.id}`,
        restoreDisabled: parentProjectDeleted,
      };
    });

    const notifications = trashData.notifications.map((notification) => ({
      kind: 'notification',
      id: notification.id,
      title: notification.title,
      deletedAt: notification.deletedAt,
      description: notification.message,
      meta: notification.task?.title || notification.project?.name || 'Notification',
      detail: `Created ${formatDateTime(notification.createdAt)}`,
      restoreLabel: 'Restore notification',
      deleteLabel: 'Delete permanently',
      onRestore: () => handleRestoreNotification(notification.id),
      onDelete: () => handleDeleteNotificationPermanently(notification.id),
      actionKeyBase: `notification:${notification.id}`,
    }));

    const all = [...projects, ...tasks, ...notifications].sort((left, right) => {
      const leftTime = left.deletedAt ? new Date(left.deletedAt).getTime() : 0;
      const rightTime = right.deletedAt ? new Date(right.deletedAt).getTime() : 0;
      return rightTime - leftTime;
    });

    if (trashFilter === 'projects') return projects;
    if (trashFilter === 'tasks') return tasks;
    if (trashFilter === 'notifications') return notifications;
    return all;
  }, [trashData, trashFilter]);

  return (
    <Layout>
      <div className="mx-auto max-w-[1400px] p-6">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Bin</h1>
            <p className="mt-1 text-sm text-gray-500">
              Deleted projects, tasks, and notifications stay recoverable for{' '}
              {TRASH_RETENTION_DAYS} days.
            </p>
          </div>
          <div className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-gray-700">
            {currentWorkspace ? currentWorkspace.name : 'All workspaces'}
          </div>
        </div>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:w-[220px]">
              <AppSelect
                value={trashFilter}
                onChange={setTrashFilter}
                options={trashFilterOptions}
              />
            </div>
            <button
              type="button"
              onClick={() => fetchTrash()}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
              Refresh Bin
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {isTrashLoading ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                Loading bin...
              </div>
            ) : null}

            {!isTrashLoading && combinedTrashItems.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                <p className="text-sm font-medium text-gray-700">Bin is empty</p>
                <p className="mt-1 text-xs text-gray-500">
                  Deleted projects, tasks, and notifications will appear here.
                </p>
              </div>
            ) : null}

            {!isTrashLoading && combinedTrashItems.length > 0
              ? combinedTrashItems.map((item) => {
                  const isRestoring = activeTrashAction === `${item.actionKeyBase}:restore`;
                  const isDeletingItem = activeTrashAction === `${item.actionKeyBase}:delete`;

                  return (
                    <article
                      key={`${item.kind}:${item.id}`}
                      className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-gray-600">
                              {item.kind}
                            </span>
                            <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                            <span className="rounded bg-white px-2 py-1">{item.meta}</span>
                            <span className="rounded bg-white px-2 py-1">{item.detail}</span>
                            <span className="rounded bg-white px-2 py-1">
                              Deleted {formatDateTime(item.deletedAt)}
                            </span>
                            <span className="rounded bg-white px-2 py-1">
                              Auto-purge {formatExpiryDate(item.deletedAt)}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                          <button
                            type="button"
                            onClick={item.onRestore}
                            disabled={item.restoreDisabled || Boolean(activeTrashAction)}
                            className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50">
                            {isRestoring ? 'Restoring...' : item.restoreLabel}
                          </button>
                          <button
                            type="button"
                            onClick={item.onDelete}
                            disabled={Boolean(activeTrashAction)}
                            className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50">
                            {isDeletingItem ? 'Deleting...' : item.deleteLabel}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              : null}
          </div>
        </section>
      </div>
    </Layout>
  );
}
