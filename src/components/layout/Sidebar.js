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
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round">
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
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round">
          <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
        </svg>
      ),
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
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
      className={`fixed top-0 left-0 z-50 flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300 ${
        isCollapsed ? 'w-[88px]' : 'w-[280px]'
      }`}>
      <div
        className={`relative flex items-center justify-between border-b border-gray-200 px-5 transition-all duration-300 ${
          isCollapsed ? 'h-[78px]' : 'h-[78px]'
        }`}>
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
            <h3 className="whitespace-nowrap text-lg font-semibold text-gray-900">
              BUCKET
            </h3>
          </div>
        </div>
        <button
          onClick={onToggleCollapse}
          className="absolute -right-3 top-[28px] rounded-full border border-gray-200 bg-white p-1 shadow-sm hover:bg-gray-50">
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

      <nav className="flex-1 overflow-y-auto px-4 py-8">
        <div>
          {navigationItems.map((item) => (
            <button
              key={item.id}
              className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 mb-2 text-sm transition-colors ${
                activeItem === item.id
                  ? 'bg-gray-100 border-gray-200 font-semibold text-gray-900'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-200 hover:text-gray-900'
              }`}
              onClick={() => handleItemClick(item.id)}>
              <span className="flex-shrink-0">{item.icon}</span>
              {!isCollapsed && <span className="nav-label">{item.label}</span>}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {!isCollapsed && (
            <div className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Buckets
            </div>
          )}
          {bucketItems.map((item) => {
            const isActive = activeItem === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 mb-2 text-sm transition-colors ${
                  activeItem === item.id
                    ? 'bg-gray-100 border-gray-200 font-semibold text-gray-900'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-200 hover:text-gray-900'
                }`}>
                <span
                  className={`h-2 w-2 flex-shrink-0 rounded-full ${item.color}`}
                />
                {!isCollapsed && (
                  <div className="flex w-full items-center justify-between">
                    <span className="truncate">{item.label}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        isActive
                          ? 'bg-white text-gray-600'
                          : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                      }`}>
                      {item.count}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-gray-200 p-4">
        <Menu as="div" className="relative">
          <MenuButton className="flex w-full items-center gap-3 rounded-lg border border-transparent px-2 py-2 text-left transition hover:border-gray-200 hover:bg-gray-50">
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
            className="absolute bottom-full mb-2 w-[200px] origin-bottom-left rounded-xl border border-gray-200 bg-white p-1 text-sm/6 text-gray-900 shadow-lg transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0">
            <MenuItem>
              {({ focus }) => (
                <button
                  className={`group flex w-full items-center gap-2 rounded-lg px-3 py-2 ${
                    focus ? 'bg-gray-100' : ''
                  }`}>
                  View Profile
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ focus }) => (
                <button
                  className={`group flex w-full items-center gap-2 rounded-lg px-3 py-2 ${
                    focus ? 'bg-gray-100' : ''
                  }`}>
                  Settings
                </button>
              )}
            </MenuItem>
            <div className="my-1 h-px bg-gray-200" />
            <MenuItem>
              {({ focus }) => (
                <button
                  className={`group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-red-600 ${
                    focus ? 'bg-red-50' : ''
                  }`}>
                  Logout
                </button>
              )}
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
    </aside>
  );
}
