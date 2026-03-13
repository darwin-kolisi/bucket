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
    dot: 'bg-orange-500',
    pie: '#ea580c',
  },
  on_track: {
    label: 'On Track',
    color: 'text-green-700',
    bg: 'bg-green-50',
    dot: 'bg-green-500',
    pie: '#16a34a',
  },
  at_risk: {
    label: 'At Risk',
    color: 'text-red-700',
    bg: 'bg-red-50',
    dot: 'bg-red-500',
    pie: '#dc2626',
  },
  completed: {
    label: 'Completed',
    color: 'text-gray-600',
    bg: 'bg-gray-50',
    dot: 'bg-gray-400',
    pie: '#9ca3af',
  },
};

const PRIORITY_META = {
  high: 'text-red-600 bg-red-50',
  medium: 'text-orange-600 bg-orange-50',
  low: 'text-gray-500 bg-gray-100',
};

const RECENT_PROJECTS_LIMIT = 5;
const UPCOMING_TASKS_LIMIT = 6;
const DEADLINE_FEED_LIMIT = 5;

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
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return 'Due today';
  if (diff === 1) return 'Tomorrow';
  return `${diff} days`;
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

  const recentProjectsAll = useMemo(
    () =>
      [...dashboardData.mappedProjects].sort(
        (a, b) =>
          (parseDate(b.updatedAt)?.getTime() || 0) -
          (parseDate(a.updatedAt)?.getTime() || 0)
      ),
    [dashboardData.mappedProjects]
  );
  const recentProjects = useMemo(
    () => recentProjectsAll.slice(0, RECENT_PROJECTS_LIMIT),
    [recentProjectsAll]
  );
  const hasMoreRecentProjects =
    recentProjectsAll.length > RECENT_PROJECTS_LIMIT;

  const upcomingTasksAll = useMemo(() => {
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
      .sort((a, b) => a.dueDateObj.getTime() - b.dueDateObj.getTime());
  }, [dashboardData.allTasks, selectedTimeRange]);
  const upcomingTasks = useMemo(
    () => upcomingTasksAll.slice(0, UPCOMING_TASKS_LIMIT),
    [upcomingTasksAll]
  );
  const hasMoreUpcomingTasks =
    upcomingTasksAll.length > UPCOMING_TASKS_LIMIT;

  const deadlineFeedAll = useMemo(() => {
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

    return [...projectEntries, ...taskEntries].sort(
      (a, b) => a.dueDateObj.getTime() - b.dueDateObj.getTime()
    );
  }, [dashboardData, onProjectSelect]);
  const deadlineFeed = useMemo(
    () => deadlineFeedAll.slice(0, DEADLINE_FEED_LIMIT),
    [deadlineFeedAll]
  );
  const hasMoreDeadlines = deadlineFeedAll.length > DEADLINE_FEED_LIMIT;

  return (
    <div className="page-shell mx-auto max-w-[1400px] p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Overview</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          {new Intl.DateTimeFormat('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }).format(new Date())}
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="space-y-6 lg:flex-1">
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-900">Recent Projects</h2>
              {hasMoreRecentProjects && (
                <button
                  onClick={() => onNavigate && onNavigate('projects')}
                  className="text-xs font-medium text-gray-400 transition hover:text-gray-900"
                >
                  View all →
                </button>
              )}
            </div>

            {recentProjects.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-transparent">
                {recentProjects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => onProjectSelect && onProjectSelect(project)}
                    className="group w-full px-5 py-4 text-left transition hover:bg-gray-50"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${STATUS_META[project.statusKey].dot}`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {project.name}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-gray-400">
                          {project.description || 'No description'}
                        </p>
                        <div className="mt-2.5 flex items-center gap-3">
                          <div className="h-1 flex-1 overflow-hidden rounded-full progress-track">
                            <div
                              className="h-full rounded-full progress-fill"
                              style={{
                                width: `${project.totalTasks ? Math.round((project.completedTasks / project.totalTasks) * 100) : 0}%`,
                              }}
                            />
                          </div>
                          <span className="shrink-0 text-[11px] tabular-nums text-gray-400">
                            {project.completedTasks}/{project.totalTasks}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wide ${STATUS_META[project.statusKey].color}`}
                        >
                          {STATUS_META[project.statusKey].label}
                        </span>
                        <p className="mt-0.5 text-[11px] text-gray-400">
                          {formatDate(project.dueDate)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex min-h-[200px] flex-col items-center justify-center p-6 text-center">
                <BoardIcon className="mb-3 h-8 w-8 text-gray-300" />
                <p className="text-sm font-medium text-gray-700">No projects yet</p>
                <p className="mt-1 text-xs text-gray-400">Create your first project to start tracking</p>
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-900">Project Health</h2>
              <span className="text-xs tabular-nums text-gray-400">
                {dashboardData.totalProjects} total
              </span>
            </div>

            <div className="p-5">
              <div className="flex h-1.5 overflow-hidden rounded-full progress-track">
                {STATUS_ORDER.map((statusKey) => {
                  const count = dashboardData.statusCount[statusKey];
                  const pct = dashboardData.totalProjects
                    ? (count / dashboardData.totalProjects) * 100
                    : 0;
                  return pct > 0 ? (
                    <div
                      key={statusKey}
                      style={{ width: `${pct}%`, backgroundColor: STATUS_META[statusKey].pie }}
                    />
                  ) : null;
                })}
              </div>

              <div className="mt-4 space-y-2.5">
                {STATUS_ORDER.map((statusKey) => {
                  const count = dashboardData.statusCount[statusKey];
                  const pct = dashboardData.totalProjects
                    ? Math.round((count / dashboardData.totalProjects) * 100)
                    : 0;
                  return (
                    <div key={statusKey} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${STATUS_META[statusKey].dot}`} />
                        <span className="text-xs text-gray-600">{STATUS_META[statusKey].label}</span>
                      </div>
                      <span className="text-xs tabular-nums text-gray-400">
                        {count} · {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:flex-1">
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Upcoming Deadlines</h2>
                <p className="mt-0.5 text-[11px] text-gray-400">Next 21 days</p>
              </div>
              {hasMoreDeadlines && (
                <button
                  onClick={() => onNavigate && onNavigate('projects')}
                  className="text-xs font-medium text-gray-400 transition hover:text-gray-900"
                >
                  View all →
                </button>
              )}
            </div>

            {deadlineFeed.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {deadlineFeed.map((item) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const diff = Math.ceil(
                    (item.dueDateObj.getTime() - today.getTime()) / 86400000
                  );
                  const isOverdue = diff < 0;
                  const isUrgent = diff >= 0 && diff <= 1;
                  return (
                    <button
                      key={`${item.type}-${item.id}`}
                      onClick={item.onClick}
                      className={`group w-full border-l-2 px-5 py-4 text-left transition hover:bg-gray-50 ${
                        isOverdue
                          ? 'border-l-red-400'
                          : isUrgent
                          ? 'border-l-orange-400'
                          : 'border-l-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">{item.title}</p>
                          <p className="mt-0.5 truncate text-xs text-gray-400">{item.subtitle}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p
                            className={`text-[11px] font-semibold ${
                              isOverdue
                                ? 'text-red-600'
                                : isUrgent
                                ? 'text-orange-500'
                                : 'text-gray-500'
                            }`}
                          >
                            {getDaysLabel(item.dueDateObj)}
                          </p>
                          <p className="mt-0.5 text-[11px] text-gray-400">{item.dueLabel}</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${STATUS_META[item.statusKey].color} ${STATUS_META[item.statusKey].bg}`}
                        >
                          {item.type}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex min-h-[160px] flex-col items-center justify-center p-6 text-center">
                <CalendarIcon className="mb-3 h-8 w-8 text-gray-300" />
                <p className="text-sm font-medium text-gray-700">No near-term deadlines</p>
                <p className="mt-1 text-xs text-gray-400">Clear for the next three weeks</p>
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-900">Upcoming Tasks</h2>
              <div className="flex items-center gap-2">
                {hasMoreUpcomingTasks && (
                  <button
                    onClick={() => onNavigate && onNavigate('projects')}
                    className="text-xs font-medium text-gray-400 transition hover:text-gray-900"
                  >
                    View all →
                  </button>
                )}
                <div className="flex items-center gap-px overflow-hidden rounded border border-gray-200">
                  <button
                    onClick={() => setSelectedTimeRange('week')}
                    className={`px-3 py-1.5 text-xs font-medium transition ${
                      selectedTimeRange === 'week'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    7d
                  </button>
                  <button
                    onClick={() => setSelectedTimeRange('month')}
                    className={`px-3 py-1.5 text-xs font-medium transition ${
                      selectedTimeRange === 'month'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    30d
                  </button>
                </div>
              </div>
            </div>

            {upcomingTasks.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {upcomingTasks.map((task) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const diff = Math.ceil(
                    (task.dueDateObj.getTime() - today.getTime()) / 86400000
                  );
                  const isUrgent = diff <= 1;
                  return (
                    <button
                      key={task.uniqueKey}
                      onClick={() => {
                        const targetProject = dashboardData.mappedProjects.find(
                          (p) => p.id === task.projectId
                        );
                        if (targetProject && onProjectSelect) onProjectSelect(targetProject);
                      }}
                      className={`group w-full border-l-2 px-5 py-4 text-left transition hover:bg-gray-50 ${
                        isUrgent ? 'border-l-orange-400' : 'border-l-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {task.title || 'Untitled task'}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-gray-400">{task.projectName}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p
                            className={`text-[11px] font-semibold ${
                              isUrgent ? 'text-orange-500' : 'text-gray-500'
                            }`}
                          >
                            {getDaysLabel(task.dueDateObj)}
                          </p>
                          <p className="mt-0.5 text-[11px] text-gray-400">
                            {formatDate(task.dueDateObj)}
                          </p>
                        </div>
                      </div>
                      {task.priority && (
                        <div className="mt-2">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                              PRIORITY_META[task.priority?.toLowerCase()] ||
                              'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex min-h-[160px] flex-col items-center justify-center p-6 text-center">
                <ClockIcon className="mb-3 h-8 w-8 text-gray-300" />
                <p className="text-sm font-medium text-gray-700">All clear</p>
                <p className="mt-1 text-xs text-gray-400">No tasks due in this window</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
