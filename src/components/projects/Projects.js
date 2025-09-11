'use client';
import { useState } from 'react';
import ProjectCard from './ProjectCard';
import ProjectKanban from './ProjectKanban';

export default function Projects({ isCollapsed }) {
  const initialProjects = [
    {
      id: 1,
      name: 'bucket',
      description: 'project management app',
      dueDate: '15 Aug 2025',
      status: 'In Progress',
      tasks: [
        {
          id: 1,
          title: 'Create landing page design',
          subtitle: 'Marketing website',
          date: '15 Aug 2024',
          progress: 7,
          total: 10,
          status: 'todo',
        },
        {
          id: 2,
          title: 'Update component library',
          subtitle: 'Design system',
          date: '18 Aug 2024',
          progress: 4,
          total: 8,
          status: 'todo',
        },
      ],
    },
    {
      id: 2,
      name: 'consumption-doc',
      description: 'media log',
      dueDate: '18 Aug 2025',
      status: 'On Track',
      tasks: [
        {
          id: 1,
          title: 'Design media upload interface',
          subtitle: 'User experience',
          date: '16 Aug 2024',
          progress: 5,
          total: 8,
          status: 'todo',
        },
        {
          id: 2,
          title: 'Implement search functionality',
          subtitle: 'Backend integration',
          date: '19 Aug 2024',
          progress: 3,
          total: 6,
          status: 'todo',
        },
      ],
    },
    {
      id: 3,
      name: 'beep boop',
      description: 'my resume/cv website',
      dueDate: '20 Aug 2025',
      status: 'At Risk',
      tasks: [],
    },
    {
      id: 4,
      name: 'employment',
      description: 'get a job...',
      dueDate: '25 Aug 2025',
      status: 'At Risk',
      tasks: [],
    },
    {
      id: 5,
      name: 'physics',
      description: 'want to get into circuits and physics',
      dueDate: '28 Aug 2025',
      status: 'At Risk',
      tasks: [],
    },
  ];

  const [projects, setProjects] = useState(initialProjects);
  const [selectedProject, setSelectedProject] = useState(null);

  const handleProjectClick = (project) => {
    setSelectedProject(project);
  };

  const handleBackToProjects = () => {
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
        id: Math.max(...projects.map((p) => p.id)) + 1,
        name: `${projectToDuplicate.name} (duplicate)`,
        tasks: projectToDuplicate.tasks.map((task) => ({
          ...task,
          id: Math.max(...projectToDuplicate.tasks.map((t) => t.id)) + 1,
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

  // For each project, calculate progress based on tasks
  const projectsWithProgress = projects.map((project) => {
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(
      (task) => task.status === 'done'
    ).length;
    const progress =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      ...project,
      progress,
      totalTasks,
      completedTasks,
    };
  });

  return (
    <main
      className={`flex-1 overflow-y-auto bg-white transition-all duration-300 ${
        isCollapsed ? 'ml-[88px]' : 'ml-[280px]'
      }`}>
      <div className="p-8">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
          {projectsWithProgress.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              progress={project.progress}
              totalTasks={project.totalTasks}
              completedTasks={project.completedTasks}
              onEditProject={editProject}
              onDuplicateProject={duplicateProject}
              onDeleteProject={deleteProject}
              onProjectClick={handleProjectClick}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
