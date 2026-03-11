'use client';

import { useEffect, useMemo, useState } from 'react';
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
  return 'bg-gray-100 text-gray-600';
};

const getTypeIcon = (type) => {
  const normalized = type?.toString().toLowerCase() || '';

  if (normalized.includes('overdue') || normalized.includes('due')) {
    return (
      <svg
        className="h-4.5 w-4.5 text-red-500"
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
        className="h-4.5 w-4.5 text-green-500"
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
        className="h-4.5 w-4.5 text-indigo-500"
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

  return (
    <svg
      className="h-4.5 w-4.5 text-gray-500"
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

const matchesQuery = (notification, query) => {
  if (!query) return true;
  return (
    notification.title?.toLowerCase().includes(query) ||
    notification.message?.toLowerCase().includes(query) ||
    notification.project?.name?.toLowerCase().includes(query) ||
    notification.task?.title?.toLowerCase().includes(query)
  );
};

export default function Notifications() {
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const {
    notifications,
    markNotificationAsRead,
    markNotificationAsUnread,
    markAllNotificationsAsRead,
    markSelectedNotificationsAsRead,
    markSelectedNotificationsAsUnread,
    deleteNotification,
    deleteSelectedNotifications,
    deleteAllNotifications,
    starNotification,
    unstarNotification,
    starSelectedNotifications,
    unstarSelectedNotifications,
    isNotificationsLoading,
  } = useAppContext();

  const filterOptions = [
    { label: 'All', value: 'all' },
    { label: 'Unread', value: 'unread' },
    { label: 'Starred', value: 'starred' },
    { label: 'High Priority', value: 'high' },
  ];

  const filteredNotifications = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return notifications.filter((notification) => {
      if (filter === 'unread' && notification.read) return false;
      if (filter === 'starred' && !notification.starred) return false;
      if (filter === 'high' && notification.priority !== 'high') return false;
      return matchesQuery(notification, normalizedQuery);
    });
  }, [filter, notifications, searchQuery]);

  useEffect(() => {
    setSelectedIds((prev) =>
      prev.filter((id) => filteredNotifications.some((notification) => notification.id === id))
    );
  }, [filteredNotifications]);

  const selectedNotifications = useMemo(
    () => filteredNotifications.filter((notification) => selectedIds.includes(notification.id)),
    [filteredNotifications, selectedIds]
  );

  const allVisibleSelected =
    filteredNotifications.length > 0 &&
    filteredNotifications.every((notification) => selectedIds.includes(notification.id));
  const selectedUnreadCount = selectedNotifications.filter((notification) => !notification.read)
    .length;
  const selectedStarredCount = selectedNotifications.filter((notification) => notification.starred)
    .length;

  const openSource = (notification) => {
    if (notification?.project?.id) {
      router.push(`/projects/${notification.project.id}`);
      return;
    }
    router.push('/notifications');
  };

  const toggleSelection = (notificationId) => {
    setSelectedIds((prev) =>
      prev.includes(notificationId)
        ? prev.filter((id) => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(filteredNotifications.map((notification) => notification.id));
  };

  const handleSelectedReadToggle = async () => {
    if (selectedIds.length === 0) return;
    if (selectedUnreadCount > 0) {
      await markSelectedNotificationsAsRead(selectedIds);
      return;
    }
    await markSelectedNotificationsAsUnread(selectedIds);
  };

  const handleSelectedStarToggle = async () => {
    if (selectedIds.length === 0) return;
    if (selectedStarredCount === selectedIds.length) {
      await unstarSelectedNotifications(selectedIds);
      return;
    }
    await starSelectedNotifications(selectedIds);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    const deleted = await deleteSelectedNotifications(selectedIds);
    if (deleted) {
      setSelectedIds([]);
    }
  };

  const handleDeleteAll = async () => {
    const deleted = await deleteAllNotifications();
    if (deleted) {
      setSelectedIds([]);
    }
  };

  return (
    <div className="page-shell mx-auto max-w-[1400px] p-6">
      <section className="surface-card overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Activity Feed</h2>
              <p className="mt-0.5 text-xs text-gray-500">
                {filteredNotifications.length} matching items
                {selectedIds.length > 0 ? ` • ${selectedIds.length} selected` : ''}
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
                <AppSelect value={filter} onChange={setFilter} options={filterOptions} />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50/80 p-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <label className="flex items-center gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAllVisible}
                  className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-400"
                />
                Select all visible
              </label>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={markAllNotificationsAsRead}
                  disabled={!notifications.some((notification) => !notification.read)}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50">
                  Mark all read
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAll}
                  disabled={notifications.length === 0}
                  className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50">
                  Delete all
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSelectedReadToggle}
                disabled={selectedIds.length === 0}
                className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50">
                {selectedUnreadCount > 0 ? 'Mark selected read' : 'Mark selected unread'}
              </button>
              <button
                type="button"
                onClick={handleSelectedStarToggle}
                disabled={selectedIds.length === 0}
                className="rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50">
                {selectedStarredCount === selectedIds.length && selectedIds.length > 0
                  ? 'Unstar selected'
                  : 'Star selected'}
              </button>
              <button
                type="button"
                onClick={handleDeleteSelected}
                disabled={selectedIds.length === 0}
                className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50">
                Delete selected
              </button>
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
                className={`grid gap-3 p-4 transition-colors md:grid-cols-[auto_auto_minmax(0,1fr)_auto] ${
                  !notification.read ? 'bg-gray-100/70' : 'bg-white'
                } hover:bg-gray-50`}>
                <div className="pt-1">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(notification.id)}
                    onChange={() => toggleSelection(notification.id)}
                    aria-label={`Select ${notification.title}`}
                    className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-400"
                  />
                </div>

                <div
                  className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg ${getTypeIconWrapStyles(
                    notification.type
                  )}`}>
                  {getTypeIcon(notification.type)}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900">{notification.title}</h3>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${getPriorityStyles(
                        notification.priority
                      )}`}>
                      {notification.priority}
                    </span>
                    {notification.starred && (
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                        Starred
                      </span>
                    )}
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

                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        notification.starred
                          ? unstarNotification(notification.id)
                          : starNotification(notification.id)
                      }
                      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                        notification.starred
                          ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}>
                      <span className="text-sm leading-none">
                        {notification.starred ? '★' : '☆'}
                      </span>
                      {notification.starred ? 'Starred' : 'Star'}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        notification.read
                          ? markNotificationAsUnread(notification.id)
                          : markNotificationAsRead(notification.id)
                      }
                      className="rounded-lg border border-blue-200 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50">
                      {notification.read ? 'Mark unread' : 'Mark read'}
                    </button>
                    <button
                      type="button"
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
