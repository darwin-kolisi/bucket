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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Recent Projects
          </h2>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Project Status
          </h2>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">
          Upcoming Tasks
        </h2>
      </div>
    </div>
  );
}
