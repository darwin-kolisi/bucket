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
}) {
  return (
    <div
      className="flex flex-col gap-4 rounded-xl border border-gray-300 bg-white p-4 shadow-sm transition-colors duration-200 h-full"
      onDragOver={(e) => onDragOver(e, status)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, status)}>
      <div className="flex items-center justify-between px-2">
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto flex-grow">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div
              key={task.id}
              draggable
              onDragStart={(e) => onDragStart(e, task)}
              onDragEnd={onDragEnd}
              className="cursor-grab active:cursor-grabbing transition-transform duration-150 hover:scale-[1.02]">
              <TaskCard
                task={task}
                onEditTask={() => onEditTask(task)}
                onDuplicateTask={() => onDuplicateTask(task.id)}
                onDeleteTask={() => onDeleteTask(task.id)}
              />
            </div>
          ))
        ) : (
          <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-sm font-medium text-gray-400">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}
