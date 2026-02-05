import TaskCard from './TaskCard';

export default function KanbanColumn({
  title,
  tasks,
  status,
  onEditTask,
  onDuplicateTask,
  onDeleteTask,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onToggleSubtask,
}) {
  return (
    <div
      className="surface-panel kanban-drop flex flex-col gap-3 rounded-2xl p-4 transition-colors duration-200 h-full min-w-[300px] max-w-[300px] flex-shrink-0"
      onDragOver={(e) => onDragOver(e, status)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, status)}>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-col gap-3 flex-1 min-h-[200px]">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div
              key={task.id}
              draggable
              onDragStart={(e) => onDragStart(e, task)}
              onDragEnd={onDragEnd}
              className="cursor-grab active:cursor-grabbing">
              <TaskCard
                task={task}
                onEditTask={() => onEditTask(task)}
                onDuplicateTask={() => onDuplicateTask(task.id)}
                onDeleteTask={() => onDeleteTask(task.id)}
                onToggleSubtask={onToggleSubtask}
              />
            </div>
          ))
        ) : (
          <div className="flex h-full min-h-[100px] items-center justify-center rounded-xl border border-dashed border-gray-300 surface-muted text-sm text-gray-400">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}
