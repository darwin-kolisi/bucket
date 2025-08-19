export default function ProjectCard({ project }) {
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'in progress':
        return 'status-in-progress';
      case 'on track':
        return 'status-on-track';
      case 'at risk':
        return 'status-at-risk';
      case 'completed':
        return 'status-completed';
      default:
        return '';
    }
  };

  return (
    <div className="project-card">
      <div className="project-card-header">
        <h3>{project.name}</h3>
        <button className="options-btn">⋯</button>
      </div>
      <p className="project-description">{project.description}</p>
      <div className="project-card-footer">
        <span className="due-date">Due: {project.dueDate}</span>
        <span className={`status-badge ${getStatusClass(project.status)}`}>
          {project.status}
        </span>
      </div>
    </div>
  );
}
