import KanbanColumn from './KanbanColumn';
import './Dashboard.css';

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
          <button className="new-task-btn">New task</button>
        </div>
      </header>

      <main className="kanban-board">
        <KanbanColumn title="To do" tasks={todoTasks} />
        <KanbanColumn title="In progress" tasks={inProgressTasks} />
        <KanbanColumn title="Done" tasks={doneTasks} />
      </main>
    </div>
  );
}
