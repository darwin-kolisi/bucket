import Link from 'next/link';
import AuthLayout from '@/components/layout/AuthLayout';

export default function AuthLandingPage() {
  return (
    <AuthLayout>
      <div className="p-6 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-8 md:p-12">
            <h1 className="text-2xl font-semibold text-gray-900">
              Bucket
            </h1>
            <p className="mt-3 text-sm text-gray-600">
              A lightweight project management app to organize your work, notes,
              and tasks in one place.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/auth/signup"
                className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-lg transition-colors">
                Sign up
              </Link>
              <Link
                href="/auth/signin"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
