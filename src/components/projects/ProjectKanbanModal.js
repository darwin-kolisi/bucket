import { useState } from 'react';
import AddTaskModal from '../tasks/AddTaskModal';
import KanbanColumn from '../tasks/KanbanColumn';

export default function ProjectKanbanModal({ project, onClose }) {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);

  const inProgressTasks = [];
  const doneTasks = [];

  const sortTasksByDate = (tasks) => {
    return [...tasks].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB;
    });
  };

  const addTasks = (taskData) => {
    const newTask = {
      id: tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1,
      title: taskData.taskName,
      subtitle: taskData.description || 'No description',
      date: taskData.dueDate
        ? new Date(taskData.dueDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
      progress: 0,
      total: 10,
    };
    setTasks([...tasks, newTask]);
  };

  const editTask = (taskData) => {
    if (!editingTask) return;

    const updatedTask = {
      ...editingTask,
      title: taskData.taskName,
      subtitle: taskData.description || 'No description',
      date: taskData.dueDate
        ? new Date(taskData.dueDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
    };
    setTasks(
      tasks.map((task) => (task.id === editingTask.id ? updatedTask : task))
    );
  };

  const duplicateTask = (id) => {
    const taskToDuplicate = tasks.find((task) => task.id === id);
    if (taskToDuplicate) {
      const duplicatedTask = {
        ...taskToDuplicate,
        id: tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1,
        title: `${taskToDuplicate.title} (duplicate)`,
      };
      setTasks([...tasks, duplicatedTask]);
    }
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="project-kanban-overlay">
      <div className="project-kanban-modal">
        <div className="project-kanban-header">
          <div>
            <h2>{project.name}</h2>
            <p className="project-modal-description">{project.description}</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="kanban-modal-actions">
          <button
            className="new-task-btn"
            onClick={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}>
            New task
          </button>
        </div>

        <div className="kanban-board">
          <KanbanColumn
            title="To do"
            tasks={sortTasksByDate(tasks)}
            onEditTask={handleOpenEditModal}
            onDuplicateTask={duplicateTask}
            onDeleteTask={deleteTask}
          />
          <KanbanColumn
            title="In progress"
            tasks={sortTasksByDate(inProgressTasks)}
            onEditTask={handleOpenEditModal}
            onDuplicateTask={duplicateTask}
            onDeleteTask={deleteTask}
          />
          <KanbanColumn
            title="Done"
            tasks={sortTasksByDate(doneTasks)}
            onEditTask={handleOpenEditModal}
            onDuplicateTask={duplicateTask}
            onDeleteTask={deleteTask}
          />
        </div>

        {isTaskModalOpen && (
          <AddTaskModal
            onClose={handleCloseTaskModal}
            onCreateTask={addTasks}
            onEditTask={editTask}
            editingTask={editingTask}
            isEditing={!!editingTask}
          />
        )}
      </div>
    </div>
  );
}
