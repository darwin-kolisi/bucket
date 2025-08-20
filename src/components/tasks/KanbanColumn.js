import TaskCard from './TaskCard';

export default function KanbanColumn({
  title,
  tasks,
  onEditTask,
  onDuplicateTask,
  onDeleteTask,
}) {
  return (
    <div className="kanban-column">
      <header className="column-header">
        <h2>{title}</h2>
      </header>
      <div className="column-tasks">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEditTask={onEditTask}
            onDuplicateTask={onDuplicateTask}
            onDeleteTask={onDeleteTask}
          />
        ))}
        {tasks.length === 0 && (
          <div className="empty-column-message">This column is empty.</div>
        )}
      </div>
    </div>
  );
}
