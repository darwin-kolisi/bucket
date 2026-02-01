'use client';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid';
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

  const handleSettingsClick = () => {
    window.dispatchEvent(new CustomEvent('openSettings'));
  };

  return (
    <aside
      className={`fixed top-0 left-0 z-50 h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300 hidden md:flex ${
        isCollapsed ? 'w-[70px]' : 'w-[220px]'
      }`}>
      <div
        className={`relative flex h-18.5 items-center justify-between border-b border-gray-200 px-5 transition-all duration-300`}>
        <div className="flex items-center gap-3">
          <Image
            src="/cat.gif"
            alt="logo"
            width={30}
            height={30}
            className="flex-shrink-0 rounded-full"
          />
          <div
            className={`overflow-hidden transition-all duration-300 ${
              isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
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
            className={`text-gray-500 transition-transform duration-300 ${
              isCollapsed ? 'rotate-180' : ''
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
              className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100 text-left transition-colors ${
                activeItem === item.id
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
              className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100 text-left transition-colors ${
                activeItem === item.id
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

      <div className="border-t border-gray-200 p-2">
        <Menu as="div" className="relative">
          <MenuButton className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-gray-100">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-900 text-xs font-semibold text-white">
              BS
            </div>
            <div
              className={`flex-1 overflow-hidden transition-all duration-300 ${
                isCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100'
              }`}>
              <div className="truncate text-sm font-medium text-gray-900">
                Black Sabbath
              </div>
              <div className="truncate text-xs text-gray-500">
                beepboop@example.com
              </div>
            </div>
            <div
              className={`transition-all duration-300 ${
                isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
              }`}>
              <EllipsisVerticalIcon className="h-5 w-5 text-gray-500" />
            </div>
          </MenuButton>
          <MenuItems
            transition
            className="absolute bottom-full mb-2 w-48 origin-bottom-left rounded-xl border border-gray-200 bg-white p-1 text-sm text-gray-900 shadow-lg transition duration-100 ease-out focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0">
            <MenuItem>
              <button
                onClick={handleSettingsClick}
                className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-gray-100">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Settings
              </button>
            </MenuItem>
            <div className="my-1 h-px bg-gray-200" />
            <MenuItem>
              <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-red-600 text-left hover:bg-red-50">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                  />
                </svg>
                Logout
              </button>
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
    </aside>
  );
}
