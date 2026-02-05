import { useState, useRef } from 'react';
import { useClickOutside } from '@react-hooks-hub/use-click-outside';

export default function TaskCard({
  task,
  onDeleteTask,
  onDuplicateTask,
  onEditTask,
  onToggleSubtask,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useClickOutside([menuRef], () => setIsMenuOpen(false));

  const handleEdit = () => {
    onEditTask(task);
    setIsMenuOpen(false);
  };

  const handleDuplicate = () => {
    onDuplicateTask(task.id);
    setIsMenuOpen(false);
  };

  const handleDelete = () => {
    onDeleteTask(task.id);
    setIsMenuOpen(false);
  };

  const progressPercent = task.total
    ? Math.round((task.progress / task.total) * 100)
    : 0;

  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return (
          <svg
            className="h-3.5 w-3.5 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
            />
          </svg>
        );
      case 'medium':
        return (
          <svg
            className="h-3.5 w-3.5 text-yellow-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625Z"
            />
          </svg>
        );
      case 'low':
        return (
          <svg
            className="h-3.5 w-3.5 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="h-3.5 w-3.5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
          </svg>
        );
    }
  };

  return (
    <div className="surface-card rounded-2xl p-4 transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-gray-900">{task.title}</h4>
          {task.subtitle && task.subtitle !== 'No description' && (
            <p className="mt-1 text-xs text-gray-500 line-clamp-2">
              {task.subtitle}
            </p>
          )}
        </div>
        <div className="relative" ref={menuRef}>
          <button
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 text-lg cursor-pointer p-1 rounded-md bg-transparent border-none transition-colors flex-shrink-0"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}>
            ⋯
          </button>
          {isMenuOpen && (
            <div className="absolute top-full right-0 mt-1 w-48 origin-top-right rounded-xl border border-gray-200 bg-white p-1 text-sm text-gray-900 shadow-lg z-50">
              <button
                onClick={handleEdit}
                className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-50 text-left">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                  />
                </svg>
                Edit
              </button>
              <button
                onClick={handleDuplicate}
                className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-50 text-left">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
                  />
                </svg>
                Duplicate
              </button>
              <div className="my-1 h-px bg-gray-200" />
              <button
                onClick={handleDelete}
                className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-red-600 hover:bg-red-50 text-left">
                <svg
                  className="h-4 w-4 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {task.subtasks && task.subtasks.length > 0 && (
        <div className="mt-3 rounded-xl border border-gray-200 surface-muted p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-gray-600">Subtasks</span>
            <span className="text-[11px] text-gray-400">
              {task.subtasks.filter((st) => st.completed).length}/
              {task.subtasks.length}
            </span>
          </div>
          <div className="space-y-1.5">
            {task.subtasks.map((subtask) => (
              <label
                key={subtask.id}
                className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={subtask.completed}
                  onChange={() => onToggleSubtask(task.id, subtask.id)}
                  className="rounded border-gray-300 text-gray-900 focus:ring-gray-900 focus:ring-offset-0 h-3.5 w-3.5"
                />
                <span
                  className={`text-xs ${subtask.completed
                    ? 'line-through text-gray-400'
                    : 'text-gray-700'
                    }`}>
                  {subtask.title}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Progress</span>
          <span className="font-semibold text-gray-700">{progressPercent}%</span>
        </div>
        <div className="mt-2 h-1.5 w-full rounded-full progress-track">
          <div
            className="h-full rounded-full progress-fill transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <div className="font-medium">{task.date}</div>
        <div
          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${task.priority?.toLowerCase() === 'high'
            ? 'bg-red-100 text-red-700'
            : task.priority?.toLowerCase() === 'medium'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-gray-100 text-gray-600'
            }`}>
          {getPriorityIcon(task.priority || 'medium')}
          <span className="capitalize">
            {task.priority || 'Medium'}
          </span>
        </div>
      </div>
    </div>
  );
}
