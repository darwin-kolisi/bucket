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
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    isNotificationsLoading,
    isNotificationsRealtimeConnected,
  } = useAppContext();

  const filterOptions = [
    { label: 'All', value: 'all' },
    { label: 'Unread', value: 'unread' },
    { label: 'High Priority', value: 'high' },
  ];

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter((notification) => !notification.read);
    }
    if (filter === 'high') {
      return notifications.filter((notification) => notification.priority === 'high');
    }
    return notifications;
  }, [filter, notifications]);

  const highPriorityUnread = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          notification.priority === 'high' && !notification.read
      ).length,
    [notifications]
  );

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
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Realtime
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isNotificationsRealtimeConnected ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
              <p className="text-sm font-medium text-gray-900">
                {isNotificationsRealtimeConnected ? 'Connected' : 'Reconnecting'}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Unread</p>
            <p className="mt-2 text-sm font-medium text-gray-900">
              {unreadNotificationsCount} notifications waiting for attention
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              High Priority
            </p>
            <p className="mt-2 text-sm font-medium text-gray-900">
              {highPriorityUnread} unread high-priority items
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">Notifications</span>
              {unreadNotificationsCount > 0 && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                  {unreadNotificationsCount} unread
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="min-w-[150px]">
                <AppSelect
                value={filter}
                  onChange={setFilter}
                  options={filterOptions}
                />
              </div>

              {unreadNotificationsCount > 0 && (
                <button
                  onClick={markAllNotificationsAsRead}
                  className="text-xs text-gray-600 hover:text-gray-900 px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors">
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {isNotificationsLoading && (
              <div className="p-6 text-sm text-gray-500">Loading notifications...</div>
            )}

            {!isNotificationsLoading && filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1 gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {notification.title}
                          </h3>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityStyles(
                              notification.priority
                            )}`}>
                            {notification.priority}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {formatDateTime(notification.createdAt)}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>

                      <div className="flex flex-wrap items-center gap-2">
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
                      </div>
                    </div>

                    {!notification.read && (
                      <button
                        onClick={() => markNotificationAsRead(notification.id)}
                        className="flex-shrink-0 text-xs text-blue-600 hover:text-blue-800 font-medium">
                        Mark read
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="flex-shrink-0 text-xs text-red-600 hover:text-red-800 font-medium">
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : null}

            {!isNotificationsLoading && filteredNotifications.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <svg
                  className="h-12 w-12 mx-auto text-gray-400 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                  />
                </svg>
                <p className="text-sm">No notifications found</p>
                <p className="text-xs mt-1">You're all caught up!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
