'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ProjectCard from './ProjectCard';
import AddProjectModal from './AddProjectModal';
import Calendar from './Calendar';
import { useAppContext } from '@/app/providers/Provider';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';

export default function Projects({
  isCollapsed,
  onProjectSelect,
  selectedProject,
  projects,
  setProjects,
  statusFilter,
  searchQuery,
}) {
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showProjectsDropdown, setShowProjectsDropdown] = useState(false);
  const [sortOption, setSortOption] = useState('newest');
  const projectsDropdownRef = useRef(null);
  const { projectsView, setProjectsView, setStatusFilter, setSearchQuery } =
    useAppContext();
  const router = useRouter();
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const effectiveStatusFilter =
    statusFilter === 'in-progress' ? 'on-track' : statusFilter;

  const refreshProjects = async () => {
    try {
      const response = await fetch(`${apiBase}/api/projects`, {
        credentials: 'include',
      });
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      // noop for now
    }
  };

  const handleProjectClick = (project) => {
    onProjectSelect(project);
  };

  const openCreateProjectModal = () => {
    setEditingProject(null);
    setIsProjectModalOpen(true);
  };

  const createProject = async (projectData) => {
    try {
      const response = await fetch(`${apiBase}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: projectData.projectName,
          description: projectData.description,
          dueDate: projectData.dueDate || null,
          startDate: projectData.startDate || null,
        }),
      });
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      if (!data?.project) {
        return;
      }
      await refreshProjects();
    } catch (error) {
      // noop for now
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        projectsDropdownRef.current &&
        !projectsDropdownRef.current.contains(event.target)
      ) {
        setShowProjectsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleCreateProject = (event) => {
      openCreateProjectModal();
    };

    window.addEventListener('createProject', handleCreateProject);

    return () => {
      window.removeEventListener('createProject', handleCreateProject);
    };
  }, []);

  const editProject = async (projectData) => {
    if (!editingProject) return;
    try {
      const response = await fetch(`${apiBase}/api/projects/${editingProject.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: projectData.projectName,
          description: projectData.description,
          dueDate: projectData.dueDate || null,
          startDate: projectData.startDate || null,
        }),
      });
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      if (!data?.project) {
        return;
      }
      await refreshProjects();
    } catch (error) {
      // noop for now
    }
  };

  const handleOpenEditModal = (project) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };

  const handleCloseProjectModal = () => {
    setIsProjectModalOpen(false);
    setEditingProject(null);
  };

  const duplicateProject = async (id) => {
    const projectToDuplicate = projects.find((project) => project.id === id);
    if (projectToDuplicate) {
      await createProject({
        projectName: `${projectToDuplicate.name} (duplicate)`,
        description: projectToDuplicate.description,
        dueDate: projectToDuplicate.dueDate,
        startDate: projectToDuplicate.startDate,
      });
    }
  };

  const deleteProject = async (id) => {
    try {
      const response = await fetch(`${apiBase}/api/projects/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        return;
      }
      await refreshProjects();
    } catch (error) {
      // noop for now
    }
  };

  const filteredProjects = projects.filter((project) => {
    const normalizedStatus = project.status.toLowerCase().replace(' ', '-');
    const matchesStatus =
      effectiveStatusFilter === 'all' ||
      (effectiveStatusFilter === 'on-track' &&
        (normalizedStatus === 'on-track' ||
          normalizedStatus === 'in-progress')) ||
      normalizedStatus === effectiveStatusFilter;

    const matchesSearch =
      !searchQuery.trim() ||
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    if (sortOption === 'oldest') {
      return dateA - dateB;
    }
    if (sortOption === 'due-soon') {
      const dueA = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      const dueB = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      return dueA - dueB;
    }
    return dateB - dateA;
  });

  const isSortActive =
    showProjectsDropdown ||
    effectiveStatusFilter !== 'all' ||
    sortOption !== 'newest';

  const formatStatus = (status) => {
    if (!status) return 'In Progress';
    return status
      .toString()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatDate = (value) => {
    if (!value) return 'No due date';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'No due date';
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const formatDateTime = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusDotClasses = (status) => {
    const normalized = status?.toLowerCase().replace(/_/g, ' ');
    switch (normalized) {
      case 'on track':
        return 'bg-green-500';
      case 'at risk':
        return 'bg-red-500';
      case 'completed':
        return 'bg-gray-400';
      case 'in progress':
        return 'bg-amber-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusPillClasses = (status) => {
    const normalized = status?.toLowerCase().replace(/_/g, ' ');
    switch (normalized) {
      case 'on track':
        return 'bg-green-100 text-green-700';
      case 'at risk':
        return 'bg-red-100 text-red-700';
      case 'completed':
        return 'bg-gray-100 text-gray-700';
      case 'in progress':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const renderCalendarView = () => {
    return (
      <div className="px-4 md:px-8 pt-2 pb-20 min-h-[calc(100vh-160px)]">
        <Calendar
          projects={filteredProjects}
          onProjectSelect={onProjectSelect}
        />
      </div>
    );
  };

  const renderListView = () => {
    if (filteredProjects.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-8">
          <svg
            className="w-16 h-16 text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8.25 6.75h11.25M8.25 12h11.25M8.25 17.25h11.25M4.5 6.75h.007v.008H4.5V6.75Zm0 5.25h.007v.008H4.5V12Zm0 5.25h.007v.008H4.5v-.008Z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
          <p className="text-sm text-gray-500 text-center max-w-sm">
            {searchQuery || effectiveStatusFilter !== 'all'
              ? 'No projects match your filters. Try adjusting your search or filter settings.'
              : 'Get started by creating your first project.'}
          </p>
        </div>
      );
    }

    return (
      <div className="px-4 md:px-8 pt-2 pb-20 min-h-[calc(100vh-160px)]">
        {/* Desktop table */}
        <div className="hidden sm:block rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="grid grid-cols-[minmax(0,1fr)_160px_180px_220px_32px] items-center gap-4 px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 bg-gray-50 border-b border-gray-200">
            <span className="translate-x-[30px]">Project</span>
            <span className="inline-flex items-center gap-2">
              <span aria-hidden="true" className="h-3.5 w-3.5 invisible" />
              <span className="translate-x-[20px]">Due</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-1.5 w-20 rounded-full bg-gray-200 opacity-0"
              />
              <span className="-translate-x-[70px]">Progress</span>
            </span>
            <span className="hidden md:inline-flex items-center gap-2">
              <span aria-hidden="true" className="h-3.5 w-3.5 invisible" />
              <span className="translate-x-[10px]">Updated</span>
            </span>
            <span aria-hidden="true" />
          </div>
          <div className="divide-y divide-gray-100">
            {sortedProjects.map((project) => {
              const completionPercentage =
                project.totalTasks > 0
                  ? Math.round(
                    (project.completedTasks / project.totalTasks) * 100
                  )
                  : 0;

              return (
                <div
                  key={project.id}
                  onClick={(e) => {
                    if (e.target.closest('.options-container')) return;
                    handleProjectClick(project);
                  }}
                  className="group grid grid-cols-[minmax(0,1fr)_160px_180px_220px_32px] items-center gap-3 px-4 py-4 transition-colors hover:bg-gray-50 cursor-pointer">
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full ${getStatusDotClasses(
                        project.status
                      )}`}
                    />
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {project.name}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500 line-clamp-1">
                        {project.description || 'No description'}
                      </p>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-2 whitespace-nowrap text-xs text-gray-500">
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5"
                      />
                    </svg>
                    {formatDate(project.dueDate)}
                  </div>
                  <div className="inline-flex items-center gap-2 whitespace-nowrap text-xs text-gray-500">
                    <span className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
                      <span
                        className="block h-full rounded-full bg-gray-900"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </span>
                    <span>
                      {completionPercentage}%
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-2 whitespace-nowrap text-xs text-gray-500">
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6h4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                    {formatDateTime(project.updatedAt)}
                  </div>
                  <div className="options-container justify-self-end">
                    <Menu>
                      <MenuButton
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6.75a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm0 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm0 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
                          />
                        </svg>
                      </MenuButton>
                      <MenuItems
                        transition
                        anchor="bottom end"
                        className="w-52 origin-top-right rounded-xl border border-gray-200 bg-white p-1 text-sm/6 text-gray-900 shadow-lg transition duration-100 ease-out focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0 z-50">
                        <MenuItem>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditModal(project);
                            }}
                            className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-50 text-left">
                            <svg
                              className="h-4 w-4 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                              />
                            </svg>
                            Edit
                          </button>
                        </MenuItem>
                        <MenuItem>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateProject(project.id);
                            }}
                            className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-50 text-left">
                            <svg
                              className="h-4 w-4 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
                              />
                            </svg>
                            Duplicate
                          </button>
                        </MenuItem>
                        <div className="my-1 h-px bg-gray-200" />
                        <MenuItem>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteProject(project.id);
                            }}
                            className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-red-600 hover:bg-red-50 text-left">
                            <svg
                              className="h-4 w-4 text-red-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                              />
                            </svg>
                            Delete
                          </button>
                        </MenuItem>
                      </MenuItems>
                    </Menu>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile list */}
        <div className="sm:hidden rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden divide-y divide-gray-100">
          {sortedProjects.map((project) => {
            const completionPercentage =
              project.totalTasks > 0
                ? Math.round(
                  (project.completedTasks / project.totalTasks) * 100
                )
                : 0;

            return (
              <div
                key={project.id}
                onClick={(e) => {
                  if (e.target.closest('.options-container')) return;
                  handleProjectClick(project);
                }}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                <span
                  className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${getStatusDotClasses(
                    project.status
                  )}`}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>{formatDate(project.dueDate)}</span>
                    <span>•</span>
                    <span>{completionPercentage}%</span>
                  </div>
                </div>
                <div className="options-container flex-shrink-0">
                  <Menu>
                    <MenuButton
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6.75a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm0 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm0 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
                        />
                      </svg>
                    </MenuButton>
                    <MenuItems
                      transition
                      anchor="bottom end"
                      className="w-52 origin-top-right rounded-xl border border-gray-200 bg-white p-1 text-sm/6 text-gray-900 shadow-lg transition duration-100 ease-out focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0 z-50">
                      <MenuItem>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditModal(project);
                          }}
                          className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-50 text-left">
                          <svg
                            className="h-4 w-4 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                            />
                          </svg>
                          Edit
                        </button>
                      </MenuItem>
                      <MenuItem>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateProject(project.id);
                          }}
                          className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-50 text-left">
                          <svg
                            className="h-4 w-4 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
                            />
                          </svg>
                          Duplicate
                        </button>
                      </MenuItem>
                      <div className="my-1 h-px bg-gray-200" />
                      <MenuItem>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteProject(project.id);
                          }}
                          className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-red-600 hover:bg-red-50 text-left">
                          <svg
                            className="h-4 w-4 text-red-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                            />
                          </svg>
                          Delete
                        </button>
                      </MenuItem>
                    </MenuItems>
                  </Menu>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderBoardView = () => {
    if (filteredProjects.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-8">
          <svg
            className="w-16 h-16 text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
          <p className="text-sm text-gray-500 text-center max-w-sm">
            {searchQuery || effectiveStatusFilter !== 'all'
              ? 'No projects match your filters. Try adjusting your search or filter settings.'
              : 'Get started by creating your first project.'}
          </p>
        </div>
      );
    }

    return (
      <div className="px-4 md:px-8 pt-2 pb-20 min-h-[calc(100vh-160px)]">
        <div className="block md:hidden space-y-4">
          {sortedProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEditProject={handleOpenEditModal}
              onDuplicateProject={duplicateProject}
              onDeleteProject={deleteProject}
              onProjectClick={handleProjectClick}
            />
          ))}
        </div>

        <div className="hidden md:grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
          {sortedProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEditProject={handleOpenEditModal}
              onDuplicateProject={duplicateProject}
              onDeleteProject={deleteProject}
              onProjectClick={handleProjectClick}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto min-h-screen">
        <div className="px-5 md:px-8 pt-6 pb-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="view-toggle flex items-center rounded-lg border border-gray-200 bg-gray-100 p-1 gap-1 h-10.5">
                <button
                  onClick={() => setProjectsView('list')}
                  className={`flex items-center gap-2 px-3 h-8 min-h-0 text-sm font-medium rounded-md transition-all duration-200 ${projectsView === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                    }`}>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 6.75h11.25M8.25 12h11.25M8.25 17.25h11.25M4.5 6.75h.007v.008H4.5V6.75Zm0 5.25h.007v.008H4.5V12Zm0 5.25h.007v.008H4.5v-.008Z"
                    />
                  </svg>
                  <span className="hidden sm:inline">List</span>
                </button>
                <button
                  onClick={() => setProjectsView('board')}
                  className={`flex items-center gap-2 px-3 h-8 min-h-0 text-sm font-medium rounded-md transition-all duration-200 ${projectsView === 'board'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                    }`}>
                  <svg
                    className="h-4 w-4"
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
                  <span className="hidden sm:inline">Board</span>
                </button>
                <button
                  onClick={() => setProjectsView('calendar')}
                  className={`flex items-center gap-2 px-3 h-8 min-h-0 text-sm font-medium rounded-md transition-all duration-200 ${projectsView === 'calendar'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                    }`}>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5"
                    />
                  </svg>
                  <span className="hidden sm:inline">Calendar</span>
                </button>
              </div>
            </div>
            <button
              onClick={() => router.push('/projects/new')}
              className="btn-create flex items-center gap-2 px-4 h-9.5 rounded-lg text-sm font-medium transition-colors">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Add Project
            </button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects"
              className="w-[230px] md:w-[300px] h-9.5 px-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black bg-white"
            />
            <div className="relative" ref={projectsDropdownRef}>
              <button
                onClick={() =>
                  setShowProjectsDropdown((current) => !current)
                }
                aria-expanded={isSortActive}
                className={`flex items-center gap-2 px-3 h-9.5 !min-h-[38px] text-xs font-semibold transition-colors rounded-lg border border-gray-200 sm:px-4 sm:h-9.5 sm:text-sm ${
                  isSortActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}>
                <span className="inline-flex items-center gap-2">
                  <span>Sort</span>
                  {isSortActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-900" />
                  )}
                </span>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </button>
              {showProjectsDropdown && (
                <div className="absolute top-full right-0 mt-2 w-72 origin-top-right rounded-2xl border border-gray-100 bg-white p-3 text-xs text-gray-900 shadow-xl z-50">
                  <div className="flex items-center justify-between px-1 pb-2">
                    <span className="text-[11px] font-semibold text-gray-700">
                      Sort & Filter
                    </span>
                    <button
                      onClick={() => {
                        setStatusFilter('all');
                        setSortOption('newest');
                        setShowProjectsDropdown(false);
                      }}
                      className="text-[11px] font-semibold text-gray-500 hover:text-gray-700">
                      Reset
                    </button>
                  </div>
                  <div className="mt-2">
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                      Status
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
                      {['on-track', 'at-risk', 'completed'].map((value) => (
                        <button
                          key={value}
                          onClick={() => {
                            setStatusFilter(value);
                            setShowProjectsDropdown(false);
                          }}
                          className={`h-8 whitespace-nowrap rounded-lg px-2 text-[11px] font-semibold transition ${
                            effectiveStatusFilter === value
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
                          }`}>
                          {value === 'on-track'
                            ? 'On Track'
                            : value === 'at-risk'
                              ? 'At Risk'
                              : 'Completed'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                      Order
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
                      {[
                        { id: 'newest', label: 'Newest' },
                        { id: 'oldest', label: 'Oldest' },
                        { id: 'due-soon', label: 'Due soon' },
                      ].map((option) => (
                        <button
                          key={option.id}
                          onClick={() => {
                            setSortOption(option.id);
                            setShowProjectsDropdown(false);
                          }}
                          className={`h-8 whitespace-nowrap rounded-lg px-2 text-[11px] font-semibold transition ${
                            sortOption === option.id
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
                          }`}>
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {projectsView === 'calendar'
          ? renderCalendarView()
          : projectsView === 'board'
            ? renderBoardView()
            : renderListView()}
      </div>

      {isProjectModalOpen && (
        <AddProjectModal
          onClose={handleCloseProjectModal}
          onCreateProject={createProject}
          onEditProject={editProject}
          editingProject={editingProject}
          isEditing={!!editingProject}
        />
      )}
    </>
  );
}
