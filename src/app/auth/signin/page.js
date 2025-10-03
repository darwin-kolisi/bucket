'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // check if user is authenticated
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    // implement better auth login - next week
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Sign in to BUCKET
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Just type a random email & password.
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="text-sm text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="beepboop@example.com"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="text-sm text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-black hover:bg-gray-800 text-white py-2 px-4 rounded-lg font-medium transition-colors">
            Sign in
          </button>

          <p className="text-center text-sm text-gray-600">
            Dont have an account?{' '}
            <button
              type="button"
              onClick={() => router.push('/auth/signup')}
              className="text-gray-900 font-medium hover:underline">
              Sign up
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
