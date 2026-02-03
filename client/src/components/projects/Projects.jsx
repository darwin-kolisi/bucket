'use client';
import { useState, useEffect } from 'react';
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
  const { projectsView, setProjectsView } = useAppContext();
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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
      setProjects((prev) => [data.project, ...prev]);
    } catch (error) {
      // noop for now
    }
  };

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
      setProjects((prev) =>
        prev.map((project) =>
          project.id === editingProject.id ? data.project : project
        )
      );
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
      setProjects((prev) => prev.filter((project) => project.id !== id));
    } catch (error) {
      // noop for now
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesStatus =
      statusFilter === 'all' ||
      project.status.toLowerCase().replace(' ', '-') === statusFilter;

    const matchesSearch =
      !searchQuery.trim() ||
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const renderCalendarView = () => {
    return (
      <div className="p-4 md:p-8 min-h-[calc(100vh-160px)] pb-20 bg-gray-50">
        <Calendar
          projects={filteredProjects}
          onProjectSelect={onProjectSelect}
        />
      </div>
    );
  };

  const renderBoardView = () => {
    return (
      <div className="p-4 md:p-8 min-h-[calc(100vh-160px)] pb-20">
        <div className="block md:hidden space-y-4">
          {filteredProjects.map((project) => (
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

        <div className="hidden md:grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
          {filteredProjects.map((project) => (
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
      <div className="flex-1 overflow-y-auto bg-gray-50 min-h-screen">
        <div className="border-b border-gray-200 bg-white px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setProjectsView('board')}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-normal rounded-md transition-all duration-200 ${
                  projectsView === 'board'
                    ? 'bg-white text-gray-900 shadow-sm'
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
                className={`flex items-center gap-2 px-3 py-2 text-xs font-normal rounded-md transition-all duration-200 ${
                  projectsView === 'calendar'
                    ? 'bg-white text-gray-900 shadow-sm'
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
