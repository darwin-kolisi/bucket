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

  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return (
          <svg
            className="h-3 w-3 text-red-500"
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
            className="h-3 w-3 text-yellow-500"
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
            className="h-3 w-3 text-green-500"
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
            className="h-3 w-3 text-gray-400"
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
    <div className="bg-white rounded-lg p-3 border border-gray-200 transition-shadow">
      <div className="flex justify-between items-center mb-1">
        <h4 className="text-sm font-medium text-gray-900 m-0">{task.title}</h4>
        <div className="relative" ref={menuRef}>
          <button
            className="text-gray-400 hover:text-gray-600 text-xl cursor-pointer p-0 bg-transparent border-none transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}>
            ⋯
          </button>
          {isMenuOpen && (
            <div className="absolute top-full right-0 mt-1 w-48 origin-top-right rounded-xl border border-gray-200 bg-white p-1 text-sm text-gray-900 shadow-lg z-50">
              <button
                onClick={handleEdit}
                className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100 text-left">
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
                className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100 text-left">
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
      <p className="text-sm text-gray-500 m-0 mb-4">{task.subtitle}</p>
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Subtasks</span>
            <span className="text-xs text-gray-400">
              {task.subtasks.filter((st) => st.completed).length}/
              {task.subtasks.length}
            </span>
          </div>
          <div className="space-y-2">
            {task.subtasks.map((subtask) => (
              <label
                key={subtask.id}
                className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={subtask.completed}
                  onChange={() => onToggleSubtask(task.id, subtask.id)}
                  className="rounded border-gray-300 text-black focus:ring-black"
                />
                <span
                  className={`text-sm ${
                    subtask.completed
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
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-500">Progress</span>
        <span className="text-sm font-semibold text-gray-900">
          {Math.round((task.progress / task.total) * 100)}%
        </span>
      </div>
      <div className="flex gap-1 mb-3 h-2 items-center">
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            key={index}
            className={`w-4 h-4 rounded-sm ${
              index < Math.floor(((task.progress / task.total) * 100) / 10)
                ? 'bg-black shadow-sm'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium text-gray-500">{task.date}</div>
        <div
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${
            task.priority?.toLowerCase() === 'high'
              ? 'bg-red-200 text-red-900'
              : task.priority?.toLowerCase() === 'medium'
              ? 'bg-orange-100 text-gray-700'
              : 'bg-gray-100 text-gray-600'
          }`}>
          {getPriorityIcon(task.priority || 'medium')}
          <span className="text-xs font-medium capitalize">
            {task.priority || 'Medium'}
          </span>
        </div>
      </div>
    </div>
  );
}
