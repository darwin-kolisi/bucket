'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/app/providers/Provider';
import AppSelect from '@/components/ui/AppSelect';

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

const formatRelativeTime = (value) => {
  if (!value) return 'Just now';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Just now';

  const seconds = Math.max(1, Math.floor((Date.now() - parsed.getTime()) / 1000));
  if (seconds < 60) return 'Just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return formatDateTime(value);
};

const formatTypeLabel = (value) => {
  if (!value) return 'Update';
  return value
    .toString()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getPriorityStyles = (priority) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'low':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  }
};

const getTypeIconWrapStyles = (type) => {
  const normalized = type?.toString().toLowerCase() || '';
  if (normalized.includes('overdue') || normalized.includes('due')) {
    return 'bg-red-100 text-red-600';
  }
  if (normalized.includes('completed')) {
    return 'bg-green-100 text-green-600';
  }
  if (normalized.includes('project')) {
    return 'bg-indigo-100 text-indigo-600';
  }
  if (normalized.includes('note')) {
    return 'bg-blue-100 text-blue-600';
  }
  return 'bg-gray-100 text-gray-600';
};

const getTypeIcon = (type) => {
  const normalized = type?.toString().toLowerCase() || '';

  if (normalized.includes('overdue') || normalized.includes('due')) {
    return (
      <svg
        className="h-5 w-5 text-red-500"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
        />
      </svg>
    );
  }

  if (normalized.includes('completed')) {
    return (
      <svg
        className="h-5 w-5 text-green-500"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
    );
  }

  if (normalized.includes('project')) {
    return (
      <svg
        className="h-5 w-5 text-indigo-500"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"
        />
      </svg>
    );
  }

  if (normalized.includes('note')) {
    return (
      <svg
        className="h-5 w-5 text-blue-500"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"
        />
        <polyline points="14,2 14,8 20,8" />
      </svg>
    );
  }

  return (
    <svg
      className="h-5 w-5 text-gray-500"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
      />
    </svg>
  );
};

export default function Notifications() {
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const {
    notifications,
    markNotificationAsRead,
    deleteNotification,
    isNotificationsLoading,
  } = useAppContext();

  const filterOptions = [
    { label: 'All', value: 'all' },
    { label: 'Unread', value: 'unread' },
    { label: 'High Priority', value: 'high' },
  ];

  const filteredNotifications = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (filter === 'unread') {
      return notifications.filter((notification) => {
        if (notification.read) return false;
        if (!normalizedQuery) return true;
        return (
          notification.title?.toLowerCase().includes(normalizedQuery) ||
          notification.message?.toLowerCase().includes(normalizedQuery) ||
          notification.project?.name?.toLowerCase().includes(normalizedQuery) ||
          notification.task?.title?.toLowerCase().includes(normalizedQuery)
        );
      });
    }
    if (filter === 'high') {
      return notifications.filter((notification) => {
        if (notification.priority !== 'high') return false;
        if (!normalizedQuery) return true;
        return (
          notification.title?.toLowerCase().includes(normalizedQuery) ||
          notification.message?.toLowerCase().includes(normalizedQuery) ||
          notification.project?.name?.toLowerCase().includes(normalizedQuery) ||
          notification.task?.title?.toLowerCase().includes(normalizedQuery)
        );
      });
    }
    return notifications.filter((notification) => {
      if (!normalizedQuery) return true;
      return (
        notification.title?.toLowerCase().includes(normalizedQuery) ||
        notification.message?.toLowerCase().includes(normalizedQuery) ||
        notification.project?.name?.toLowerCase().includes(normalizedQuery) ||
        notification.task?.title?.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [filter, notifications, searchQuery]);

  const openSource = (notification) => {
    if (notification?.type?.toString().startsWith('note_')) {
      const params = new URLSearchParams();
      if (notification?.project?.id) {
        params.set('projectId', notification.project.id);
      }
      if (notification?.task?.id) {
        params.set('taskId', notification.task.id);
      }
      const query = params.toString();
      router.push(query ? `/notes?${query}` : '/notes');
      return;
    }
    if (notification?.project?.id) {
      router.push(`/projects/${notification.project.id}`);
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] p-6">
      <section className="surface-card overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Activity Feed</h2>
              <p className="mt-0.5 text-xs text-gray-500">
                {filteredNotifications.length} matching items
              </p>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search title, message, project..."
                className="h-10 w-full min-w-[240px] rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
              <div className="w-full min-w-[170px] sm:w-auto">
                <AppSelect
                  value={filter}
                  onChange={setFilter}
                  options={filterOptions}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {isNotificationsLoading && (
            <div className="p-6 text-sm text-gray-500">Loading notifications...</div>
          )}

          {!isNotificationsLoading && filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <article
                key={notification.id}
                className={`grid gap-3 p-4 transition-colors md:grid-cols-[auto_minmax(0,1fr)_auto] ${
                  !notification.read ? 'bg-gray-100/70' : 'bg-white'
                } hover:bg-gray-50`}>
                <div
                  className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg ${getTypeIconWrapStyles(
                    notification.type
                  )}`}>
                  {getTypeIcon(notification.type)}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {notification.title}
                    </h3>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${getPriorityStyles(
                        notification.priority
                      )}`}>
                      {notification.priority}
                    </span>
                    {!notification.read && (
                      <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-700">
                        Unread
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-gray-600">{notification.message}</p>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {notification.project?.name && (
                      <button
                        type="button"
                        onClick={() => openSource(notification)}
                        className="rounded bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700 hover:bg-gray-200">
                        {notification.project.name}
                      </button>
                    )}
                    {notification.task?.title && (
                      <span className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                        {notification.task.title}
                      </span>
                    )}
                    <span className="rounded bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                      {formatTypeLabel(notification.type)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 md:flex-col md:items-end md:justify-between">
                  <div className="text-right">
                    <div className="text-xs font-medium text-gray-600">
                      {formatRelativeTime(notification.createdAt)}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {formatDateTime(notification.createdAt)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <button
                        onClick={() => markNotificationAsRead(notification.id)}
                        className="rounded-lg border border-blue-200 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50">
                        Mark read
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50">
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))
          ) : null}

          {!isNotificationsLoading && filteredNotifications.length === 0 && (
            <div className="p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                  />
                </svg>
              </div>
              <p className="mt-3 text-sm font-medium text-gray-700">No notifications found</p>
              <p className="mt-1 text-xs text-gray-500">
                Try changing your filter or search query.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
