import TaskCard from './TaskCard';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

function DraggableTask({
  task,
  onEditTask,
  onDuplicateTask,
  onDeleteTask,
  onToggleSubtask,
  onToggleStar,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useDraggable({
    id: task.id,
    data: { status: task.status },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-0' : ''
      }`}
      {...listeners}
      {...attributes}>
      <TaskCard
        task={task}
        onEditTask={onEditTask}
        onDuplicateTask={onDuplicateTask}
        onDeleteTask={onDeleteTask}
        onToggleSubtask={onToggleSubtask}
        onToggleStar={onToggleStar}
      />
    </div>
  );
}

export default function KanbanColumn({
  title,
  tasks,
  status,
  onEditTask,
  onDuplicateTask,
  onDeleteTask,
  onToggleSubtask,
  onToggleStar,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div
      ref={setNodeRef}
      className={`surface-panel kanban-drop flex flex-col gap-3 rounded-2xl p-4 transition-colors duration-200 h-full min-w-[300px] max-w-[300px] flex-shrink-0 ${
        isOver ? 'kanban-drop-active' : ''
      }`}>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-col gap-3 flex-1 min-h-[200px]">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <DraggableTask
              key={task.id}
              task={task}
              onEditTask={() => onEditTask(task)}
              onDuplicateTask={() => onDuplicateTask(task.id)}
              onDeleteTask={() => onDeleteTask(task.id)}
              onToggleSubtask={onToggleSubtask}
              onToggleStar={onToggleStar}
            />
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
