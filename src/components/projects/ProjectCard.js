import { useState, useEffect, useRef } from 'react';

export default function ProjectCard({
  project,
  onEditProject,
  onDuplicateProject,
  onDeleteProject,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleEdit = () => {
    onEditProject(project);
    setIsMenuOpen(false);
  };

  const handleDuplicate = () => {
    onDuplicateProject(project.id);
    setIsMenuOpen(false);
  };

  const handleDelete = () => {
    onDeleteProject(project.id);
    setIsMenuOpen(false);
  };

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
        <div className="options-container" ref={menuRef}>
          <button
            className="options-btn"
            onClick={() => setIsMenuOpen(true)}
            aria-expanded={isMenuOpen}>
            ⋯
          </button>
          {isMenuOpen && (
            <div className="dropdown-menu">
              <button className="menu-item" onClick={handleEdit}>
                Edit
              </button>
              <button className="menu-item" onClick={handleDuplicate}>
                Duplicate
              </button>
              <button className="menu-item delete" onClick={handleDelete}>
                Delete
              </button>
            </div>
          )}
        </div>
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
