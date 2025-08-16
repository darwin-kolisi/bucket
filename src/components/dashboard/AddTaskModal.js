import { useState, useEffect } from 'react';
import './AddTaskModal.css';

export default function AddTaskModal({
  onClose,
  onCreateTask,
  onEditTask,
  editingTask,
  isEditing,
}) {
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (isEditing && editingTask) {
      setTaskName(editingTask.title);
      setDescription(
        editingTask.subtitle === 'No description' ? '' : editingTask.subtitle
      );

      if (editingTask.date) {
        const dateParts = editingTask.date.split(' ');
        const months = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];
        const monthIndex = months.indexOf(dateParts[1]);
        const year = dateParts[2];
        const day = dateParts[0];
        const formattedDate = `${year}-${String(monthIndex + 1).padStart(
          2,
          '0'
        )}-${day.padStart(2, '0')}`;
        setDueDate(formattedDate);
      }
    }
  }, [isEditing, editingTask]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (taskName.trim()) {
      const taskData = {
        taskName: taskName.trim(),
        description: description.trim(),
        dueDate: dueDate,
      };

      if (isEditing) {
        onEditTask(taskData);
      } else {
        onCreateTask(taskData);
      }
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <header className="modal-header">
          <h2>{isEditing ? 'Edit Task' : 'New Task'}</h2>
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
              placeholder="Enter task title"
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
              {isEditing ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
