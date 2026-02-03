import Link from 'next/link';
import AuthLayout from '@/components/layout/AuthLayout';

export default function AuthLandingPage() {
  return (
    <AuthLayout>
      <main className="relative min-h-screen bg-white md:bg-gray-50">
        <section className="relative px-6 py-12 md:px-10 flex items-center min-h-screen">
          <div className="mx-auto max-w-6xl w-full">
            <div className="grid gap-6 md:gap-10 md:grid-cols-[140px_1fr] items-start">
              <aside className="hidden md:block text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                Get started
              </aside>

              <section className="relative mx-auto md:max-w-xl w-full md:rounded-lg md:border md:border-gray-200 bg-white p-6 md:p-8 md:shadow-sm">
                <span className="pointer-events-none hidden md:block absolute -left-6 top-0 h-[200vh] w-px -translate-y-1/2 border-l border-dashed border-gray-200" />
                <span className="pointer-events-none hidden md:block absolute -right-6 top-0 h-[200vh] w-px -translate-y-1/2 border-l border-dashed border-gray-200" />
                <span className="pointer-events-none hidden md:block absolute -top-6 left-0 h-px w-[200vw] -translate-x-1/2 border-t border-dashed border-gray-200" />
                <span className="pointer-events-none hidden md:block absolute -bottom-6 left-0 h-px w-[200vw] -translate-x-1/2 border-t border-dashed border-gray-200" />
                <span className="pointer-events-none hidden md:block absolute -left-6 -top-6 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-[3px] border border-gray-200 bg-white" />
                <span className="pointer-events-none hidden md:block absolute -right-6 -top-6 h-2.5 w-2.5 translate-x-1/2 -translate-y-1/2 rounded-[3px] border border-gray-200 bg-white" />
                <span className="pointer-events-none hidden md:block absolute -left-6 -bottom-6 h-2.5 w-2.5 -translate-x-1/2 translate-y-1/2 rounded-[3px] border border-gray-200 bg-white" />
                <span className="pointer-events-none hidden md:block absolute -right-6 -bottom-6 h-2.5 w-2.5 translate-x-1/2 translate-y-1/2 rounded-[3px] border border-gray-200 bg-white" />

                <header>
                  <h1 className="text-lg font-semibold text-gray-900">
                    Build your workspace
                  </h1>
                  <p className="mt-1 text-xs text-gray-500">
                    Bucket keeps projects, notes, and tasks organized in one place for you and your team.
                  </p>
                </header>

                <nav className="mt-6 space-y-2" aria-label="Get started">
                  <Link href="/auth/signup" className="group w-full flex items-center gap-3 rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-normal text-gray-900 transition hover:bg-gray-50 hover:border-gray-300">
                    <span className="flex h-5 w-5 items-center justify-center">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </span>
                    Create an account
                  </Link>

                  <Link href="/auth/signin" className="group w-full flex items-center gap-3 rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-normal text-gray-900 transition hover:bg-gray-50 hover:border-gray-300">
                    <span className="flex h-5 w-5 items-center justify-center">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                    </span>
                    Sign in to Bucket
                  </Link>
                </nav>
              </section>
            </div>
          </div>
        </section>
      </main>
    </AuthLayout>
  );
}
