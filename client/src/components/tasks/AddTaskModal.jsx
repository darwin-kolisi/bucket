import { useState, useEffect } from 'react';

export default function AddTaskModal({
  onClose,
  onCreateTask,
  onEditTask,
  editingTask,
  isEditing,
}) {
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [isMobile, setIsMobile] = useState(false);

  const priorityOptions = ['Low', 'Medium', 'High'];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isEditing && editingTask) {
      setTaskName(editingTask.title);
      setDescription(
        editingTask.subtitle === 'No description' ? '' : editingTask.subtitle
      );
      setPriority(editingTask.priority || 'Medium');

      if (editingTask.date) {
        const dateParts = editingTask.date.split(' ');
        const months = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];
        const monthIndex = months.indexOf(dateParts[1]);
        const year = dateParts[2];
        const day = dateParts[0];
        const formattedDate = `${year}-${String(monthIndex + 1).padStart(
          2,
          '0'
        )}-${day.padStart(2, '0')}`;
        setDueDate(formattedDate);
        setSubtasks(editingTask.subtasks || []);
      }
    }
  }, [isEditing, editingTask]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (taskName.trim()) {
      const taskData = {
        taskName: taskName.trim(),
        description: description.trim(),
        dueDate: dueDate,
        subtasks: subtasks,
        priority: priority,
      };

      if (isEditing) {
        await onEditTask(taskData);
      } else {
        await onCreateTask(taskData);
      }
      onClose();
    }
  };

  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h1 className="text-s font-semibold text-gray-900">
            {isEditing ? 'Edit Task' : 'New Task'}
          </h1>
          <button
            onClick={onClose}
            className="p-2 text-2xl text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Task Name
              </label>
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="Enter task title"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter task description (optional)"
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900">
                {priorityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Subtasks
              </label>
              <div className="space-y-3 mb-4">
                {subtasks.map((subtask, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={subtask.title}
                      onChange={(e) => {
                        const updated = [...subtasks];
                        updated[index].title = e.target.value;
                        setSubtasks(updated);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded text-sm text-black"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setSubtasks(subtasks.filter((_, i) => i !== index))
                      }
                      className="text-red-400 hover:text-red-600 text-lg p-2">
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Add subtask"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded text-sm text-gray-900"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newSubtask.trim()) {
                      setSubtasks([
                        ...subtasks,
                        {
                          id: Date.now(),
                          title: newSubtask.trim(),
                          completed: false,
                        },
                      ]);
                      setNewSubtask('');
                    }
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm text-black">
                  Add
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-gray-200 space-y-3">
          <button
            type="submit"
            onClick={handleSubmit}
            className="w-full py-3 text-sm font-small text-white bg-black hover:bg-gray-800 rounded-lg transition-colors">
            {isEditing ? 'Update Task' : 'Create Task'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 text-sm font-small text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl p-1 rounded-lg transition-colors">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Task Name
            </label>
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="Enter task title"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description (optional)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900">
              {priorityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Subtasks
            </label>
            <div className="space-y-2 mb-2">
              {subtasks.map((subtask, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={subtask.title}
                    onChange={(e) => {
                      const updated = [...subtasks];
                      updated[index].title = e.target.value;
                      setSubtasks(updated);
                    }}
                    className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm text-black"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setSubtasks(subtasks.filter((_, i) => i !== index))
                    }
                    className="text-red-400 hover:text-red-600 text-sm">
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Add subtask"
                className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm text-gray-900"
              />
              <button
                type="button"
                onClick={() => {
                  if (newSubtask.trim()) {
                    setSubtasks([
                      ...subtasks,
                      {
                        id: Date.now(),
                        title: newSubtask.trim(),
                        completed: false,
                      },
                    ]);
                    setNewSubtask('');
                  }
                }}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm text-black">
                Add
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-lg transition-colors">
              {isEditing ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
