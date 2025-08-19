import ProjectCard from './ProjectCard';
import './Projects.css';

const projects = [
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
  return (
    <div className="projects-container">
      <div className="projects-grid">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
