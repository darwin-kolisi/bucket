import { useState, useEffect, useRef } from 'react';

export default function TaskCard({
  task,
  onDeleteTask,
  onDuplicateTask,
  onEditTask,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

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
            className="text-gray-400 text-xl cursor-pointer p-0 bg-transparent border-none"
            onClick={() => setIsMenuOpen(true)}
            aria-expanded={isMenuOpen}>
            ⋯
          </button>
          {isMenuOpen && (
            <div className="absolute top-full right-0 bg-white border border-gray-200 rounded-xl shadow-lg p-2 min-w-[160px] z-50 mt-1">
              <button
                className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors mb-0.5"
                onClick={handleEdit}>
                Edit
              </button>
              <button
                className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors mb-0.5"
                onClick={handleDuplicate}>
                Duplicate
              </button>
              <button
                className="block w-full text-left px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                onClick={handleDelete}>
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
