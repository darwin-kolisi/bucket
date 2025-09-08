import { useState } from 'react';
import AddTaskModal from '../tasks/AddTaskModal';
import KanbanColumn from '../tasks/KanbanColumn';

export default function ProjectKanbanModal({ project, onClose }) {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);

  const sortTasksByDate = (tasks) => {
    return [...tasks].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB;
    });
  };

  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress');
  const doneTasks = tasks.filter((t) => t.status === 'done');

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
      status: 'todo',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex h-[90%] w-[95%] max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-400 px-8 py-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {project.name}
            </h2>
            <p className="mt-1 text-sm text-gray-600">{project.description}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-6 w-6">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex justify-end border-b border-gray-600 bg-white/50 px-8 py-4">
          <button
            onClick={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            className="rounded-lg border border-gray-400 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm transition-colors hover:bg-gray-100 hover:border-gray-400">
            New Task
          </button>
        </div>

        <div className="grid flex-1 grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto bg-gray-50 p-8">
          <KanbanColumn
            title="To do"
            tasks={sortTasksByDate(todoTasks)}
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
  );
}
