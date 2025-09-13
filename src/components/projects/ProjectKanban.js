import { useState, useEffect } from 'react';
import AddTaskModal from '../tasks/AddTaskModal';
import KanbanColumn from '../tasks/KanbanColumn';

export default function ProjectKanban({
  project,
  onBack,
  isCollapsed,
  tasks: initialTasks,
  onUpdateTasks,
}) {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [tasks, setTasks] = useState(initialTasks || []);
  const [draggedTask, setDraggedTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  useState(() => {
    setTasks(initialTasks || []);
  }, [initialTasks]);

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

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.setData('text/plain', task.id.toString());
    e.dataTransfer.effectAllowed = 'move';

    setTimeout(() => {
      e.target.classList.add('opacity-50');
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('opacity-50');
    setDraggedTask(null);
  };

  const handleDragOver = (e, status) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const column = e.currentTarget;
    column.classList.add('bg-blue-50', 'border-blue-200');
  };

  const handleDragLeave = (e) => {
    const column = e.currentTarget;
    column.classList.remove('bg-blue-50', 'border-blue-200');
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();

    const column = e.currentTarget;
    column.classList.remove('bg-blue-50', 'border-blue-200');

    if (!draggedTask) return;

    const getProgressByStatus = (status, total) => {
      switch (status) {
        case 'todo':
          return 0;
        case 'in-progress':
          return Math.round(total * 0.5);
        case 'done':
          return total;
        default:
          return 0;
      }
    };

    const updatedTasks = tasks.map((task) => {
      if (task.id === draggedTask.id) {
        if (!task.subtasks || task.subtasks.length === 0) {
          const getProgressByStatus = (status, total) => {
            switch (status) {
              case 'todo':
                return 0;
              case 'in-progress':
                return Math.round(total * 0.5);
              case 'done':
                return total;
              default:
                return 0;
            }
          };
          return {
            ...task,
            status: targetStatus,
            progress: getProgressByStatus(targetStatus, task.total),
          };
        } else {
          return { ...task, status: targetStatus };
        }
      }
      return task;
    });

    setTasks(updatedTasks);
    onUpdateTasks(updatedTasks);
    setDraggedTask(null);
  };

  const calculateProgress = (subtasks) => {
    if (!subtasks || subtasks.length === 0) return 0;
    const completed = subtasks.filter((st) => st.completed).length;
    return Math.round((completed / subtasks.length) * 10);
  };

  const handleToggleSubtask = (taskId, subtaskId) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        const updatedSubtasks = task.subtasks.map((subtask) =>
          subtask.id === subtaskId
            ? { ...subtask, completed: !subtask.completed }
            : subtask
        );
        return {
          ...task,
          subtasks: updatedSubtasks,
          progress: calculateProgress(updatedSubtasks),
        };
      }
      return task;
    });

    setTasks(updatedTasks);
    onUpdateTasks(updatedTasks);
  };

  useEffect(() => {
    const handleOpenModal = () => {
      setEditingTask(null);
      setIsTaskModalOpen(true);
    };

    window.addEventListener('openTaskModal', handleOpenModal);

    return () => {
      window.removeEventListener('openTaskModal', handleOpenModal);
    };
  }, []);

  const addTasks = (taskData) => {
    const newTask = {
      id: tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1,
      title: taskData.taskName,
      subtitle: taskData.description || 'No description',
      subtasks: taskData.subtasks || [],
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

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    onUpdateTasks(updatedTasks);
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

    const updatedTasks = tasks.map((task) =>
      task.id === editingTask.id ? updatedTask : task
    );
    setTasks(updatedTasks);
    onUpdateTasks(updatedTasks);
  };

  const duplicateTask = (id) => {
    const taskToDuplicate = tasks.find((task) => task.id === id);
    if (taskToDuplicate) {
      const duplicatedTask = {
        ...taskToDuplicate,
        id: tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1,
        title: `${taskToDuplicate.title} (duplicate)`,
      };

      const updatedTasks = [...tasks, duplicatedTask];
      setTasks(updatedTasks);
      onUpdateTasks(updatedTasks);
    }
  };

  const deleteTask = (id) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
    onUpdateTasks(updatedTasks);
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
      className={`flex-1 bg-gray-50 transition-all duration-300 ${
        isCollapsed ? 'ml-[88px]' : 'ml-[280px]'
      }`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 h-[calc(50vh-2rem)]">
        <KanbanColumn
          title="To do"
          tasks={sortTasksByDate(todoTasks)}
          status="todo"
          onEditTask={handleOpenEditModal}
          onDuplicateTask={duplicateTask}
          onDeleteTask={deleteTask}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onToggleSubtask={handleToggleSubtask}
        />
        <KanbanColumn
          title="In progress"
          tasks={sortTasksByDate(inProgressTasks)}
          status="in-progress"
          onEditTask={handleOpenEditModal}
          onDuplicateTask={duplicateTask}
          onDeleteTask={deleteTask}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onToggleSubtask={handleToggleSubtask}
        />
        <KanbanColumn
          title="Done"
          tasks={sortTasksByDate(doneTasks)}
          status="done"
          onEditTask={handleOpenEditModal}
          onDuplicateTask={duplicateTask}
          onDeleteTask={deleteTask}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onToggleSubtask={handleToggleSubtask}
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
