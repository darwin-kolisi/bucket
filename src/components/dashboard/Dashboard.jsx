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

  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate))
    .slice(0, 3);

  const allTasks = projects.flatMap((project) =>
    (project.tasks || []).map((task) => ({
      ...task,
      projectName: project.name,
      projectStatus: project.status,
    }))
  );

  const upcomingTasks = allTasks
    .filter((task) => task.status !== 'done')
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-500';
      case 'On Track':
        return 'bg-green-500';
      case 'At Risk':
        return 'bg-red-500';
      case 'Completed':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

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
            <button
              onClick={() => onNavigate && onNavigate('projects')}
              className="text-xs text-gray-500 hover:text-gray-700">
              View all
            </button>
          </div>

          {recentProjects.length > 0 ? (
            <div className="space-y-3">
              {recentProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => onProjectSelect && onProjectSelect(project)}
                  className="w-full group flex items-start gap-3 rounded-lg px-3 py-3 hover:bg-gray-50 text-left border border-gray-100 transition-colors">
                  <div className="flex-shrink-0 mt-1.5">
                    <div
                      className={`w-2 h-2 rounded-full ${getStatusColor(
                        project.status
                      )}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 truncate text-sm">
                          {project.name}
                        </div>
                        <div className="text-gray-500 text-xs truncate mt-0.5">
                          {project.description}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {project.dueDate}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500">
                        {project.tasks?.length || 0} tasks
                      </span>
                      <span className="text-gray-300">•</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          project.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-700'
                            : project.status === 'On Track'
                            ? 'bg-green-50 text-green-700'
                            : project.status === 'At Risk'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-gray-50 text-gray-700'
                        }`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              No projects yet. Create your first project to get started.
            </div>
          )}
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedTimeRange('week')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                selectedTimeRange === 'week'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}>
              This week
            </button>
            <button
              onClick={() => setSelectedTimeRange('month')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                selectedTimeRange === 'month'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}>
              This month
            </button>
          </div>
        </div>

        {upcomingTasks.length > 0 ? (
          <div className="space-y-2">
            {upcomingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 rounded-lg px-3 py-3 border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 mt-1">
                  <div
                    className={`w-2 h-2 rounded-full ${getStatusColor(
                      task.projectStatus
                    )}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 text-sm truncate">
                        {task.title}
                      </div>
                      <div className="text-gray-500 text-xs mt-0.5 truncate">
                        {task.projectName}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {task.priority && (
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(
                            task.priority
                          )}`}>
                          {task.priority}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {task.date}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            No upcoming tasks. You're all caught up!
          </div>
        )}
      </div>
    </div>
  );
}
