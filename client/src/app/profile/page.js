'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { useErrorToast } from '@/components/ui/ErrorToastProvider';
import { fetchAccount, updateAccount } from '@/lib/account-api';

const formatDateTime = (value) => {
  if (!value) return 'Unknown';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Unknown';

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
};

const getInitials = (name, email) => {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }

  if (email?.trim()) {
    return email.trim().slice(0, 2).toUpperCase();
  }

  return 'U';
};

export default function ProfilePage() {
  const router = useRouter();
  const { pushError } = useErrorToast();
  const [profile, setProfile] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState('');

  const initials = useMemo(
    () => getInitials(profile?.name, profile?.email),
    [profile?.email, profile?.name],
  );

  const hasChanges =
    profile && displayName.trim() !== (profile.name || '').trim();

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const user = await fetchAccount();
        if (!isMounted) return;
        setProfile(user);
        setDisplayName(user.name || '');
      } catch (error) {
        if (!isMounted) return;
        if (error?.status === 401) {
          router.replace('/auth/signin');
          return;
        }
        pushError(error?.message || 'Failed to load account profile');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [pushError, router]);

  const handleSave = async () => {
    const trimmedName = displayName.trim();
    if (!trimmedName) {
      pushError('Name is required.');
      return;
    }

    setIsSaving(true);
    setSaveNotice('');

    try {
      const updatedUser = await updateAccount({ name: trimmedName });
      setProfile(updatedUser);
      setDisplayName(updatedUser.name || '');
      setSaveNotice('Profile updated.');
    } catch (error) {
      pushError(error?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-[1400px] p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
          </div>
          <Link
            href="/settings"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
            Open Settings
          </Link>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          {/* Profile Details */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-gray-900">
              Account Details
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Update your profile information
            </p>

            {isLoading ? (
              <p className="mt-6 text-sm text-gray-500">Loading...</p>
            ) : (
              <div className="mt-6 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-900 text-sm font-semibold text-white dark:border dark:border-gray-700 dark:bg-gray-100 dark:text-gray-900">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {profile?.name || 'Unnamed user'}
                    </p>
                    <p className="text-xs text-gray-500">{profile?.email}</p>
                  </div>
                </div>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500">
                    Display Name
                  </span>
                  <input
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    type="text"
                    placeholder="Your name"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 transition focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500">
                    Email Address
                  </span>
                  <input
                    value={profile?.email || ''}
                    readOnly
                    type="email"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500"
                  />
                </label>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!hasChanges || isSaving || isLoading}
                    className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50">
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  {saveNotice && (
                    <p className="text-sm text-green-700">{saveNotice}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Account Info */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-gray-900">
              Account Info
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Account status and metadata
            </p>

            <div className="mt-6 space-y-4">
              <div className="border-b border-gray-100 pb-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Created
                </p>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDateTime(profile?.createdAt)}
                </p>
              </div>

              <div className="border-b border-gray-100 pb-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Last Updated
                </p>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDateTime(profile?.updatedAt)}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Email Status
                </p>
                <p className="mt-1 text-sm text-gray-900">
                  {profile?.emailVerified ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Not verified
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
