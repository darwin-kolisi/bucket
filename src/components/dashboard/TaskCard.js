export default function TaskCard({ task }) {
  return (
    <div className="task-card">
      <div className="card-header">
        <h4>{task.title}</h4>
        <button className="options-btn">⋯</button>
      </div>
      <p className="card-subtitle">{task.subtitle}</p>
      <div className="card-footer">
        <div className="date-badge">{task.date}</div>
      </div>
    </div>
  );
}
