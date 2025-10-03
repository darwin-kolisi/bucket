'use client';
import { useState } from 'react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'due date',
      title: 'Project due tomorrow',
      message: '"bucket" project is due tomorrow',
      project: 'bucket',
      timestamp: '2 hours ago',
      read: false,
      priority: 'high',
    },
    {
      id: 2,
      type: 'task completed',
      title: 'Task completed',
      message: '"Create landing page design" was marked as done',
      project: 'bucket',
      timestamp: '5 hours ago',
      read: true,
      priority: 'medium',
    },
    {
      id: 3,
      type: 'project created',
      title: 'New project created',
      message: '"physics" project was created',
      project: 'physics',
      timestamp: '1 day ago',
      read: true,
      priority: 'low',
    },
    {
      id: 4,
      type: 'reminder',
      title: 'Daily reminder',
      message: 'You have 3 pending tasks across all projects',
      project: null,
      timestamp: '1 day ago',
      read: true,
      priority: 'medium',
    },
    {
      id: 5,
      type: 'due date',
      title: 'Overdue project',
      message: '"employment" project is overdue',
      project: 'employment',
      timestamp: '2 days ago',
      read: false,
      priority: 'high',
    },
  ]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'due date':
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
      case 'task completed':
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
      case 'project created':
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
              d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        );
      case 'reminder':
        return (
          <svg
            className="h-5 w-5 text-yellow-500"
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
      default:
        return null;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-8 md:p-12 mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(
                          notification.priority
                        )}`}>
                        {notification.priority}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {notification.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
