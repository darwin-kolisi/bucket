'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const Context = createContext();

const sortNotificationsByDateDesc = (items) =>
  [...items].sort((left, right) => {
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
    return sortNotificationsByDateDesc([notification, ...items]);
  }

  const next = [...items];
  next[index] = notification;
  return sortNotificationsByDateDesc(next);
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
    const loadProjects = async () => {
      try {
        const response = await fetch(`${apiBase}/api/projects`, {
          credentials: 'include',
        });
        if (!response.ok) {
          setProjects([]);
          return;
        }
        const data = await response.json();
        setProjects(data.projects || []);
      } catch (error) {
        setProjects([]);
      }
    };

    loadProjects();
  }, [apiBase]);

  const refreshNotifications = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) {
        setIsNotificationsLoading(true);
      }
      try {
        const response = await fetch(`${apiBase}/api/notifications?limit=150`, {
          credentials: 'include',
        });
        if (!response.ok) {
          setNotifications([]);
          return;
        }
        const data = await response.json();
        setNotifications(
          sortNotificationsByDateDesc(
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
    [apiBase]
  );

  const markNotificationAsRead = useCallback(
    async (notificationId) => {
      if (!notificationId) return;
      try {
        const response = await fetch(
          `${apiBase}/api/notifications/${notificationId}/read`,
          {
            method: 'PATCH',
            credentials: 'include',
          }
        );

        if (!response.ok) return;

        const data = await response.json();
        if (data?.notification) {
          setNotifications((prev) =>
            upsertNotification(prev, data.notification)
          );
        }
      } catch (error) {
        // noop for now
      }
    },
    [apiBase]
  );

  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      const response = await fetch(`${apiBase}/api/notifications/read-all`, {
        method: 'PATCH',
        credentials: 'include',
      });

      if (!response.ok) return;

      const payload = await response.json().catch(() => null);
      const readAt = payload?.readAt || new Date().toISOString();
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.read
            ? notification
            : { ...notification, read: true, readAt }
        )
      );
    } catch (error) {
      // noop for now
    }
  }, [apiBase]);

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
      setNotifications((prev) => upsertNotification(prev, next));
    };

    const handleUpdated = (event) => {
      const payload = safeParse(event);
      const next = payload?.notification;
      if (!next) return;
      setNotifications((prev) => upsertNotification(prev, next));
    };

    const handleReadAll = (event) => {
      const payload = safeParse(event);
      const readAt = payload?.readAt || new Date().toISOString();
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.read
            ? notification
            : { ...notification, read: true, readAt }
        )
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
  }, [apiBase]);

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
    markAllNotificationsAsRead,
    deleteNotification,
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
}
