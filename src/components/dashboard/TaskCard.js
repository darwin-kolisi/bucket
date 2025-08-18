import { useState, useEffect, useRef } from 'react';

export default function TaskCard({
  task,
  onDeleteTask,
  onDuplicateTask,
  onEditTask,
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
    onEditTask(task);
    setIsMenuOpen(false);
  };

  const handleDuplicate = () => {
    onDuplicateTask(task.id);
    setIsMenuOpen(false);
  };

  const handleDelete = () => {
    onDeleteTask(task.id);
    setIsMenuOpen(false);
  };

  const progressPercentage =
    task.total > 0 ? Math.round((task.progress / task.total) * 100) : 0;

  return (
    <div className="task-card">
      <div className="card-header">
        <h4>{task.title}</h4>
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
      <p className="card-subtitle">{task.subtitle}</p>
      <div className="progress-container">
        <span className="progress-label">Progress</span>
        <span className="progress-percentage">{progressPercentage}%</span>
      </div>
      <div className="progress-bar-wrapper">
        {Array.from({ length: task.total }).map((_, index) => (
          <div
            key={index}
            className={`progress-square ${
              index < task.progress ? 'filled' : ''
            }`}
          />
        ))}
      </div>
      <div className="card-footer">
        <div className="date-badge">{task.date}</div>
      </div>
    </div>
  );
}
