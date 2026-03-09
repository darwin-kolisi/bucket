'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const Context = createContext();
const WORKSPACE_STORAGE_KEY = 'bucket-workspace-id';

const sortNotifications = (items) =>
  [...items].sort((left, right) => {
    const leftStarred = left?.starredAt ? new Date(left.starredAt).getTime() : 0;
    const rightStarred = right?.starredAt ? new Date(right.starredAt).getTime() : 0;
    if (rightStarred !== leftStarred) {
      return rightStarred - leftStarred;
    }

    const leftDate = left?.createdAt ? new Date(left.createdAt).getTime() : 0;
    const rightDate = right?.createdAt ? new Date(right.createdAt).getTime() : 0;
    return rightDate - leftDate;
  });

const upsertNotification = (items, notification) => {
  if (!notification?.id) {
    return items;
  }

  const index = items.findIndex((item) => item.id === notification.id);
  if (index === -1) {
    return sortNotifications([notification, ...items]);
  }

  const next = [...items];
  next[index] = notification;
  return sortNotifications(next);
};

const upsertNotifications = (items, notifications) =>
  notifications.reduce((next, notification) => upsertNotification(next, notification), items);

const matchesWorkspace = (notification, workspaceId) => {
  if (!workspaceId) return true;
  const notificationWorkspaceId = notification?.project?.workspaceId;
  return notificationWorkspaceId === workspaceId;
};

export function useAppContext() {
  const context = useContext(Context);
  if (!context) {
    throw new Error('useProvider must be used within Provider');
  }
  return context;
}

export function Provider({ children }) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [projectsView, setProjectsView] = useState('list');
  const [theme, setTheme] = useState('system');
  const [resolvedTheme, setResolvedTheme] = useState('light');

  const [projects, setProjects] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState('');
  const [isWorkspacesLoading, setIsWorkspacesLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(true);
  const [isNotificationsRealtimeConnected, setIsNotificationsRealtimeConnected] =
    useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  useEffect(() => {
    const storedTheme = window.localStorage.getItem('bucket-theme');
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    const storedWorkspaceId = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (storedWorkspaceId) {
      setSelectedWorkspaceId(storedWorkspaceId);
    }
  }, []);

  const refreshWorkspaces = useCallback(async () => {
    setIsWorkspacesLoading(true);
    try {
      const response = await fetch(`${apiBase}/api/workspaces`, {
        credentials: 'include',
      });
      if (!response.ok) {
        setWorkspaces([]);
        setSelectedWorkspaceId('');
        return;
      }

      const data = await response.json();
      const nextWorkspaces = Array.isArray(data?.workspaces) ? data.workspaces : [];
      setWorkspaces(nextWorkspaces);

      setSelectedWorkspaceId((current) => {
        if (current && nextWorkspaces.some((workspace) => workspace.id === current)) {
          return current;
        }

        const storedWorkspaceId =
          typeof window !== 'undefined'
            ? window.localStorage.getItem(WORKSPACE_STORAGE_KEY)
            : '';

        if (
          storedWorkspaceId &&
          nextWorkspaces.some((workspace) => workspace.id === storedWorkspaceId)
        ) {
          return storedWorkspaceId;
        }

        return nextWorkspaces[0]?.id || '';
      });
    } catch (error) {
      setWorkspaces([]);
      setSelectedWorkspaceId('');
    } finally {
      setIsWorkspacesLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    refreshWorkspaces();
  }, [refreshWorkspaces]);

  useEffect(() => {
    if (!selectedWorkspaceId) {
      window.localStorage.removeItem(WORKSPACE_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(WORKSPACE_STORAGE_KEY, selectedWorkspaceId);
  }, [selectedWorkspaceId]);

  const refreshProjects = useCallback(async () => {
    if (isWorkspacesLoading) return;

    try {
      const params = new URLSearchParams();
      if (selectedWorkspaceId) {
        params.set('workspaceId', selectedWorkspaceId);
      }

      const query = params.toString();
      const response = await fetch(
        `${apiBase}/api/projects${query ? `?${query}` : ''}`,
        {
          credentials: 'include',
        }
      );
      if (!response.ok) {
        setProjects([]);
        return;
      }
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      setProjects([]);
    }
  }, [apiBase, isWorkspacesLoading, selectedWorkspaceId]);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  const createWorkspace = useCallback(
    async (name) => {
      const trimmedName = name?.toString().trim();
      if (!trimmedName) return null;

      const response = await fetch(`${apiBase}/api/workspaces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: trimmedName }),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const workspace = data?.workspace || null;
      if (!workspace) {
        return null;
      }

      setWorkspaces((prev) => {
        if (prev.some((existingWorkspace) => existingWorkspace.id === workspace.id)) {
          return prev;
        }
        return [...prev, workspace];
      });
      setSelectedWorkspaceId(workspace.id);
      return workspace;
    },
    [apiBase]
  );

  const renameWorkspace = useCallback(
    async (workspaceId, nextName) => {
      const normalizedWorkspaceId = workspaceId?.toString().trim();
      const normalizedName = nextName?.toString().trim();

      if (!normalizedWorkspaceId || !normalizedName) {
        return { workspace: null, error: 'Workspace name is required.' };
      }

      try {
        const response = await fetch(`${apiBase}/api/workspaces/${normalizedWorkspaceId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ name: normalizedName }),
        });

        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          return {
            workspace: null,
            error: payload?.error || 'Unable to rename workspace.',
          };
        }

        const workspace = payload?.workspace || null;
        if (!workspace?.id) {
          return { workspace: null, error: 'Unable to rename workspace.' };
        }

        setWorkspaces((prev) =>
          prev.map((existingWorkspace) =>
            existingWorkspace.id === workspace.id ? workspace : existingWorkspace
          )
        );

        return { workspace, error: null };
      } catch (error) {
        return { workspace: null, error: 'Unable to rename workspace.' };
      }
    },
    [apiBase]
  );

  const deleteWorkspace = useCallback(
    async (workspaceId, options = {}) => {
      const normalizedWorkspaceId = workspaceId?.toString().trim();
      if (!normalizedWorkspaceId) {
        return { deleted: false, error: 'Workspace id is required.' };
      }

      const force = options?.force === true;
      const confirmation = options?.confirmation?.toString().trim() || '';

      try {
        const response = await fetch(`${apiBase}/api/workspaces/${normalizedWorkspaceId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ force, confirmation }),
        });

        const payload = await response.json().catch(() => null);

        if (response.status === 409 && payload?.requiresConfirmation) {
          return {
            deleted: false,
            requiresConfirmation: true,
            safeguards: payload?.safeguards || null,
            error: payload?.error || 'Workspace requires confirmation before deletion.',
          };
        }

        if (!response.ok) {
          return {
            deleted: false,
            error: payload?.error || 'Unable to delete workspace.',
          };
        }

        await refreshWorkspaces();

        return {
          deleted: true,
          deletedWorkspaceId: payload?.deletedWorkspaceId || normalizedWorkspaceId,
          nextWorkspaceId: payload?.nextWorkspaceId || '',
        };
      } catch (error) {
        return { deleted: false, error: 'Unable to delete workspace.' };
      }
    },
    [apiBase, refreshWorkspaces]
  );

  const refreshNotifications = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) {
        setIsNotificationsLoading(true);
      }
      try {
        const params = new URLSearchParams();
        params.set('limit', '150');
        if (selectedWorkspaceId) {
          params.set('workspaceId', selectedWorkspaceId);
        }

        const response = await fetch(`${apiBase}/api/notifications?${params.toString()}`, {
          credentials: 'include',
        });
        if (!response.ok) {
          setNotifications([]);
          return;
        }
        const data = await response.json();
        setNotifications(
          sortNotifications(
            Array.isArray(data?.notifications) ? data.notifications : []
          )
        );
      } catch (error) {
        setNotifications([]);
      } finally {
        if (!silent) {
          setIsNotificationsLoading(false);
        }
      }
    },
    [apiBase, selectedWorkspaceId]
  );

  const updateNotification = useCallback(
    async (notificationId, updates) => {
      if (!notificationId) return null;
      try {
        const response = await fetch(`${apiBase}/api/notifications/${notificationId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(updates),
        });

        if (!response.ok) return null;

        const data = await response.json();
        if (data?.notification) {
          setNotifications((prev) => upsertNotification(prev, data.notification));
          return data.notification;
        }
      } catch (error) {
        // noop for now
      }
      return null;
    },
    [apiBase]
  );

  const updateSelectedNotifications = useCallback(
    async (ids, updates) => {
      const normalizedIds = [...new Set((ids || []).filter(Boolean))];
      if (normalizedIds.length === 0) return [];

      try {
        const response = await fetch(`${apiBase}/api/notifications`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ ids: normalizedIds, ...updates }),
        });

        if (!response.ok) return [];

        const data = await response.json();
        const nextNotifications = Array.isArray(data?.notifications) ? data.notifications : [];
        if (nextNotifications.length > 0) {
          setNotifications((prev) => upsertNotifications(prev, nextNotifications));
        }
        return nextNotifications;
      } catch (error) {
        // noop for now
      }
      return [];
    },
    [apiBase]
  );

  const markNotificationAsRead = useCallback(
    async (notificationId) => updateNotification(notificationId, { read: true }),
    [updateNotification]
  );

  const markNotificationAsUnread = useCallback(
    async (notificationId) => updateNotification(notificationId, { read: false }),
    [updateNotification]
  );

  const starNotification = useCallback(
    async (notificationId) => updateNotification(notificationId, { starred: true }),
    [updateNotification]
  );

  const unstarNotification = useCallback(
    async (notificationId) => updateNotification(notificationId, { starred: false }),
    [updateNotification]
  );

  const markSelectedNotificationsAsRead = useCallback(
    async (ids) => updateSelectedNotifications(ids, { read: true }),
    [updateSelectedNotifications]
  );

  const markSelectedNotificationsAsUnread = useCallback(
    async (ids) => updateSelectedNotifications(ids, { read: false }),
    [updateSelectedNotifications]
  );

  const starSelectedNotifications = useCallback(
    async (ids) => updateSelectedNotifications(ids, { starred: true }),
    [updateSelectedNotifications]
  );

  const unstarSelectedNotifications = useCallback(
    async (ids) => updateSelectedNotifications(ids, { starred: false }),
    [updateSelectedNotifications]
  );

  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedWorkspaceId) {
        params.set('workspaceId', selectedWorkspaceId);
      }
      const query = params.toString();

      const response = await fetch(
        `${apiBase}/api/notifications/read-all${query ? `?${query}` : ''}`,
        {
          method: 'PATCH',
          credentials: 'include',
        }
      );

      if (!response.ok) return;

      const payload = await response.json().catch(() => null);
      const readAt = payload?.readAt || new Date().toISOString();
      const payloadWorkspaceId = payload?.workspaceId || null;
      setNotifications((prev) =>
        prev.map((notification) => {
          if (notification.read) return notification;
          if (payloadWorkspaceId) {
            if (notification?.project?.workspaceId !== payloadWorkspaceId) {
              return notification;
            }
          }
          return { ...notification, read: true, readAt };
        })
      );
    } catch (error) {
      // noop for now
    }
  }, [apiBase, selectedWorkspaceId]);

  const deleteNotification = useCallback(
    async (notificationId) => {
      if (!notificationId) return;
      try {
        const response = await fetch(`${apiBase}/api/notifications/${notificationId}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!response.ok) return;

        setNotifications((prev) =>
          prev.filter((notification) => notification.id !== notificationId)
        );
      } catch (error) {
        // noop for now
      }
    },
    [apiBase]
  );

  const deleteSelectedNotifications = useCallback(
    async (ids) => {
      const normalizedIds = [...new Set((ids || []).filter(Boolean))];
      if (normalizedIds.length === 0) return false;

      try {
        const response = await fetch(`${apiBase}/api/notifications/bulk`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ ids: normalizedIds }),
        });

        if (!response.ok) return false;

        setNotifications((prev) =>
          prev.filter((notification) => !normalizedIds.includes(notification.id))
        );
        return true;
      } catch (error) {
        // noop for now
      }

      return false;
    },
    [apiBase]
  );

  const deleteAllNotifications = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedWorkspaceId) {
        params.set('workspaceId', selectedWorkspaceId);
      }
      const query = params.toString();

      const response = await fetch(`${apiBase}/api/notifications${query ? `?${query}` : ''}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) return false;

      setNotifications((prev) =>
        prev.filter((notification) => {
          if (!selectedWorkspaceId) return false;
          return notification?.project?.workspaceId !== selectedWorkspaceId;
        })
      );
      return true;
    } catch (error) {
      // noop for now
    }

    return false;
  }, [apiBase, selectedWorkspaceId]);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  useEffect(() => {
    const source = new EventSource(`${apiBase}/api/notifications/stream`, {
      withCredentials: true,
    });

    const safeParse = (event) => {
      try {
        return JSON.parse(event.data);
      } catch (error) {
        return null;
      }
    };

    const handleCreated = (event) => {
      const payload = safeParse(event);
      const next = payload?.notification;
      if (!next) return;
      if (!matchesWorkspace(next, selectedWorkspaceId)) return;
      setNotifications((prev) => upsertNotification(prev, next));
    };

    const handleUpdated = (event) => {
      const payload = safeParse(event);
      const next = payload?.notification;
      if (!next) return;
      if (!matchesWorkspace(next, selectedWorkspaceId)) return;
      setNotifications((prev) => upsertNotification(prev, next));
    };

    const handleReadAll = (event) => {
      const payload = safeParse(event);
      const readAt = payload?.readAt || new Date().toISOString();
      const payloadWorkspaceId = payload?.workspaceId || null;
      setNotifications((prev) =>
        prev.map((notification) => {
          if (notification.read) return notification;

          if (selectedWorkspaceId) {
            if (
              payloadWorkspaceId &&
              payloadWorkspaceId !== selectedWorkspaceId
            ) {
              return notification;
            }
            return { ...notification, read: true, readAt };
          }

          if (
            payloadWorkspaceId &&
            notification?.project?.workspaceId !== payloadWorkspaceId
          ) {
            return notification;
          }

          return { ...notification, read: true, readAt };
        })
      );
    };

    const handleDeleted = (event) => {
      const payload = safeParse(event);
      const notificationId = payload?.notificationId;
      if (!notificationId) return;
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== notificationId)
      );
    };

    source.onopen = () => {
      setIsNotificationsRealtimeConnected(true);
    };

    source.onerror = () => {
      setIsNotificationsRealtimeConnected(false);
    };

    source.addEventListener('notification.created', handleCreated);
    source.addEventListener('notification.updated', handleUpdated);
    source.addEventListener('notifications.read_all', handleReadAll);
    source.addEventListener('notification.deleted', handleDeleted);

    return () => {
      source.removeEventListener('notification.created', handleCreated);
      source.removeEventListener('notification.updated', handleUpdated);
      source.removeEventListener('notifications.read_all', handleReadAll);
      source.removeEventListener('notification.deleted', handleDeleted);
      source.close();
    };
  }, [apiBase, selectedWorkspaceId]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const resolveTheme = (themeValue) => {
      if (themeValue === 'system') {
        return media.matches ? 'dark' : 'light';
      }
      return themeValue;
    };

    const applyTheme = (themeValue) => {
      const effectiveTheme = resolveTheme(themeValue);
      setResolvedTheme(effectiveTheme);
      if (effectiveTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme(theme);
    window.localStorage.setItem('bucket-theme', theme);

    const handleSystemChange = () => {
      if (theme === 'system') {
        applyTheme(theme);
      }
    };

    if (media.addEventListener) {
      media.addEventListener('change', handleSystemChange);
    } else {
      media.addListener(handleSystemChange);
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', handleSystemChange);
      } else {
        media.removeListener(handleSystemChange);
      }
    };
  }, [theme]);

  const unreadNotificationsCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const value = {
    isSidebarCollapsed,
    toggleSidebar,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    projects,
    setProjects,
    refreshProjects,
    workspaces,
    isWorkspacesLoading,
    selectedWorkspaceId,
    setSelectedWorkspaceId,
    refreshWorkspaces,
    createWorkspace,
    renameWorkspace,
    deleteWorkspace,
    projectsView,
    setProjectsView,
    theme,
    setTheme,
    resolvedTheme,
    notifications,
    unreadNotificationsCount,
    isNotificationsLoading,
    isNotificationsRealtimeConnected,
    refreshNotifications,
    markNotificationAsRead,
    markNotificationAsUnread,
    markAllNotificationsAsRead,
    markSelectedNotificationsAsRead,
    markSelectedNotificationsAsUnread,
    starNotification,
    unstarNotification,
    starSelectedNotifications,
    unstarSelectedNotifications,
    deleteNotification,
    deleteSelectedNotifications,
    deleteAllNotifications,
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
}
