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
  const [isMobile, setIsMobile] = useState(false);
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setTasks(initialTasks || []);
  }, [initialTasks]);

  const refreshTasks = async () => {
    try {
      const response = await fetch(`${apiBase}/api/projects/${project.id}/tasks`, {
        credentials: 'include',
      });
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      const nextTasks = data.tasks || [];
      setTasks(nextTasks);
      onUpdateTasks(nextTasks);
    } catch (error) {
      // noop for now
    }
  };

  const sortTasksByDate = (tasks) => {
    return [...tasks].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB;
    });
  };

  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress');
  const inReviewTasks = tasks.filter((t) => t.status === 'in-review');
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
    column.classList.add('kanban-drop-active');
  };

  const handleDragLeave = (e) => {
    const column = e.currentTarget;
    column.classList.remove('kanban-drop-active');
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();

    const column = e.currentTarget;
    column.classList.remove('kanban-drop-active');

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
              case 'in-review':
                return Math.round(total * 0.8);
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
    try {
      await fetch(`${apiBase}/api/tasks/${draggedTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: targetStatus }),
      });
      await refreshTasks();
    } catch (error) {
      // noop for now
    }
  };

  const calculateProgress = (subtasks) => {
    if (!subtasks || subtasks.length === 0) return 0;
    const completed = subtasks.filter((st) => st.completed).length;
    return Math.round((completed / subtasks.length) * 10);
  };

  const handleToggleSubtask = async (taskId, subtaskId) => {
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
    const changedTask = updatedTasks.find((task) => task.id === taskId);
    if (!changedTask) return;
    try {
      await fetch(`${apiBase}/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ subtasks: changedTask.subtasks }),
      });
      await refreshTasks();
    } catch (error) {
      // noop for now
    }
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

  const addTasks = async (taskData) => {
    try {
      const response = await fetch(`${apiBase}/api/projects/${project.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: taskData.taskName,
          description: taskData.description,
          dueDate: taskData.dueDate || null,
          priority: taskData.priority,
          subtasks: taskData.subtasks || [],
          status: 'todo',
        }),
      });
      if (!response.ok) {
        return;
      }
      await refreshTasks();
    } catch (error) {
      // noop for now
    }
  };

  const editTask = async (taskData) => {
    if (!editingTask) return;
    try {
      const response = await fetch(`${apiBase}/api/tasks/${editingTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: taskData.taskName,
          description: taskData.description,
          dueDate: taskData.dueDate || null,
          priority: taskData.priority,
          subtasks: taskData.subtasks || [],
        }),
      });
      if (!response.ok) {
        return;
      }
      await refreshTasks();
    } catch (error) {
      // noop for now
    }
  };

  const duplicateTask = async (id) => {
    const taskToDuplicate = tasks.find((task) => task.id === id);
    if (taskToDuplicate) {
      try {
        const response = await fetch(`${apiBase}/api/projects/${project.id}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            title: `${taskToDuplicate.title} (duplicate)`,
            description:
              taskToDuplicate.subtitle === 'No description'
                ? ''
                : taskToDuplicate.subtitle,
            dueDate: taskToDuplicate.dueDate || null,
            priority: taskToDuplicate.priority || 'Medium',
            subtasks: taskToDuplicate.subtasks || [],
            status: taskToDuplicate.status || 'todo',
          }),
        });
        if (!response.ok) {
          return;
        }
        await refreshTasks();
      } catch (error) {
        // noop for now
      }
    }
  };

  const deleteTask = async (id) => {
    try {
      const response = await fetch(`${apiBase}/api/tasks/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        return;
      }
      await refreshTasks();
    } catch (error) {
      // noop for now
    }
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
    <div className="flex-1 overflow-hidden bg-gray-50 min-h-screen">
      <div className="block md:hidden p-4 overflow-x-auto">
        <div className="flex gap-3 pb-4" style={{ minWidth: 'max-content' }}>
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
            title="In Review"
            tasks={sortTasksByDate(inReviewTasks)}
            status="in-review"
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
      </div>

      <div className="hidden md:flex gap-4 p-6 overflow-x-auto min-h-full">
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
          title="In Review"
          tasks={sortTasksByDate(inReviewTasks)}
          status="in-review"
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
          title="Completed"
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
    </div>
  );
}
