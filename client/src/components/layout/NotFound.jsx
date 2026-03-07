'use client';

import { useRouter } from 'next/navigation';

export default function NotFound({
  title = 'Page not found',
  message = "The page you're trying to reach is missing or unavailable right now.",
  primaryLabel = 'Go to Projects',
  primaryHref = '/projects',
  secondaryLabel = 'Open Dashboard',
  secondaryHref = '/dashboard',
}) {
  const router = useRouter();

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center p-6 md:p-8">
      <div className="w-full max-w-3xl">
        <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-8 shadow-sm md:p-10">
          <div className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-gray-100" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-blue-50/70" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-gray-600">
              404
            </div>

            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600 md:text-base">
              {message}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => router.push(primaryHref)}
                className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800">
                {primaryLabel}
              </button>
              <button
                type="button"
                onClick={() => router.push(secondaryHref)}
                className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                {secondaryLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
