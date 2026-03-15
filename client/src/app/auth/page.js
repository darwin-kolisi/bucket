import Link from 'next/link';
import Image from 'next/image';

const FEATURES = [
  {
    title: 'Multiple workspaces',
    desc: 'Keep clients, teams, and personal work separate. Switch in one click.',
  },
  {
    title: 'List, board & calendar',
    desc: 'See your work in the view that makes sense right now.',
  },
  {
    title: 'Progress tracking',
    desc: "Know what's moving and what's blocked with live progress.",
  },
  {
    title: 'Due dates & scheduling',
    desc: 'Set deadlines, get reminders, and stay ahead of delivery dates.',
  },
  {
    title: 'Notes & docs',
    desc: 'Write alongside your tasks. No context switching required.',
  },
  {
    title: 'Quick actions',
    desc: 'Keyboard-first actions for the work you do every day.',
  },
];

export default function LandingPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen app-dots text-[color:var(--text-primary)]">
      <div className="page-shell mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-16 pt-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/work-workspace.png"
              alt="Bucket logo"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="text-sm font-semibold tracking-tight text-[color:var(--text-primary)]">
              Bucket
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/auth/signin"
              className="rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--surface-1)] px-3 py-1.5 text-xs font-medium text-[color:var(--text-secondary)] transition hover:bg-[color:var(--surface-2)]">
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="btn-create rounded-lg px-3 py-1.5 text-xs font-medium">
              Get started
            </Link>
          </div>
        </header>

        <section className="surface-card rounded-2xl p-8 shadow-sm md:p-12">
          <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--text-faint)]">
            Build your workspace
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[color:var(--text-primary)] md:text-4xl">
            Your workspace, without the chaos.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[color:var(--text-muted)]">
            Bucket keeps projects, tasks, and notes in one place so your team
            can ship without the overhead.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/auth/signup"
              className="btn-create rounded-lg px-4 py-2.5 text-sm font-medium">
              Start for free
            </Link>
            <Link
              href="/auth/signin"
              className="rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--surface-1)] px-4 py-2.5 text-sm font-medium text-[color:var(--text-secondary)] transition hover:bg-[color:var(--surface-2)]">
              Sign in to your workspace
            </Link>
          </div>
        </section>

        <section>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--text-faint)]">
              Built for focus
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">
              Everything you need. Nothing you don&apos;t.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="surface-card rounded-xl p-5 shadow-sm">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-[color:var(--surface-2)] text-[color:var(--text-secondary)]">
                  <span className="text-xs font-semibold">◎</span>
                </div>
                <h3 className="text-sm font-semibold text-[color:var(--text-primary)]">
                  {feature.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[color:var(--text-muted)]">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="surface-card rounded-2xl p-8 text-center shadow-sm">
          <h2 className="text-2xl font-semibold text-[color:var(--text-primary)]">
            Ready to get organized?
          </h2>
          <p className="mt-2 text-sm text-[color:var(--text-muted)]">
            Create your workspace in seconds. No credit card required.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/auth/signup"
              className="btn-create rounded-lg px-4 py-2.5 text-sm font-medium">
              Create your workspace
            </Link>
            <Link
              href="/auth/signin"
              className="rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--surface-1)] px-4 py-2.5 text-sm font-medium text-[color:var(--text-secondary)] transition hover:bg-[color:var(--surface-2)]">
              Already have an account? Sign in
            </Link>
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 text-xs text-[color:var(--text-faint)]">
          <span>Bucket</span>
          <span>© {currentYear} Bucket</span>
        </footer>
      </div>
    </div>
  );
}
