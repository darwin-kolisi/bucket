'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/app/providers/Provider';

const formatRelativeTime = (value) => {
  if (!value) return 'Just now';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Just now';

  const seconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return 'Just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
  }).format(date);
};

const getPriorityClass = (priority) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'low':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
};

const getNotificationIcon = (type) => {
  const normalized = type?.toString().toLowerCase() || '';

  if (normalized.includes('overdue') || normalized.includes('due')) {
    return (
      <svg
        className="h-4 w-4 text-red-500"
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
        className="h-4 w-4 text-green-500"
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

  if (normalized.includes('note')) {
    return (
      <svg
        className="h-4 w-4 text-blue-500"
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

  if (normalized.includes('project')) {
    return (
      <svg
        className="h-4 w-4 text-indigo-500"
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
      className="h-4 w-4 text-gray-500"
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

export default function NotificationPopup() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef(null);
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    isNotificationsRealtimeConnected,
  } = useAppContext();

  const visibleNotifications = notifications.slice(0, 8);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openNotificationTarget = (notification) => {
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
      return;
    }
    router.push('/notifications');
  };

  return (
    <div className="relative" ref={popupRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notifications">
        <svg
          className="h-5 w-5"
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
        {unreadNotificationsCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex min-w-4 h-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-[calc(80vw-2rem)] sm:w-[22rem] origin-top-right rounded-xl border border-gray-200 bg-white p-2 text-sm text-gray-900 shadow-lg z-50">
          <div className="flex items-center justify-between mb-2 px-3 py-2">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
              Notifications
              <span
                className={`h-2 w-2 rounded-full ${
                  isNotificationsRealtimeConnected ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            </div>
            {unreadNotificationsCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {visibleNotifications.length > 0 ? (
              visibleNotifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => {
                    if (!notification.read) {
                      markNotificationAsRead(notification.id);
                    }
                    setIsOpen(false);
                    openNotificationTarget(notification);
                  }}
                  className={`group flex w-full items-start gap-3 rounded-lg px-3 py-2 hover:bg-gray-100 text-left transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}>
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </h3>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full ${getPriorityClass(
                            notification.priority
                          )}`}>
                          {notification.priority}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                      {notification.message}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                      {!notification.read && (
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-gray-500">
                <svg
                  className="h-8 w-8 mx-auto text-gray-400 mb-2"
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
                <p className="text-sm">No notifications</p>
                <p className="text-xs mt-1">You're all caught up!</p>
              </div>
            )}
          </div>

          <div className="mt-2 pt-2 border-t border-gray-200">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/notifications');
              }}
              className="w-full text-center text-xs text-gray-500 hover:text-gray-700 py-2 font-medium">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
