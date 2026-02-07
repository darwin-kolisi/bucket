'use client';
import Image from 'next/image';

export default function Sidebar({
  activeItem = 'dashboard',
  onItemSelect,
  isCollapsed,
  onToggleCollapse,
}) {
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg
          className="h-4 w-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      ),
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: (
        <svg
          className="h-4 w-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24">
          <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
        </svg>
      ),
    },
    {
      id: 'notes',
      label: 'Notes',
      icon: (
        <svg
          className="h-4 w-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10,9 9,9 8,9" />
        </svg>
      ),
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: (
        <svg
          className="h-4 w-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
      ),
    },
  ];

  const bucketItems = [
    { id: 'personal', label: 'Personal', count: 12, color: 'bg-blue-500' },
    { id: 'work', label: 'Work', count: 8, color: 'bg-green-500' },
    { id: 'learning', label: 'Learning', count: 5, color: 'bg-yellow-500' },
  ];

  const handleItemClick = (itemId) => {
    if (onItemSelect) {
      onItemSelect(itemId);
    }
  };

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300 hidden md:flex ${isCollapsed ? 'w-[70px]' : 'w-[220px]'
        }`}>
      <div
        className="relative flex h-[var(--chrome-height)] items-center justify-between px-5 transition-all duration-300">
        <div className="flex items-center gap-3">
          <Image
            src="/cat.gif"
            alt="logo"
            width={30}
            height={30}
            className="flex-shrink-0 rounded-full"
          />
          <div
            className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
              }`}>
            <div className="flex flex-col">
              <h3 className="whitespace-nowrap text-lg font-bold leading-tight text-gray-900">
                BUCKET
              </h3>
              <span className="whitespace-nowrap text-xs leading-tight text-gray-500">
                project management
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onToggleCollapse}
          className="absolute -right-3 top-1/2 -translate-y-1/2 rounded-full border border-gray-200 bg-white p-1 shadow-sm hover:bg-gray-50">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className={`text-gray-500 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''
              }`}>
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <div className="mb-2 px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
          {!isCollapsed && 'Navigation'}
        </div>

        <div className="space-y-1">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100 text-left transition-colors ${activeItem === item.id
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-700'
                }`}
              onClick={() => handleItemClick(item.id)}>
              <span className="flex-shrink-0">{item.icon}</span>
              {!isCollapsed && <span className="text-sm">{item.label}</span>}
            </button>
          ))}
        </div>

        <div className="my-4 h-px bg-gray-200" />

        <div className="mb-2 px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
          {!isCollapsed && 'Buckets'}
        </div>

        <div className="space-y-1">
          {bucketItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100 text-left transition-colors ${activeItem === item.id
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-700'
                }`}>
              <span
                className={`h-2 w-2 flex-shrink-0 rounded-full ${item.color}`}
              />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-sm">{item.label}</span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                    {item.count}
                  </span>
                </>
              )}
            </button>
          ))}
        </div>
      </nav>

    </aside>
  );
}
