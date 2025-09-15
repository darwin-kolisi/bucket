'use client';

const ArrowLeftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="mr-2 h-4 w-4">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
    />
  </svg>
);

export default function NotFound({ isCollapsed }) {
  return (
    <main
      className={`flex-1 overflow-y-auto bg-white transition-all duration-300 ${
        isCollapsed ? 'ml-[88px]' : 'ml-[280px]'
      }`}>
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <p className="select-none text-8xl font-mono font-bold text-gray-200">
          Oops!
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-800">
          Page Not Found
        </h1>
        <p className="mt-4 max-w-sm text-base text-gray-600">
          This page is still under construction or does not exist. Please check
          back later or navigate to a different section.
        </p>
        <button
          onClick={() => (window.location.href = '/projects')}
          className="mt-8 flex items-center justify-center rounded-lg border border-gray-800 bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-900">
          <ArrowLeftIcon />
          Go to Projects
        </button>
      </div>
    </main>
  );
}
