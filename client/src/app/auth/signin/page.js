'use client';
import Link from 'next/link';
import AuthLayout from '@/components/layout/AuthLayout';
import { GoogleIcon } from '@/components/icons/Icons';
import { authClient } from '@/lib/auth-client';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SignInPage() {
  const searchParams = useSearchParams();
  const { status, error } = useMemo(() => {
    return {
      status: searchParams.get('status'),
      error: searchParams.get('error'),
    };
  }, [searchParams]);

  return (
    <AuthLayout>
      <main className="relative min-h-screen bg-white md:bg-gray-50 flex items-center justify-center px-0 md:px-6 py-0 md:py-12">
        <div className="w-full md:max-w-6xl">
          <section className="grid gap-6 md:gap-10 md:grid-cols-[140px_1fr] items-start w-full">
            <aside className="hidden md:flex flex-col gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                Get started
              </p>
              <Link href="/auth" className="text-xs text-gray-400 hover:text-gray-600" aria-label="Back to landing">
                ← Back
              </Link>
            </aside>

            <section className="relative bg-white md:rounded-lg md:border md:border-gray-200 p-6 md:p-8 md:shadow-sm min-h-screen md:min-h-0 flex flex-col justify-center md:mx-auto md:max-w-md md:w-full">
              <span className="pointer-events-none hidden md:block absolute -left-6 top-0 h-[200vh] w-px -translate-y-1/2 border-l border-dashed border-gray-200" />
              <span className="pointer-events-none hidden md:block absolute -right-6 top-0 h-[200vh] w-px -translate-y-1/2 border-l border-dashed border-gray-200" />
              <span className="pointer-events-none hidden md:block absolute -top-6 left-0 h-px w-[200vw] -translate-x-1/2 border-t border-dashed border-gray-200" />
              <span className="pointer-events-none hidden md:block absolute -bottom-6 left-0 h-px w-[200vw] -translate-x-1/2 border-t border-dashed border-gray-200" />
              <span className="pointer-events-none hidden md:block absolute -left-6 -top-6 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-[3px] border border-gray-200 bg-white" />
              <span className="pointer-events-none hidden md:block absolute -right-6 -top-6 h-2.5 w-2.5 translate-x-1/2 -translate-y-1/2 rounded-[3px] border border-gray-200 bg-white" />
              <span className="pointer-events-none hidden md:block absolute -left-6 -bottom-6 h-2.5 w-2.5 -translate-x-1/2 translate-y-1/2 rounded-[3px] border border-gray-200 bg-white" />
              <span className="pointer-events-none hidden md:block absolute -right-6 -bottom-6 h-2.5 w-2.5 translate-x-1/2 translate-y-1/2 rounded-[3px] border border-gray-200 bg-white" />

              <Link href="/auth" className="absolute top-6 left-6 md:hidden text-xs text-gray-400 hover:text-gray-600" aria-label="Back to landing">
                ← Back
              </Link>

              <header>
                <h1 className="text-lg font-semibold text-gray-900">Sign in</h1>
                <p className="mt-1.5 text-xs text-gray-500">
                  Use your Google account to continue.
                </p>
              </header>

              {(status === 'no_account' || error) && (
                <section className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3" role="alert">
                  <div className="font-semibold text-xs text-amber-900">No account found</div>
                  <p className="mt-1 text-xs text-amber-800">
                    You don&apos;t have an account yet. Please sign up first.
                  </p>
                </section>
              )}

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() =>
                    authClient.signIn.social({
                      provider: 'google',
                      requestSignUp: false,
                      callbackURL: 'http://localhost:3000/dashboard',
                      newUserCallbackURL: 'http://localhost:3000/dashboard',
                      errorCallbackURL:
                        'http://localhost:3000/auth/signin?status=no_account',
                    })
                  }
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-normal text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-md transition-colors">
                  <GoogleIcon />
                  Sign in with Google
                </button>
              </div>

              <footer className="mt-6 pt-6 border-t border-gray-100 text-center text-xs text-gray-500">
                Don&apos;t have an account?{' '}
                <Link href="/auth/signup" className="text-gray-900 font-medium hover:text-gray-700">
                  Sign up
                </Link>
              </footer>
            </section>
          </section>
        </div>
      </main>
    </AuthLayout>
  );
}
