'use client';
import { useState } from 'react';
import { useAppContext } from '@/app/providers/Provider';

export default function Dashboard({ onProjectSelect, onNavigate }) {
  const { projects } = useAppContext();
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');

  const totalProjects = projects.length;
  const activeProjects = projects.filter(
    (p) => p.status !== 'Completed' && p.status !== 'At Risk'
  ).length;
  const atRiskProjects = projects.filter((p) => p.status === 'At Risk').length;
  const completedProjects = projects.filter(
    (p) => p.status === 'Completed'
  ).length;

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen pb-20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <svg
                className="h-7 w-7 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500 truncate">Total Projects</p>
              <p className="text-xl font-semibold text-gray-900">
                {totalProjects}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <svg
                className="h-7 w-7 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500 truncate">Active Projects</p>
              <p className="text-xl font-semibold text-gray-900">
                {activeProjects}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <svg
                className="h-7 w-7 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500 truncate">Projects At Risk</p>
              <p className="text-xl font-semibold text-gray-900">
                {atRiskProjects}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <svg
                className="h-7 w-7 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500 truncate">Completed</p>
              <p className="text-xl font-semibold text-gray-900">
                {completedProjects}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">
              Recent Projects
            </h2>
          </div>
          <div className="text-center py-8 text-gray-500 text-sm">
            No projects yet. Create your first project to get started.
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Project Status
          </h2>
          <div className="text-center py-4 text-gray-500 text-sm">
            No data available
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">
            Upcoming Tasks
          </h2>
        </div>
        <div className="text-center py-8 text-gray-500 text-sm">
          No upcoming tasks. You're all caught up!
        </div>
      </div>
    </div>
  );
}
