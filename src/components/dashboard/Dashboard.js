'use client';

import KanbanColumn from './KanbanColumn';
import AddTaskModal from './AddTaskModal';
import './Dashboard.css';
import { useState } from 'react';

const todoTasks = [
  {
    id: 1,
    title: 'Create landing page design',
    subtitle: 'Marketing website',
    date: '15 Aug 2024',
  },
  {
    id: 2,
    title: 'Update component library',
    subtitle: 'Design system',
    date: '18 Aug 2024',
  },
  {
    id: 3,
    title: 'Build responsive layout',
    subtitle: 'E-commerce project',
    date: '20 Aug 2024',
  },
];

const inProgressTasks = [];
const doneTasks = [];

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState(todoTasks);
  const [editingTask, setEditingTask] = useState(null);

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
    };
    setTasks([...tasks, newTask]);
  };

  const editTask = (taskData) => {
    if (!editingTask) return;

    const updatedTask = {
      id: editingTask.id,
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
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <div className="welcome-section">
            <p>Welcome</p>
            <h1>Black Sabbath</h1>
          </div>
          <div className="view-options">
            <button className="view-btn active">projects</button>
            <button className="view-btn">calendar</button>
          </div>
        </div>
        <div className="header-right">
          <button className="filter-btn">Filter</button>
          <button className="filter-btn">Sort</button>
          <button
            className="new-task-btn"
            onClick={() => {
              setEditingTask(null);
              setIsModalOpen(true);
            }}>
            New task
          </button>
        </div>
      </header>

      <main className="kanban-board">
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
      </main>

      {isModalOpen && (
        <AddTaskModal
          onClose={handleCloseModal}
          onCreateTask={addTasks}
          onEditTask={editTask}
          editingTask={editingTask}
          isEditing={!!editingTask}
        />
      )}
    </div>
  );
}
