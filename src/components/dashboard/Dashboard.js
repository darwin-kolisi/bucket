'use client';

import './Dashboard.css';

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
          <button className="new-task-btn">New Project</button>
        </div>
      </header>
    </div>
  );
}
