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
    <section className="page-shell relative w-full overflow-hidden px-6 md:px-10">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 right-[-10%] h-64 w-64 rounded-full bg-white/80" />
        <div className="absolute -bottom-28 left-[-10%] h-72 w-72 rounded-full bg-blue-50/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--dot-color)_1px,transparent_1px)] [background-size:28px_28px] opacity-40" />
      </div>

      <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col justify-center py-10 md:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-gray-400">
          ☆⋆｡𖦹°‧ᯓ★.
        </p>

        <div className="mt-5 inline-flex w-fit items-center rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-xs font-medium uppercase tracking-wide text-gray-600">
          404
        </div>

        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-gray-900 md:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-600 md:text-base">
          {message}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
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
    </section>
  );
}
