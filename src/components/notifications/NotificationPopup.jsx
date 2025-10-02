'use client';
import { useState, useRef, useEffect } from 'react';

export default function NotificationPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'due_date',
      title: 'Deadline approaching',
      message:
        'The "bucket" prototype needs final testing before tomorrow\'s demo',
      project: 'bucket',
      timestamp: '2 hours ago',
      read: false,
      priority: 'high',
    },
    {
      id: 2,
      type: 'task_completed',
      title: 'Design approved',
      message:
        'Sarah just approved the landing page design - ready for development',
      project: 'bucket',
      timestamp: '5 hours ago',
      read: true,
      priority: 'medium',
    },
    {
      id: 3,
      type: 'project created',
      title: 'New project setup',
      message: 'Kickoff meeting scheduled for the physics simulation project',
      project: 'physics',
      timestamp: '1 day ago',
      read: true,
      priority: 'low',
    },
    {
      id: 4,
      type: 'reminder',
      title: 'Weekly check-in',
      message: "Don't forget to update your task progress for the team sync",
      project: null,
      timestamp: '1 day ago',
      read: true,
      priority: 'medium',
    },
    {
      id: 5,
      type: 'due_date',
      title: 'Client review pending',
      message: 'Marketing assets waiting for client feedback since Monday',
      project: 'client-work',
      timestamp: 'Just now',
      read: false,
      priority: 'high',
    },
    {
      id: 6,
      type: 'task_completed',
      title: 'Bug fix deployed',
      message:
        'The login issue on mobile has been resolved and deployed to staging',
      project: 'platform',
      timestamp: '30 minutes ago',
      read: false,
      priority: 'medium',
    },
  ]);

  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'due_date':
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
      case 'task_completed':
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
      case 'project_created':
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
              d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        );
      case 'reminder':
        return (
          <svg
            className="h-4 w-4 text-yellow-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24-255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
            />
          </svg>
        );
      default:
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
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({ ...notification, read: true }))
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative" ref={popupRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
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
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-80 origin-top-right rounded-xl border border-gray-200 bg-white p-2 text-sm text-gray-900 shadow-lg z-50">
          <div className="flex items-center justify-between mb-2 px-3 py-2">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Notifications
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`group flex items-start gap-3 rounded-lg px-3 py-2 hover:bg-gray-100 text-left transition-colors ${
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
                          className={`text-xs px-1.5 py-0.5 rounded-full ${getPriorityColor(
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
                        {notification.timestamp}
                      </span>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
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
                window.dispatchEvent(
                  new CustomEvent('navigateToNotifications')
                );
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
