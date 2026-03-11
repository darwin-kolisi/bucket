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

const getIconBgClass = (type) => {
  const normalized = type?.toString().toLowerCase() || '';
  if (normalized.includes('overdue') || normalized.includes('due')) return 'bg-red-50';
  if (normalized.includes('completed')) return 'bg-green-50';
  if (normalized.includes('note')) return 'bg-blue-50';
  if (normalized.includes('project')) return 'bg-indigo-50';
  return 'bg-gray-100';
};

const getNotificationIcon = (type) => {
  const normalized = type?.toString().toLowerCase() || '';

  if (normalized.includes('overdue') || normalized.includes('due')) {
    return (
      <svg
        className="h-3.5 w-3.5 text-red-500"
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
        className="h-3.5 w-3.5 text-green-500"
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
        className="h-3.5 w-3.5 text-blue-500"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
        />
      </svg>
    );
  }

  if (normalized.includes('project')) {
    return (
      <svg
        className="h-3.5 w-3.5 text-indigo-500"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
        />
      </svg>
    );
  }

  return (
    <svg
      className="h-3.5 w-3.5 text-gray-400"
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
        className={`relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
          isOpen ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
        }`}
        aria-label="Notifications">
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.6"
          stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 8a6 6 0 0 1 12 0c0 6 3 8 3 8H3s3-2 3-8"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.5 18.5a2.5 2.5 0 0 0 5 0"
          />
        </svg>
        {unreadNotificationsCount > 0 && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white" />
        )}
      </button>

      {isOpen && (
        <div className="fixed left-1/2 top-[calc(var(--chrome-height)+0.05rem)] z-50 w-[min(20rem,calc(100vw-1.5rem))] -translate-x-1/2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-7 sm:w-80 sm:translate-x-0">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">Notifications</span>
              {unreadNotificationsCount > 0 && (
                <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-100 px-1 text-[10px] font-semibold text-blue-700">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isNotificationsRealtimeConnected ? 'bg-green-500' : 'bg-gray-300'
                }`}
                title={isNotificationsRealtimeConnected ? 'Live' : 'Disconnected'}
              />
            </div>
            {unreadNotificationsCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="text-xs font-medium text-gray-500 transition-colors hover:text-gray-700">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[18rem] overflow-y-auto sm:max-h-[22rem]">
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
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                    !notification.read ? 'bg-blue-50/40' : ''
                  }`}>
                  <div
                    className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${getIconBgClass(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`truncate text-sm ${
                          !notification.read
                            ? 'font-semibold text-gray-900'
                            : 'font-medium text-gray-800'
                        }`}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                      )}
                    </div>
                    {notification.message && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
                        {notification.message}
                      </p>
                    )}
                    <p className="mt-1 text-[11px] text-gray-400">
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.6"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 8a6 6 0 0 1 12 0c0 6 3 8 3 8H3s3-2 3-8"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.5 18.5a2.5 2.5 0 0 0 5 0"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900">You're all caught up</p>
                <p className="mt-0.5 text-xs text-gray-500">No new notifications</p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/notifications');
              }}
              className="flex w-full items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700">
              View all notifications
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
