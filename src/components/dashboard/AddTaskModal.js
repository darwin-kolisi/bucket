import { useState } from 'react';
import './AddTaskModal.css';

export default function AddTaskModal({ onClose, onCreateTask }) {
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (taskName.trim()) {
      onCreateTask({
        taskName: taskName.trim(),
        description: description.trim(),
        dueDate: dueDate,
      });
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <header className="modal-header">
          <h2>New Task</h2>
          <button className="close-btn" type="button" onClick={onClose}>
            ×
          </button>
        </header>
        <hr className="modal-separator" />
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="task-name">Task Name</label>
            <input
              id="task-name"
              type="text"
              placeholder="e.g., Enter task title"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="task-due-date">Due Date</label>
            <input
              id="task-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="task-description">Description</label>
            <textarea
              id="task-description"
              placeholder="Enter task description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="modal-actions">
            <button className="cancel-btn" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="add-btn" type="submit">
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
