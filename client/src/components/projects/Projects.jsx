'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ProjectCard from './ProjectCard';
import AddProjectModal from './AddProjectModal';
import Calendar from './Calendar';
import ProjectActionsMenu from './ProjectActionsMenu';
import ProjectsSortMenu from './ProjectsSortMenu';
import { useAppContext } from '@/app/providers/Provider';
import {
  BoardIcon,
  CalendarIcon,
  ClockIcon,
  ListIcon,
  PlusIcon,
} from '@/components/icons/Icons';

export default function Projects({
  isCollapsed,
  onProjectSelect,
  selectedProject,
  statusFilter,
  searchQuery,
}) {
  const [visibleProjects, setVisibleProjects] = useState([]);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [showProjectsDropdown, setShowProjectsDropdown] = useState(false);
  const [sortOption, setSortOption] = useState('newest');
  const projectsDropdownRef = useRef(null);
  const {
    projectsView,
    setProjectsView,
    setStatusFilter,
    setSearchQuery,
    setProjects,
  } = useAppContext();
  const router = useRouter();
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const effectiveStatusFilter =
    statusFilter === 'in-progress' ? 'on-track' : statusFilter;

  const refreshProjects = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery?.trim()) {
        params.set('q', searchQuery.trim());
      }
      if (effectiveStatusFilter && effectiveStatusFilter !== 'all') {
        params.set('status', effectiveStatusFilter);
      }
      if (sortOption) {
        params.set('sort', sortOption);
      }
      const query = params.toString();
      const response = await fetch(
        `${apiBase}/api/projects${query ? `?${query}` : ''}`,
        {
          credentials: 'include',
        }
      );
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      setVisibleProjects(data.projects || []);
    } catch (error) {
      // noop for now
    }
  };

  const refreshProjectsCache = async () => {
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

  const handleEditProject = (project) => {
    router.push(`/projects/${project.id}/edit`);
  };

  const openProjectNotes = (projectId) => {
    router.push(`/notes?projectId=${projectId}`);
  };

  const openCreateProjectModal = () => {
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
      await refreshProjectsCache();
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

  const handleCloseProjectModal = () => {
    setIsProjectModalOpen(false);
  };

  const duplicateProject = async (id) => {
    const projectToDuplicate = visibleProjects.find((project) => project.id === id);
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
      await refreshProjectsCache();
      await refreshProjects();
    } catch (error) {
      // noop for now
    }
  };

  useEffect(() => {
    refreshProjects();
  }, [effectiveStatusFilter, searchQuery, sortOption]);

  const projectsToRender = visibleProjects;

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

  const renderCalendarView = () => {
    return (
      <div className="px-4 md:px-8 pt-2 pb-20 min-h-[calc(100vh-160px)]">
        <Calendar projects={projectsToRender} onProjectSelect={onProjectSelect} />
      </div>
    );
  };

  const renderListView = () => {
    if (projectsToRender.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-8">
          <ListIcon className="w-16 h-16 text-gray-300 mb-4" />
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
            {projectsToRender.map((project) => {
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
                    <CalendarIcon className="h-3.5 w-3.5" />
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
                    <ClockIcon className="h-3.5 w-3.5" />
                    {formatDateTime(project.updatedAt)}
                  </div>
                  <ProjectActionsMenu
                    className="justify-self-end"
                    onEdit={() => handleEditProject(project)}
                    onDuplicate={() => duplicateProject(project.id)}
                    onOpenNotes={() => openProjectNotes(project.id)}
                    onDelete={() => deleteProject(project.id)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile list */}
        <div className="sm:hidden rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden divide-y divide-gray-100">
          {projectsToRender.map((project) => {
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
                <ProjectActionsMenu
                  className="flex-shrink-0"
                  onEdit={() => handleEditProject(project)}
                  onDuplicate={() => duplicateProject(project.id)}
                  onOpenNotes={() => openProjectNotes(project.id)}
                  onDelete={() => deleteProject(project.id)}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderBoardView = () => {
    if (projectsToRender.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-8">
          <BoardIcon className="w-16 h-16 text-gray-300 mb-4" />
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
          {projectsToRender.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEditProject={handleEditProject}
              onDuplicateProject={duplicateProject}
              onOpenProjectNotes={openProjectNotes}
              onDeleteProject={deleteProject}
              onProjectClick={handleProjectClick}
            />
          ))}
        </div>

        <div className="hidden md:grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
          {projectsToRender.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEditProject={handleEditProject}
              onDuplicateProject={duplicateProject}
              onOpenProjectNotes={openProjectNotes}
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
                  <ListIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">List</span>
                </button>
                <button
                  onClick={() => setProjectsView('board')}
                  className={`flex items-center gap-2 px-3 h-8 min-h-0 text-sm font-medium rounded-md transition-all duration-200 ${projectsView === 'board'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                    }`}>
                  <BoardIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Board</span>
                </button>
                <button
                  onClick={() => setProjectsView('calendar')}
                  className={`flex items-center gap-2 px-3 h-8 min-h-0 text-sm font-medium rounded-md transition-all duration-200 ${projectsView === 'calendar'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                    }`}>
                  <CalendarIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Calendar</span>
                </button>
              </div>
            </div>
            <button
              onClick={() => router.push('/projects/new')}
              className="btn-create flex items-center gap-2 px-4 h-9.5 rounded-lg text-sm font-medium transition-colors">
              <PlusIcon className="h-4 w-4" />
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
              <ProjectsSortMenu
                isOpen={showProjectsDropdown}
                setIsOpen={setShowProjectsDropdown}
                effectiveStatusFilter={effectiveStatusFilter}
                sortOption={sortOption}
                onStatusChange={setStatusFilter}
                onSortChange={setSortOption}
                onReset={() => {
                  setStatusFilter('all');
                  setSortOption('newest');
                }}
              />
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
          onEditProject={() => {}}
          editingProject={null}
          isEditing={false}
        />
      )}
    </>
  );
}
