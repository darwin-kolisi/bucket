'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function Header({
  isCollapsed,
  currentPage,
  currentProject,
  onBack,
  onCreateProject,
  projects = [],
  onProjectSelect,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchChange,
  isMobile = false,
  onMenuClick,
}) {
  const [showSearch, setShowSearch] = useState(false);
  const [showProjectsDropdown, setShowProjectsDropdown] = useState(false);

  const projectsDropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const showProjectControls = currentPage === 'projects' && !currentProject;

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
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  const handleSearchClick = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      onSearchChange('');
    }
  };

  const handleProjectFilter = (filter) => {
    onStatusFilterChange(filter);
    setShowProjectsDropdown(false);
  };

  const filteredProjects = searchQuery.trim()
    ? projects
        .filter(
          (project) =>
            project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
        )
        .slice(0, 10)
    : [];

  const handleProjectSelect = (project) => {
    onSearchChange('');
    setShowSearch(false);
    if (onProjectSelect) {
      onProjectSelect(project);
    }
  };

  const handleSearchBlur = (e) => {
    if (!e.relatedTarget?.closest('.search-results')) {
      if (!searchQuery.trim()) {
        setShowSearch(false);
      }
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 border-b border-gray-200 bg-white transition-[margin-left] duration-300 ease-in-out ${
        isMobile ? 'ml-0' : isCollapsed ? 'ml-[70px]' : 'ml-[220px]'
      }`}>
      <div className={`w-full h-18.5 px-5 md:px-8 py-5`}>
        {currentProject ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors p-1 rounded-lg hover:bg-gray-100">
                <ArrowLeftIcon className="h-4 w-4" />
              </button>
              <h1 className="text-sm font-medium text-gray-700 truncate">
                {currentProject.name}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  window.dispatchEvent(new CustomEvent('openTaskModal'))
                }
                className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
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
                <span className="hidden sm:inline">New Task</span>
              </button>

              {isMobile && (
                <button
                  onClick={onMenuClick}
                  className="text-gray-700 hover:text-gray-900 transition-colors px-2 py-1 text-sm font-medium">
                  Menu
                </button>
              )}
            </div>
          </div>
        ) : showProjectControls ? (
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="flex items-center gap-2">
                {showSearch ? (
                  <div className="relative">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => onSearchChange(e.target.value)}
                      onBlur={handleSearchBlur}
                      placeholder="Search projects"
                      className="w-[150px] md:w-[200px] px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                    />

                    {searchQuery.trim() && (
                      <div className="absolute top-full right-0 mt-1 w-80 origin-top-right rounded-xl border border-gray-200 bg-white p-2 text-sm text-gray-900 shadow-lg z-50 search-results">
                        <div className="mb-2 px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Search Results
                        </div>

                        {filteredProjects.length > 0 ? (
                          <div className="max-h-60 overflow-y-auto">
                            {filteredProjects.map((project) => (
                              <button
                                key={project.id}
                                onClick={() => handleProjectSelect(project)}
                                className="group flex w-full items-start gap-3 rounded-lg px-3 py-2 hover:bg-gray-100 text-left">
                                <div className="flex-shrink-0 mt-1">
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      project.status === 'In Progress'
                                        ? 'bg-blue-500'
                                        : project.status === 'On Track'
                                        ? 'bg-green-500'
                                        : project.status === 'At Risk'
                                        ? 'bg-red-500'
                                        : 'bg-gray-400'
                                    }`}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 truncate">
                                    {project.name}
                                  </div>
                                  <div className="text-gray-500 text-xs truncate">
                                    {project.description}
                                  </div>
                                  <div className="text-gray-400 text-xs mt-1">
                                    Due: {project.dueDate} •{' '}
                                    {project.totalTasks || 0} tasks
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="px-3 py-4 text-center text-gray-500">
                            No projects found for {searchQuery}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={handleSearchClick}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                      />
                    </svg>
                  </button>
                )}
              </div>

              <div className="relative" ref={projectsDropdownRef}>
                <button
                  onClick={() => setShowProjectsDropdown(!showProjectsDropdown)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100">
                  <span className="hidden sm:inline">
                    {statusFilter === 'all'
                      ? 'All projects'
                      : statusFilter === 'in-progress'
                      ? 'In Progress'
                      : statusFilter === 'on-track'
                      ? 'On Track'
                      : statusFilter === 'at-risk'
                      ? 'At Risk'
                      : statusFilter === 'completed'
                      ? 'Completed'
                      : 'All projects'}
                  </span>
                  <span className="sm:hidden">Filter</span>
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
                  <div className="absolute top-full right-0 mt-1 w-48 origin-top-right rounded-xl border border-gray-200 bg-white p-1 text-sm text-gray-900 shadow-lg z-50">
                    <button
                      onClick={() => handleProjectFilter('all')}
                      className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100 text-left">
                      <svg
                        className="h-4 w-4 text-gray-400"
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
                      All projects
                    </button>
                    <div className="my-1 h-px bg-gray-200" />
                    <button
                      onClick={() => handleProjectFilter('in-progress')}
                      className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100 text-left">
                      <svg
                        className="h-4 w-4 text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
                        />
                      </svg>
                      In Progress
                    </button>
                    <button
                      onClick={() => handleProjectFilter('on-track')}
                      className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100 text-left">
                      <svg
                        className="h-4 w-4 text-green-500"
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
                      On Track
                    </button>
                    <button
                      onClick={() => handleProjectFilter('at-risk')}
                      className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100 text-left">
                      <svg
                        className="h-4 w-4 text-red-500"
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
                      At Risk
                    </button>
                    <button
                      onClick={() => handleProjectFilter('completed')}
                      className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100 text-left">
                      <svg
                        className="h-4 w-4 text-gray-400"
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
                      Completed
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent('createProject', { detail: 'default' })
                  )
                }
                className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                <span className="hidden sm:inline">Create Project</span>
                <span className="sm:hidden">Create</span>
              </button>

              {isMobile && (
                <button
                  onClick={onMenuClick}
                  className="text-gray-700 hover:text-gray-900 transition-colors px-2 py-1 text-sm font-medium">
                  Menu
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-gray-900 capitalize">
                {currentPage}
              </h1>
            </div>

            {isMobile && (
              <button
                onClick={onMenuClick}
                className="text-gray-700 hover:text-gray-900 transition-colors px-2 py-1 text-sm font-medium">
                Menu
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
