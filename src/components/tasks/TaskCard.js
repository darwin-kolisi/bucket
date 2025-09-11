import { useState, useRef } from 'react';
import { useClickOutside } from '@react-hooks-hub/use-click-outside';

export default function TaskCard({
  task,
  onDeleteTask,
  onDuplicateTask,
  onEditTask,
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

  const progressPercentage =
    task.total > 0 ? Math.round((task.progress / task.total) * 100) : 0;

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-1">
        <h4 className="text-base font-semibold text-gray-900 m-0">
          {task.title}
        </h4>
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
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-500">Progress</span>
        <span className="text-sm font-semibold text-gray-900">
          {progressPercentage}%
        </span>
      </div>
      <div className="flex gap-1.5 mb-4 h-4 items-center">
        {Array.from({ length: task.total }).map((_, index) => (
          <div
            key={index}
            className={`w-4 h-4 rounded ${
              index < task.progress ? 'bg-black shadow-sm' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium text-gray-500">{task.date}</div>
      </div>
    </div>
  );
}
