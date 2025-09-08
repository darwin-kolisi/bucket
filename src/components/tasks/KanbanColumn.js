import TaskCard from './TaskCard';

export default function KanbanColumn({
  title,
  tasks,
  onEditTask,
  onDuplicateTask,
  onDeleteTask,
}) {
  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border border-gray-400 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEditTask={() => onEditTask(task)}
              onDuplicateTask={() => onDuplicateTask(task.id)}
              onDeleteTask={() => onDeleteTask(task.id)}
            />
          ))
        ) : (
          <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-gray-400 text-sm font-medium text-gray-400">
            No tasks yet
          </div>
        )}
      </div>
    </div>
  );
}
