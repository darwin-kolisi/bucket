'use client';
import { useState } from 'react';

export default function Dashboard({
  projects = [],
  onProjectSelect,
  onNavigate,
}) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen pb-20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 truncate">Total Projects</p>
                <p className="text-2xl font-semibold text-gray-900">0</p>
              </div>
            </div>
          </div>
        ))}
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
