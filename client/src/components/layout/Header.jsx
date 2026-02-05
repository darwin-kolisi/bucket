'use client';

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

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

export default function Header() {
  const router = useRouter();
  const session = authClient.useSession();
  const user = session?.data?.user;
  const initials = getInitials(user?.name, user?.email);

  const handleSettingsClick = () => {
    window.dispatchEvent(new CustomEvent('openSettings'));
  };

  const handleLogout = async () => {
    try {
      await authClient.signOut();
    } finally {
      router.push('/auth/signin');
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-[var(--app-bg)]">
      <div className="h-14 flex items-center justify-end px-5 md:px-8">
        <Menu as="div" className="relative">
          <MenuButton className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-black text-xs font-semibold text-white transition hover:opacity-90">
            {initials}
          </MenuButton>
          <MenuItems
            transition
            className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl border border-gray-200 bg-white p-1 text-sm text-gray-900 shadow-lg transition duration-100 ease-out focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0">
            <MenuItem>
              <button
                onClick={handleSettingsClick}
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
