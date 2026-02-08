import { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useRouter } from 'next/navigation';
import AddTaskModal from '../tasks/AddTaskModal';
import KanbanColumn from '../tasks/KanbanColumn';
import TaskCard from '../tasks/TaskCard';
import { PlusIcon } from '@/components/icons/Icons';

export default function ProjectKanban({
  project,
  onBack,
  isCollapsed,
  tasks: initialTasks,
  onUpdateTasks,
}) {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [tasks, setTasks] = useState(initialTasks || []);
  const [editingTask, setEditingTask] = useState(null);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const router = useRouter();
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

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

  const activeTask = activeTaskId
    ? tasks.find((task) => task.id === activeTaskId)
    : null;

  const handleDragStart = (event) => {
    setActiveTaskId(event.active.id);
  };

  const handleDragCancel = () => {
    setActiveTaskId(null);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTaskId(null);

    if (!over) return;
    const targetStatus = typeof over.id === 'string' ? over.id : null;
    if (!targetStatus) return;

    const draggedTask = tasks.find((task) => task.id === active.id);
    if (!draggedTask || draggedTask.status === targetStatus) return;

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

    const nextTask = (() => {
      if (!draggedTask.subtasks || draggedTask.subtasks.length === 0) {
        return {
          ...draggedTask,
          status: targetStatus,
          progress: getProgressByStatus(targetStatus, draggedTask.total),
        };
      }

      let nextSubtasks = draggedTask.subtasks;
      if (targetStatus === 'done') {
        nextSubtasks = draggedTask.subtasks.map((subtask) => ({
          ...subtask,
          completed: true,
        }));
      }
      const allCompleted = nextSubtasks.every((subtask) => subtask.completed);
      const nextStatus = allCompleted ? 'done' : targetStatus;

      return {
        ...draggedTask,
        status: nextStatus,
        subtasks: nextSubtasks,
        progress: calculateProgress(nextSubtasks),
      };
    })();

    const updatedTasks = tasks.map((task) =>
      task.id === draggedTask.id ? nextTask : task
    );

    setTasks(updatedTasks);
    onUpdateTasks(updatedTasks);
    try {
      const payload = { status: nextTask.status };
      if (nextTask.subtasks && targetStatus === 'done') {
        payload.subtasks = nextTask.subtasks;
      }
      await fetch(`${apiBase}/api/tasks/${draggedTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
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
        const allCompleted = updatedSubtasks.every((subtask) => subtask.completed);
        const nextStatus = allCompleted
          ? 'done'
          : task.status === 'done'
            ? 'in-progress'
            : task.status;
        return {
          ...task,
          subtasks: updatedSubtasks,
          status: nextStatus,
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
        body: JSON.stringify({
          subtasks: changedTask.subtasks,
          status: changedTask.status,
        }),
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
    <div className="flex-1 overflow-hidden min-h-screen app-dots">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 md:px-6 pt-4">
        <button
          type="button"
          onClick={() => router.push('/projects')}
          className="px-4 h-9.5 rounded-lg border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-800 hover:bg-gray-100 transition-colors">
          Back
        </button>
        <button
          onClick={() => router.push(`/projects/${project.id}/tasks/new`)}
          className="btn-create flex items-center gap-2 px-3 h-9.5 rounded-lg text-sm font-medium transition-colors">
          <PlusIcon className="h-4 w-4" />
          <span className="hidden sm:inline">New Task</span>
          <span className="sm:hidden">Task</span>
        </button>
      </div>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}>
        <div className="block md:hidden p-4 overflow-x-auto kanban-scroll">
          <div className="flex gap-3 pb-4" style={{ minWidth: 'max-content' }}>
            <KanbanColumn
              title="To do"
              tasks={sortTasksByDate(todoTasks)}
              status="todo"
              onEditTask={handleOpenEditModal}
              onDuplicateTask={duplicateTask}
              onDeleteTask={deleteTask}
              onToggleSubtask={handleToggleSubtask}
            />
            <KanbanColumn
              title="In progress"
              tasks={sortTasksByDate(inProgressTasks)}
              status="in-progress"
              onEditTask={handleOpenEditModal}
              onDuplicateTask={duplicateTask}
              onDeleteTask={deleteTask}
              onToggleSubtask={handleToggleSubtask}
            />
            <KanbanColumn
              title="In Review"
              tasks={sortTasksByDate(inReviewTasks)}
              status="in-review"
              onEditTask={handleOpenEditModal}
              onDuplicateTask={duplicateTask}
              onDeleteTask={deleteTask}
              onToggleSubtask={handleToggleSubtask}
            />
            <KanbanColumn
              title="Done"
              tasks={sortTasksByDate(doneTasks)}
              status="done"
              onEditTask={handleOpenEditModal}
              onDuplicateTask={duplicateTask}
              onDeleteTask={deleteTask}
              onToggleSubtask={handleToggleSubtask}
            />
          </div>
        </div>

        <div className="hidden md:flex gap-4 p-6 overflow-x-auto min-h-full kanban-scroll">
          <KanbanColumn
            title="To do"
            tasks={sortTasksByDate(todoTasks)}
            status="todo"
            onEditTask={handleOpenEditModal}
            onDuplicateTask={duplicateTask}
            onDeleteTask={deleteTask}
            onToggleSubtask={handleToggleSubtask}
          />
          <KanbanColumn
            title="In progress"
            tasks={sortTasksByDate(inProgressTasks)}
            status="in-progress"
            onEditTask={handleOpenEditModal}
            onDuplicateTask={duplicateTask}
            onDeleteTask={deleteTask}
            onToggleSubtask={handleToggleSubtask}
          />
          <KanbanColumn
            title="In Review"
            tasks={sortTasksByDate(inReviewTasks)}
            status="in-review"
            onEditTask={handleOpenEditModal}
            onDuplicateTask={duplicateTask}
            onDeleteTask={deleteTask}
            onToggleSubtask={handleToggleSubtask}
          />
          <KanbanColumn
            title="Completed"
            tasks={sortTasksByDate(doneTasks)}
            status="done"
            onEditTask={handleOpenEditModal}
            onDuplicateTask={duplicateTask}
            onDeleteTask={deleteTask}
            onToggleSubtask={handleToggleSubtask}
          />
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="pointer-events-none w-[280px]">
              <TaskCard
                task={activeTask}
                onEditTask={() => {}}
                onDuplicateTask={() => {}}
                onDeleteTask={() => {}}
                onToggleSubtask={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

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
