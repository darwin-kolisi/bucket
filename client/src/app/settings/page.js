'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { useAppContext } from '@/app/providers/Provider';
import { useErrorToast } from '@/components/ui/ErrorToastProvider';
import { authClient } from '@/lib/auth-client';
import { deleteAccount, fetchAccount } from '@/lib/account-api';

const LANGUAGE_KEY = 'bucket-language';
const TIMEZONE_KEY = 'bucket-timezone';

const languageOptions = ['English', 'isiXhosa', 'Afrikaans'];
const timezoneOptions = [
  'UTC-8 (PST)',
  'UTC-5 (EST)',
  'UTC+0 (GMT)',
  'UTC+1 (CET)',
  'UTC+2 (SAST)',
];

export default function SettingsPage() {
  const router = useRouter();
  const { pushError } = useErrorToast();
  const { theme, setTheme } = useAppContext();
  const [language, setLanguage] = useState('English');
  const [timezone, setTimezone] = useState('UTC+2 (SAST)');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingAccount, setIsLoadingAccount] = useState(true);
  const [account, setAccount] = useState(null);

  const canDelete = deleteConfirmation.trim() === 'DELETE' && !isDeleting;

  const profileEmail = useMemo(
    () => account?.email || 'Not available',
    [account],
  );

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem(LANGUAGE_KEY);
    const storedTimezone = window.localStorage.getItem(TIMEZONE_KEY);

    if (storedLanguage && languageOptions.includes(storedLanguage)) {
      setLanguage(storedLanguage);
    }
    if (storedTimezone && timezoneOptions.includes(storedTimezone)) {
      setTimezone(storedTimezone);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    window.localStorage.setItem(TIMEZONE_KEY, timezone);
  }, [timezone]);

  useEffect(() => {
    let isMounted = true;

    const loadAccount = async () => {
      try {
        const user = await fetchAccount();
        if (!isMounted) return;
        setAccount(user);
      } catch (error) {
        if (!isMounted) return;
        if (error?.status === 401) {
          router.replace('/auth/signin');
          return;
        }
        pushError(error?.message || 'Failed to load account');
      } finally {
        if (isMounted) {
          setIsLoadingAccount(false);
        }
      }
    };

    loadAccount();

    return () => {
      isMounted = false;
    };
  }, [pushError, router]);

  const handleDeleteAccount = async () => {
    if (!canDelete) {
      pushError('Type DELETE in the confirmation field to continue.');
      return;
    }

    const confirmed = window.confirm(
      'This permanently deletes your account and workspace data. Continue?',
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAccount('DELETE');
      window.localStorage.removeItem(LANGUAGE_KEY);
      window.localStorage.removeItem(TIMEZONE_KEY);
      window.localStorage.removeItem('bucket-theme');
      try {
        await authClient.signOut();
      } catch (error) {
        // Account is already deleted, so sign-out can fail safely.
      }
      router.replace('/auth');
    } catch (error) {
      pushError(error?.message || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-[1400px] p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
          </div>
          <Link
            href="/profile"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50">
            View Profile
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Appearance */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900">Appearance</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Choose your interface theme
            </p>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <button
                onClick={() => setTheme('light')}
                className={`rounded-lg border p-3 text-center transition-all ${
                  theme === 'light'
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                <div className="mb-2 flex h-12 w-full items-center justify-center rounded border border-gray-200 bg-white">
                  <div className="h-4 w-4 rounded bg-gray-100"></div>
                </div>
                <span className="text-xs font-medium text-gray-900">Light</span>
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`rounded-lg border p-3 text-center transition-all ${
                  theme === 'dark'
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                <div className="mb-2 flex h-12 w-full items-center justify-center rounded border border-gray-600 bg-gray-800">
                  <div className="h-4 w-4 rounded bg-gray-600"></div>
                </div>
                <span className="text-xs font-medium text-gray-900">Dark</span>
              </button>

              <button
                onClick={() => setTheme('system')}
                className={`rounded-lg border p-3 text-center transition-all ${
                  theme === 'system'
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                <div className="mb-2 flex h-12 w-full items-center justify-center rounded border border-gray-300 bg-gradient-to-r from-white to-gray-800">
                  <div className="h-4 w-4 rounded bg-gradient-to-r from-gray-200 to-gray-600"></div>
                </div>
                <span className="text-xs font-medium text-gray-900">
                  System
                </span>
              </button>
            </div>
          </div>

          {/* Preferences */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900">Preferences</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Language and timezone settings
            </p>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500">
                  Language
                </span>
                <div className="relative">
                  <select
                    value={language}
                    onChange={(event) => setLanguage(event.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 pr-10 text-sm text-gray-900 transition focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400">
                    {languageOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </div>
                </div>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500">
                  Timezone
                </span>
                <div className="relative">
                  <select
                    value={timezone}
                    onChange={(event) => setTimezone(event.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 pr-10 text-sm text-gray-900 transition focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400">
                    {timezoneOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">
            Delete Account
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Permanently delete your account and all data for{' '}
            {isLoadingAccount ? '...' : profileEmail}
          </p>

          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-red-900">
              Warning
            </p>
            <p className="mt-1 text-sm text-red-800">
              This action cannot be undone. All projects, tasks, and workspace
              data will be permanently deleted.
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                value={deleteConfirmation}
                onChange={(event) => setDeleteConfirmation(event.target.value)}
                placeholder='Type "DELETE" to confirm'
                className="w-full rounded-lg border border-red-200 bg-white px-3 py-2.5 text-sm text-gray-900 transition focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400 sm:w-64"
              />
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={!canDelete}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
