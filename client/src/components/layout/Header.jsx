'use client';

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import NotificationPopup from '@/components/notifications/NotificationPopup';

const getInitials = (name, email) => {
  if (name) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }
  if (email) {
    const local = email.split('@')[0] || '';
    return local.slice(0, 2).toUpperCase() || 'U';
  }
  return 'U';
};

export default function Header({ isMobileMenuOpen, onMenuClick }) {
  const router = useRouter();
  const session = authClient.useSession();
  const user = session?.data?.user;
  const initials = getInitials(user?.name, user?.email);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
    } finally {
      router.push('/auth/signin');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-[var(--chrome-height)] bg-white">
      <div className="flex h-full items-center gap-3 px-5 md:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Toggle menu"
          aria-expanded={!!isMobileMenuOpen}
          aria-controls="mobile-sidebar"
          className="inline-flex h-9 w-9 items-center justify-center text-gray-700 transition hover:text-gray-900 md:hidden">
          {isMobileMenuOpen ? (
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          ) : (
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M3 12h18" />
              <path d="M3 18h18" />
            </svg>
          )}
        </button>
        <div className="ml-auto">
          <NotificationPopup />
        </div>
        <Menu as="div" className="relative ml-1">
          <MenuButton className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-[#000] text-xs font-semibold text-white transition hover:opacity-90 dark:bg-white dark:text-gray-900">
            {initials}
          </MenuButton>
          <MenuItems
            transition
            className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl border border-gray-200 bg-white p-1 text-sm text-gray-900 shadow-lg transition duration-100 ease-out focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0">
            <MenuItem>
              <button
                onClick={() => router.push('/settings')}
                className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-gray-100">
                Settings
              </button>
            </MenuItem>
            <MenuItem>
              <button
                onClick={() => router.push('/profile')}
                className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-gray-100">
                Profile
              </button>
            </MenuItem>
            <div className="my-1 h-px bg-gray-200" />
            <MenuItem>
              <button
                onClick={handleLogout}
                className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-red-600 text-left hover:bg-red-50">
                Logout
              </button>
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
    </header>
  );
}
