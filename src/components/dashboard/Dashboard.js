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
          <button className="new-task-btn" onClick={() => setIsModalOpen(true)}>
            New task
          </button>
        </div>
      </header>

      <main className="kanban-board">
        <KanbanColumn title="To do" tasks={tasks} />
        <KanbanColumn title="In progress" tasks={inProgressTasks} />
        <KanbanColumn title="Done" tasks={doneTasks} />
      </main>

      {isModalOpen && (
        <AddTaskModal
          onClose={() => setIsModalOpen(false)}
          onCreateTask={addTasks}
        />
      )}
    </div>
  );
}
