import Link from 'next/link';
import AuthLayout from '@/components/layout/AuthLayout';
import { GoogleIcon } from '@/components/icons/Icons';

export default function SignInPage() {
  return (
    <AuthLayout>
      <div className="p-6 md:p-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h1 className="text-xl font-semibold text-gray-900">Sign in</h1>
            <p className="mt-2 text-sm text-gray-600">
              Use your Google account to continue.
            </p>

            <button
              type="button"
              className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              <GoogleIcon />
              Sign in with Google
            </button>

            <div className="mt-6 text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="text-gray-900 font-medium">
                Sign up
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
