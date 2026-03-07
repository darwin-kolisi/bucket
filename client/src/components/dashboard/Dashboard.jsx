'use client';
import { useMemo, useState } from 'react';
import { useAppContext } from '@/app/providers/Provider';
import {
  BoardIcon,
  CalendarIcon,
  ClockIcon,
} from '@/components/icons/Icons';

const STATUS_ORDER = ['in_progress', 'on_track', 'at_risk', 'completed'];

const STATUS_META = {
  in_progress: {
    label: 'In Progress',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    dot: 'bg-orange-600',
    pie: '#ea580c',
  },
  on_track: {
    label: 'On Track',
    color: 'text-green-700',
    bg: 'bg-green-50',
    dot: 'bg-green-600',
    pie: '#16a34a',
  },
  at_risk: {
    label: 'At Risk',
    color: 'text-red-700',
    bg: 'bg-red-50',
    dot: 'bg-red-600',
    pie: '#dc2626',
  },
  completed: {
    label: 'Completed',
    color: 'text-gray-600',
    bg: 'bg-gray-50',
    dot: 'bg-gray-500',
    pie: '#6b7280',
  },
};

const PRIORITY_META = {
  high: 'text-red-600 bg-red-50 border border-red-200',
  medium: 'text-orange-600 bg-orange-50 border border-orange-200',
  low: 'text-gray-600 bg-gray-50 border border-gray-200',
};

const normalizeProjectStatus = (status) => {
  const normalized = status
    ?.toString()
    .toLowerCase()
    .replace(/-/g, '_')
    .replace(/\s+/g, '_');
  if (STATUS_ORDER.includes(normalized)) {
    return normalized;
  }
  return 'in_progress';
};

const normalizeTaskStatus = (status) => {
  const normalized = status
    ?.toString()
    .toLowerCase()
    .replace(/-/g, '_')
    .replace(/\s+/g, '_');
  if (normalized === 'done' || normalized === 'completed') {
    return 'completed';
  }
  return normalized || 'todo';
};

const parseDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const formatDate = (value) => {
  const parsed = parseDate(value);
  if (!parsed) return 'No due date';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
};

const getDaysLabel = (targetDate) => {
  if (!targetDate) return 'No date';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((targetDate.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return `${Math.abs(diff)} day${Math.abs(diff) === 1 ? '' : 's'} overdue`;
  if (diff === 0) return 'Due today';
  if (diff === 1) return 'Due tomorrow';
  return `${diff} days left`;
};

export default function Dashboard({ onProjectSelect, onNavigate }) {
  const { projects } = useAppContext();
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');

  const dashboardData = useMemo(() => {
    const statusCount = {
      in_progress: 0,
      on_track: 0,
      at_risk: 0,
      completed: 0,
    };

    const mappedProjects = projects.map((project) => {
      const statusKey = normalizeProjectStatus(project.status);
      statusCount[statusKey] += 1;

      const tasks = project.tasks || [];
      const totalTasks = project.totalTasks ?? tasks.length;
      const completedTasks =
        project.completedTasks ??
        tasks.filter((task) => normalizeTaskStatus(task.status) === 'completed')
          .length;

      return {
        ...project,
        statusKey,
        totalTasks,
        completedTasks,
      };
    });

    const allTasks = mappedProjects.flatMap((project) =>
      (project.tasks || []).map((task, index) => ({
        ...task,
        uniqueKey: `${project.id}-${task.id || index}`,
        projectId: project.id,
        projectName: project.name,
        projectStatusKey: project.statusKey,
        dueDateObj: parseDate(task.dueDate || task.date),
        statusKey: normalizeTaskStatus(task.status),
      }))
    );

    const totalTasks = mappedProjects.reduce(
      (sum, project) => sum + (project.totalTasks || 0),
      0
    );
    const completedTasks = mappedProjects.reduce(
      (sum, project) => sum + (project.completedTasks || 0),
      0
    );

    return {
      mappedProjects,
      statusCount,
      totalProjects: mappedProjects.length,
      totalTasks,
      completedTasks,
      allTasks,
    };
  }, [projects]);

  const completionRate = dashboardData.totalTasks
    ? Math.round((dashboardData.completedTasks / dashboardData.totalTasks) * 100)
    : 0;

  const recentProjects = useMemo(
    () =>
      [...dashboardData.mappedProjects]
        .sort(
          (a, b) =>
            (parseDate(b.updatedAt)?.getTime() || 0) -
            (parseDate(a.updatedAt)?.getTime() || 0)
        )
        .slice(0, 5),
    [dashboardData.mappedProjects]
  );

  const upcomingTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const limit = new Date(today);
    if (selectedTimeRange === 'week') {
      limit.setDate(today.getDate() + 7);
    } else {
      limit.setDate(today.getDate() + 30);
    }

    return dashboardData.allTasks
      .filter((task) => {
        if (task.statusKey === 'completed') return false;
        if (!task.dueDateObj) return false;
        return task.dueDateObj >= today && task.dueDateObj <= limit;
      })
      .sort((a, b) => a.dueDateObj.getTime() - b.dueDateObj.getTime())
      .slice(0, 6);
  }, [dashboardData.allTasks, selectedTimeRange]);

  const deadlineFeed = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inTwentyOneDays = new Date(today);
    inTwentyOneDays.setDate(today.getDate() + 21);

    const projectEntries = dashboardData.mappedProjects
      .map((project) => {
        const dueDateObj = parseDate(project.dueDate);
        if (!dueDateObj || dueDateObj < today || dueDateObj > inTwentyOneDays) {
          return null;
        }
        return {
          id: project.id,
          type: 'Project',
          title: project.name,
          subtitle: project.description || 'No description',
          statusKey: project.statusKey,
          dueDateObj,
          dueLabel: formatDate(project.dueDate),
          onClick: () => onProjectSelect && onProjectSelect(project),
        };
      })
      .filter(Boolean);

    const taskEntries = dashboardData.allTasks
      .map((task) => {
        if (!task.dueDateObj || task.dueDateObj < today || task.dueDateObj > inTwentyOneDays) {
          return null;
        }
        if (task.statusKey === 'completed') return null;
        return {
          id: task.uniqueKey,
          type: 'Task',
          title: task.title || 'Untitled task',
          subtitle: task.projectName,
          statusKey: task.projectStatusKey,
          dueDateObj: task.dueDateObj,
          dueLabel: formatDate(task.dueDateObj),
          onClick: () => {
            const targetProject = dashboardData.mappedProjects.find(
              (project) => project.id === task.projectId
            );
            if (targetProject && onProjectSelect) {
              onProjectSelect(targetProject);
            }
          },
        };
      })
      .filter(Boolean);

    return [...projectEntries, ...taskEntries]
      .sort((a, b) => a.dueDateObj.getTime() - b.dueDateObj.getTime())
      .slice(0, 5);
  }, [dashboardData, onProjectSelect]);

  const pieGradient = useMemo(() => {
    if (!dashboardData.totalProjects) {
      return 'conic-gradient(#e5e7eb 0deg 360deg)';
    }

    let current = 0;
    const slices = STATUS_ORDER.map((statusKey) => {
      const count = dashboardData.statusCount[statusKey];
      const degrees = (count / dashboardData.totalProjects) * 360;
      const start = current;
      const end = current + degrees;
      current = end;
      return `${STATUS_META[statusKey].pie} ${start}deg ${end}deg`;
    });

    return `conic-gradient(${slices.join(', ')})`;
  }, [dashboardData]);

  return (
    <div className="mx-auto max-w-[1400px] p-6">
      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Projects */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Total Projects
              </p>
              <p className="mt-2 text-2xl font-semibold text-gray-600">
                {dashboardData.totalProjects}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {dashboardData.statusCount.completed} delivered
              </p>
            </div>
          </div>
        </div>

        {/* On Track */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                On Track
              </p>
              <p className="mt-2 text-2xl font-semibold text-green-700">
                {dashboardData.statusCount.on_track}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {dashboardData.statusCount.in_progress} in progress
              </p>
            </div>
          </div>
        </div>

        {/* At Risk */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                At Risk
              </p>
              <p className="mt-2 text-2xl font-semibold text-red-700">
                {dashboardData.statusCount.at_risk}
              </p>
              <p className="mt-1 text-xs text-gray-500">Needs attention</p>
            </div>
          </div>
        </div>

        {/* Task Completion */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Task Completion
              </p>
              <p className="mt-2 text-2xl font-semibold text-orange-700">
                {completionRate}%
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {dashboardData.completedTasks}/{dashboardData.totalTasks} tasks
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Column Layout */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Left Column */}
        <div className="space-y-6 lg:flex-1">
          {/* Project Health */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Project Health
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  Status breakdown
                </p>
              </div>
              <span className="text-xs font-medium text-gray-500">
                {dashboardData.totalProjects} total
              </span>
            </div>

            <div className="mt-7 flex items-center gap-5">
              <div className="relative h-24 w-24 shrink-0">
                <div
                  className="relative h-full w-full overflow-hidden rounded-full border border-gray-200"
                  style={{
                    background: pieGradient,
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      opacity: 0.16,
                      mixBlendMode: 'overlay',
                      backgroundImage:
                        'url("data:image/svg+xml,%3Csvg viewBox=%270 0 300 300%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%271.35%27 numOctaves=%273%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E")',
                      backgroundSize: '96px 96px',
                    }}
                  />
                </div>
                <div className="absolute inset-4 flex items-center justify-center rounded-full border border-gray-100 bg-white text-[11px] font-semibold text-gray-700">
                  {dashboardData.totalProjects}
                </div>
              </div>
              <div className="flex-1 space-y-3">
                {STATUS_ORDER.map((statusKey) => {
                  const count = dashboardData.statusCount[statusKey];
                  const percentage = dashboardData.totalProjects
                    ? Math.round((count / dashboardData.totalProjects) * 100)
                    : 0;

                  return (
                    <div
                      key={statusKey}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${STATUS_META[statusKey].dot}`}
                        />
                        <span className="text-xs font-medium text-gray-700">
                          {STATUS_META[statusKey].label}
                        </span>
                      </div>
                      <div className="grid w-[7ch] grid-cols-[2ch_4ch] items-center justify-end gap-x-1 text-xs tabular-nums">
                        <span className="text-right font-medium text-gray-600">
                          {count}
                        </span>
                        <span className="whitespace-nowrap text-right text-gray-400">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Projects */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              Recent Projects
            </h2>
            <button
              onClick={() => onNavigate && onNavigate('projects')}
              className="text-xs font-medium text-gray-500 hover:text-gray-900"
            >
              View all →
            </button>
          </div>

          {recentProjects.length > 0 ? (
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => onProjectSelect && onProjectSelect(project)}
                  className="w-full rounded-lg border border-gray-100 p-3 text-left transition hover:border-gray-300 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {project.name}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-gray-500">
                        {project.description || 'No description'}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${STATUS_META[project.statusKey].color} ${STATUS_META[project.statusKey].bg}`}>
                      {STATUS_META[project.statusKey].label}
                    </span>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500">
                    <span>
                      {project.completedTasks}/{project.totalTasks} tasks
                    </span>
                    <span>{formatDate(project.dueDate)}</span>
                  </div>
                  
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-gray-900"
                      style={{
                        width: `${
                          project.totalTasks
                            ? Math.round(
                                (project.completedTasks / project.totalTasks) * 100
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
              <BoardIcon className="h-10 w-10 text-gray-300" />
              <p className="mt-3 text-sm font-medium text-gray-700">
                No projects yet
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Create your first project to start tracking
              </p>
            </div>
          )}
        </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6 lg:flex-1">
          {/* Upcoming Deadlines */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Upcoming Deadlines
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">Next 21 days</p>
              </div>
            </div>

            {deadlineFeed.length > 0 ? (
              <div className="space-y-3">
                {deadlineFeed.map((item) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={item.onClick}
                    className="w-full rounded-lg border border-gray-100 p-3 text-left transition hover:border-gray-300 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {item.title}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-gray-500">
                          {item.subtitle}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${STATUS_META[item.statusKey].color} ${STATUS_META[item.statusKey].bg}`}
                      >
                        {item.type}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      <span>{item.dueLabel}</span>
                      <span>·</span>
                      <span className="font-medium">{getDaysLabel(item.dueDateObj)}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
                <ClockIcon className="h-10 w-10 text-gray-300" />
                <p className="mt-3 text-sm font-medium text-gray-700">
                  No near-term deadlines
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Everything is clear for the next three weeks
                </p>
              </div>
            )}
          </div>

          {/* Upcoming Tasks */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Upcoming Tasks</h2>
            <div className="flex items-center gap-0.5 overflow-hidden rounded border border-gray-200">
              <button
                onClick={() => setSelectedTimeRange('week')}
                className={`px-3 py-1.5 text-xs font-medium transition ${
                  selectedTimeRange === 'week'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                7 days
              </button>
              <button
                onClick={() => setSelectedTimeRange('month')}
                className={`px-3 py-1.5 text-xs font-medium transition ${
                  selectedTimeRange === 'month'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                30 days
              </button>
            </div>
          </div>

          {upcomingTasks.length > 0 ? (
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <button
                  key={task.uniqueKey}
                  onClick={() => {
                    const targetProject = dashboardData.mappedProjects.find(
                      (project) => project.id === task.projectId
                    );
                    if (targetProject && onProjectSelect) {
                      onProjectSelect(targetProject);
                    }
                  }}
                  className="w-full rounded-lg border border-gray-100 p-3 text-left transition hover:border-gray-300 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {task.title || 'Untitled task'}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-gray-500">
                        {task.projectName}
                      </p>
                    </div>
                    {task.priority && (
                      <span
                        className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                          PRIORITY_META[task.priority?.toLowerCase()] ||
                          'bg-gray-50 text-gray-600'
                        }`}
                      >
                        {task.priority}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    <span>{formatDate(task.dueDateObj)}</span>
                    <span>·</span>
                    <span className="font-medium">{getDaysLabel(task.dueDateObj)}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
              <ClockIcon className="h-10 w-10 text-gray-300" />
              <p className="mt-3 text-sm font-medium text-gray-700">
                All clear in this window
              </p>
              <p className="mt-1 text-xs text-gray-500">
                No active tasks due in the selected range
              </p>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
