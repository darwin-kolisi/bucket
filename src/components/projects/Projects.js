import { useState } from 'react';
import ProjectCard from './ProjectCard';
import ProjectKanbanModal from './ProjectKanbanModal';
import './Projects.css';

const initialProjects = [
  {
    id: 1,
    name: 'bucket',
    description: 'project management app',
    dueDate: '15 Aug 2025',
    status: 'In Progress',
  },
  {
    id: 2,
    name: 'consumption-doc',
    description: 'media log',
    dueDate: '18 Aug 2025',
    status: 'On Track',
  },
  {
    id: 3,
    name: 'beep boop',
    description: 'my resume/cv website',
    dueDate: '20 Aug 2025',
    status: 'At Risk',
  },
  {
    id: 4,
    name: 'employment',
    description: 'get a job...',
    dueDate: '🥲',
    status: 'At Risk',
  },
  {
    id: 5,
    name: 'physics',
    description: 'want to get into circuits and physics',
    dueDate: '28 Aug 2025',
    status: 'At Risk',
  },
];

export default function Projects() {
  const [projects, setProjects] = useState(initialProjects);
  const [selectedProject, setSelectedProject] = useState(null);

  const handleProjectClick = (project) => {
    setSelectedProject(project);
  };

  const handleCloseKanban = () => {
    setSelectedProject(null);
  };

  const editProject = (project) => {
    console.log('Edit project:', project);
  };

  const duplicateProject = (id) => {
    const projectToDuplicate = projects.find((project) => project.id === id);
    if (projectToDuplicate) {
      const duplicatedProject = {
        ...projectToDuplicate,
        id:
          projects.length > 0 ? Math.max(...projects.map((p) => p.id)) + 1 : 1,
        name: `${projectToDuplicate.name} (duplicate)`,
      };
      setProjects([...projects, duplicatedProject]);
    }
  };

  const deleteProject = (id) => {
    setProjects(projects.filter((project) => project.id !== id));
  };

  return (
    <div className="page-scroll-container">
      <div className="projects-container">
        <div className="projects-grid">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEditProject={editProject}
              onDuplicateProject={duplicateProject}
              onDeleteProject={deleteProject}
              onProjectClick={handleProjectClick}
            />
          ))}
        </div>
        {selectedProject && (
          <ProjectKanbanModal
            project={selectedProject}
            onClose={handleCloseKanban}
          />
        )}
      </div>
    </div>
  );
}
