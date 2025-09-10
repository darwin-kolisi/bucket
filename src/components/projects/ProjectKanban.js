import { useState } from 'react';
import AddTaskModal from '../tasks/AddTaskModal';
import KanbanColumn from '../tasks/KanbanColumn';

export default function ProjectKanban({ project, onBack, isCollapsed }) {
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
    <main
      className={`flex-1 overflow-hidden bg-gray-50 transition-all duration-300 ${
        isCollapsed ? 'ml-[88px]' : 'ml-[280px]'
      }`}>
      <div className="grid h-full grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto p-8">
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

      {isTaskModalOpen && (
        <AddTaskModal
          onClose={handleCloseTaskModal}
          onCreateTask={addTasks}
          onEditTask={editTask}
          editingTask={editingTask}
          isEditing={!!editingTask}
        />
      )}
    </main>
  );
}
