'use client';
import { useState, useEffect } from 'react';
import ProjectCard from './ProjectCard';
import ProjectKanban from './ProjectKanban';
import AddProjectModal from './AddProjectModal';

export default function Projects({
  isCollapsed,
  onProjectSelect,
  selectedProject,
  projects,
  setProjects,
}) {
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const handleProjectClick = (project) => {
    onProjectSelect(project);
  };

  const handleBackToProjects = () => {
    onProjectSelect(null);
  };

  const openCreateProjectModal = () => {
    setEditingProject(null);
    setIsProjectModalOpen(true);
  };

  const createProject = (projectData) => {
    const newProject = {
      id: Math.max(...projects.map((p) => p.id), 0) + 1,
      name: projectData.projectName,
      description: projectData.description || 'Describe your project here',
      dueDate: projectData.dueDate
        ? new Date(projectData.dueDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
      status: projectData.status || 'In Progress',
      tasks: [],
    };

    setProjects([...projects, newProject]);
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

  const editProject = (projectData) => {
    if (!editingProject) return;

    const updatedProject = {
      ...editingProject,
      name: projectData.projectName,
      description: projectData.description || editingProject.description,
      dueDate: projectData.dueDate
        ? new Date(projectData.dueDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : editingProject.dueDate,
      status: projectData.status || editingProject.status,
    };

    setProjects(
      projects.map((project) =>
        project.id === editingProject.id ? updatedProject : project
      )
    );
  };

  const handleOpenEditModal = (project) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };

  const handleCloseProjectModal = () => {
    setIsProjectModalOpen(false);
    setEditingProject(null);
  };

  const duplicateProject = (id) => {
    const projectToDuplicate = projects.find((project) => project.id === id);
    if (projectToDuplicate) {
      const duplicatedProject = {
        ...projectToDuplicate,
        id: Math.max(...projects.map((p) => p.id)) + 1,
        name: `${projectToDuplicate.name} (duplicate)`,
        tasks: projectToDuplicate.tasks.map((task) => ({
          ...task,
          id: Math.max(...projectToDuplicate.tasks.map((t) => t.id), 0) + 1,
        })),
      };
      setProjects([...projects, duplicatedProject]);
    }
  };

  const deleteProject = (id) => {
    setProjects(projects.filter((project) => project.id !== id));
  };

  const updateProjectTasks = (projectId, updatedTasks) => {
    setProjects(
      projects.map((project) =>
        project.id === projectId ? { ...project, tasks: updatedTasks } : project
      )
    );
  };

  if (selectedProject) {
    return (
      <ProjectKanban
        project={selectedProject}
        onBack={handleBackToProjects}
        isCollapsed={isCollapsed}
        tasks={selectedProject.tasks}
        onUpdateTasks={(updatedTasks) =>
          updateProjectTasks(selectedProject.id, updatedTasks)
        }
      />
    );
  }

  return (
    <>
      <main
        className={`flex-1 overflow-y-auto bg-white transition-all duration-300 ${
          isCollapsed ? 'ml-[88px]' : 'ml-[280px]'
        }`}>
        <div className="p-8">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
            {projects.map((project) => (
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
      </main>

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
