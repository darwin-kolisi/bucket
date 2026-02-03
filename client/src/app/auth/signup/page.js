'use client';
import Link from 'next/link';
import AuthLayout from '@/components/layout/AuthLayout';
import { GoogleIcon } from '@/components/icons/Icons';
import { authClient } from '@/lib/auth-client';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const { status, error } = useMemo(() => {
    return {
      status: searchParams.get('status'),
      error: searchParams.get('error'),
    };
  }, [searchParams]);

  return (
    <AuthLayout>
      <div className="p-6 md:p-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h1 className="text-xl font-semibold text-gray-900">Sign up</h1>
            <p className="mt-2 text-sm text-gray-600">
              Create your account with Google.
            </p>

            {(status === 'exists' || error) && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm text-red-900">
                <div className="font-semibold">Account already exists</div>
                <p className="mt-1 text-xs text-red-800">
                  You already have an account. Please sign in instead.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                authClient.signIn.social({
                  provider: 'google',
                  requestSignUp: true,
                  callbackURL:
                    'http://localhost:3000/auth/signup?status=exists',
                  newUserCallbackURL: 'http://localhost:3000/dashboard',
                  errorCallbackURL:
                    'http://localhost:3000/auth/signup?status=exists',
                })
              }
              className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              <GoogleIcon />
              Sign up with Google
            </button>

            <div className="mt-6 text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-gray-900 font-medium">
                Sign in
              </Link>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              <Link href="/auth" className="text-gray-900 font-medium">
                Back to landing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
