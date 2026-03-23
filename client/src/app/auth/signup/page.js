'use client';
import Link from 'next/link';
import Image from 'next/image';
import AuthLayout from '@/components/layout/AuthLayout';
import { GoogleIcon } from '@/components/icons/Icons';
import { authClient } from '@/lib/auth-client';
import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

function SignUpContent() {
  const searchParams = useSearchParams();
  const appOrigin =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const { status, error } = useMemo(() => {
    return {
      status: searchParams.get('status'),
      error: searchParams.get('error'),
    };
  }, [searchParams]);
  const showAlert = status === 'exists' || error;

  return (
    <AuthLayout>
      {/* ── MOBILE ── */}
      <div className="flex h-[100dvh] flex-col overflow-hidden lg:hidden">
        {/* Decorative top — gif panel */}
        <div
          className="relative overflow-hidden bg-black"
          style={{ flex: '0 0 55%' }}>
          <div className="absolute inset-0 bg-[url('/overlay.gif')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />
          <div className="relative z-10 p-6">
            <Link href="/auth" className="flex items-center gap-2">
              <Image
                src="/work-workspace.png"
                alt="Bucket logo"
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="text-sm font-semibold tracking-tight text-white">
                Bucket
              </span>
            </Link>
          </div>
        </div>

        {/* Auth sheet */}
        <div className="surface-card relative z-10 flex min-h-0 flex-1 flex-col rounded-t-3xl px-6 py-8 shadow-xl">
          <div className="flex flex-1 flex-col justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-[color:var(--text-primary)]">
                Build your workspace
              </h1>
              <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                Bucket keeps projects, notes, and tasks organized in one place.
              </p>

              {showAlert && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/30">
                  <p className="text-[12px] font-semibold text-red-900 dark:text-red-200">
                    Account already exists
                  </p>
                  <p className="mt-0.5 text-[12px] text-red-700 dark:text-red-200/80">
                    You already have an account.{' '}
                    <Link href="/auth/signin" className="font-medium underline">
                      Sign in instead.
                    </Link>
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-4">
              <button
                type="button"
                onClick={() =>
                  authClient.signIn.social({
                    provider: 'google',
                    requestSignUp: true,
                    callbackURL: `${appOrigin}/auth/signup?status=exists`,
                    newUserCallbackURL: `${appOrigin}/dashboard`,
                    errorCallbackURL: `${appOrigin}/auth/signup?status=exists`,
                  })
                }
                className="btn-create auth-google-btn flex w-full items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-medium">
                <GoogleIcon />
                Continue with Google
              </button>

              <p className="text-center text-xs text-[color:var(--text-faint)]">
                Already have an account?{' '}
                <Link
                  href="/auth/signin"
                  className="font-semibold text-[color:var(--text-primary)]">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── DESKTOP ── */}
      <div className="hidden min-h-screen lg:flex lg:items-stretch">
        <div className="mx-auto flex w-full max-w-6xl gap-5 px-6 py-6">
          {/* Left: gif panel */}
          <div className="relative flex-[1.1] overflow-hidden rounded-3xl bg-black">
            <div className="absolute inset-0 bg-[url('/overlay.gif')] bg-cover bg-center" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50" />
            <div className="relative z-10 flex h-full flex-col justify-between p-10">
              <Link href="/auth" className="flex items-center gap-2">
                <Image
                  src="/work-workspace.png"
                  alt="Bucket logo"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span className="text-sm font-semibold tracking-tight text-white">
                  Bucket
                </span>
              </Link>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
                  Build your workspace
                </p>
                <h1 className="mt-2 text-3xl font-semibold text-white">
                  Start with a clean slate
                </h1>
                <p className="mt-2 text-sm text-white/70">
                  Set up Bucket once, then keep every project in sync.
                </p>
              </div>
            </div>
          </div>

          {/* Right: form (no card on desktop) */}
          <div className="flex flex-[0.9] flex-col justify-center px-10 py-10">
            <div className="w-full max-w-sm">
              <h2 className="text-xl font-semibold tracking-tight text-[color:var(--text-primary)]">
                Create account
              </h2>

              {showAlert && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/30">
                  <p className="text-[12px] font-semibold text-red-900 dark:text-red-200">
                    Account already exists
                  </p>
                  <p className="mt-0.5 text-[12px] text-red-700 dark:text-red-200/80">
                    You already have an account.{' '}
                    <Link href="/auth/signin" className="font-medium underline">
                      Sign in instead.
                    </Link>
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  authClient.signIn.social({
                    provider: 'google',
                    requestSignUp: true,
                    callbackURL: `${appOrigin}/auth/signup?status=exists`,
                    newUserCallbackURL: `${appOrigin}/dashboard`,
                    errorCallbackURL: `${appOrigin}/auth/signup?status=exists`,
                  })
                }
                className="btn-create auth-google-btn mt-6 flex w-full items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-medium">
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="mt-5 border-t border-[color:var(--border-subtle)] pt-5">
                <p className="text-center text-xs text-[color:var(--text-faint)]">
                  Already have an account?{' '}
                  <Link
                    href="/auth/signin"
                    className="font-semibold text-[color:var(--text-primary)]">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpContent />
    </Suspense>
  );
}
