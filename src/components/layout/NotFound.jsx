'use client';
import { useState, useEffect } from 'react';
import { useAppContext } from '@/app/providers/Provider';

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

export default function NotFound() {
  const { isSidebarCollapsed } = useAppContext();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto bg-white min-h-screen">
      <div className="flex h-[calc(100vh-160px)] w-full flex-col items-center justify-center p-4 md:p-8 text-center">
        <p className="select-none text-6xl md:text-8xl font-mono font-bold text-gray-200">
          Oops!
        </p>
        <h1 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight text-gray-800">
          Page Not Found
        </h1>
        <p className="mt-4 max-w-sm text-sm md:text-base text-gray-600 px-4">
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
    </div>
  );
}
