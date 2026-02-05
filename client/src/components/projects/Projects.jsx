'use client';
import { useState, useEffect, useRef } from 'react';
import ProjectCard from './ProjectCard';
import AddProjectModal from './AddProjectModal';
import Calendar from './Calendar';
import { useAppContext } from '@/app/providers/Provider';

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
              <div className="view-toggle flex items-center surface-muted border border-gray-200 rounded-lg p-1 gap-1 h-10.5">
                <button
                  onClick={() => setProjectsView('board')}
                  className={`flex items-center gap-2 px-3 h-8 min-h-0 text-sm font-medium rounded-md transition-all duration-200 ${projectsView === 'board'
                      ? 'bg-white text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
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
                      ? 'bg-white text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
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
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent('createProject', { detail: 'default' })
                )
              }
              className="btn-create flex items-center gap-2 px-4 h-10.5 rounded-lg text-sm font-medium transition-colors">
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
              className="w-[230px] md:w-[300px] h-10.5 px-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black bg-white"
            />
            <div className="relative" ref={projectsDropdownRef}>
              <button
                onClick={() =>
                  setShowProjectsDropdown((current) => !current)
                }
                className={`flex items-center gap-2 px-4 h-10.5 text-sm font-medium transition-colors rounded-lg border border-gray-200 ${
                  showProjectsDropdown ||
                  effectiveStatusFilter !== 'all' ||
                  sortOption !== 'newest'
                    ? 'bg-gray-100 text-gray-900'
                    : 'bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}>
                <span>Sort</span>
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
                <div className="absolute top-full right-0 mt-2 w-72 origin-top-right rounded-2xl border border-gray-200 bg-white p-3 text-sm text-gray-900 shadow-lg z-50">
                  <div className="text-xs font-semibold text-gray-500 uppercase">Status</div>
                  <div className="mt-2 flex items-center gap-1 rounded-lg bg-gray-50 p-1.5">
                    {['on-track', 'at-risk', 'completed'].map((value) => (
                      <button
                        key={value}
                        onClick={() => {
                          setStatusFilter(value);
                          setShowProjectsDropdown(false);
                        }}
                        className={`flex-1 h-9 whitespace-nowrap rounded-md px-3 text-sm font-medium leading-none transition ${
                          effectiveStatusFilter === value
                            ? 'bg-white text-gray-900'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}>
                        {value === 'on-track'
                          ? 'On Track'
                          : value === 'at-risk'
                          ? 'At Risk'
                          : 'Completed'}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 text-xs font-semibold text-gray-500 uppercase">Order</div>
                  <div className="mt-2 flex items-center gap-1 rounded-lg bg-gray-50 p-1.5">
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
                        className={`flex-1 h-9 whitespace-nowrap rounded-md px-3 text-sm font-medium leading-none transition ${
                          sortOption === option.id
                            ? 'bg-white text-gray-900'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}>
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setStatusFilter('all');
                      setSortOption('newest');
                      setShowProjectsDropdown(false);
                    }}
                    className="mt-4 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                    Reset
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {projectsView === 'board' ? renderBoardView() : renderCalendarView()}
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
