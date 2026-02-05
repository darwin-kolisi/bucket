'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { useAppContext } from '@/app/providers/Provider';

export default function NewTaskPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = Array.isArray(params.projectId)
    ? params.projectId[0]
    : params.projectId;
  const { projects, setProjects } = useAppContext();
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const project = projects.find((item) => item.id === projectId);

  const refreshProject = async () => {
    if (!projectId) return;
    try {
      const response = await fetch(`${apiBase}/api/projects/${projectId}`, {
        credentials: 'include',
      });
      if (!response.ok) return;
      const data = await response.json();
      if (!data?.project) return;
      setProjects((prev) =>
        prev.map((item) => (item.id === projectId ? data.project : item))
      );
    } catch (err) {
      // noop
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!projectId) {
      setError('Missing project id.');
      return;
    }
    if (!taskName.trim()) {
      setError('Task name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiBase}/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: taskName.trim(),
          description: description.trim(),
          dueDate: dueDate || null,
          priority,
          subtasks,
          status: 'todo',
        }),
      });

      if (!response.ok) {
        setError('Failed to create task.');
        return;
      }

      await refreshProject();
      router.push(`/projects/${projectId}`);
    } catch (err) {
      setError('Failed to create task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(projectId ? `/projects/${projectId}` : '/projects');
  };

  const priorityOptions = ['Low', 'Medium', 'High'];

  return (
    <Layout>
      <div className="flex-1 min-h-screen px-5 md:px-8 pt-6 pb-10">
        <div className="w-full max-w-3xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <button
              type="button"
              onClick={() => router.push('/projects')}
              className="hover:text-gray-600">
              Projects
            </button>
            <span>/</span>
            <button
              type="button"
              onClick={() => router.push(projectId ? `/projects/${projectId}` : '/projects')}
              className="hover:text-gray-600">
              {project?.name || 'Project'}
            </button>
            <span>/</span>
            <span className="text-gray-500">Add Task</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="surface-card rounded-2xl p-6">
              <div className="mb-6">
                <h1 className="text-lg font-semibold text-gray-900">Add Task</h1>
              </div>

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
                    <div key={subtask.id} className="flex items-center gap-2">
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

              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-create px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-60">
                {isSubmitting ? 'Creating...' : 'Add Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
