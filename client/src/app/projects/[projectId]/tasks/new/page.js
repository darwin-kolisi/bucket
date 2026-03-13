'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import NotFound from '@/components/layout/NotFound';
import { useErrorToast } from '@/components/ui/ErrorToastProvider';
import DatePicker from '@/components/ui/DatePicker';
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
  const { pushError } = useErrorToast();

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

  if (!projectId) {
    return (
      <Layout>
        <NotFound
          title="Project not found"
          message="That project was deleted, archived, or you no longer have access to it."
          primaryLabel="Back to Projects"
          primaryHref="/projects"
          secondaryLabel="Go to Dashboard"
          secondaryHref="/dashboard"
        />
      </Layout>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!taskName.trim()) {
      setError('Task name is required.');
      return;
    }
    if (isAfterProjectDue(dueDate)) {
      setError('Task due date cannot be after the project due date.');
      pushError('Task due date cannot be after the project due date.');
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
        const payload = await response.json().catch(() => null);
        setError(payload?.error || 'Failed to create task.');
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
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(projectId ? `/projects/${projectId}` : '/projects');
  };

  const priorityOptions = ['Low', 'Medium', 'High'];

  const formatDate = (value) => {
    if (!value) return 'No due date';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'No due date';
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(parsed);
  };

  const summaryName = taskName.trim() || 'Untitled task';
  const summaryDescription =
    description.trim() || 'No description yet.';
  const summaryDueDate = formatDate(dueDate);
  const summaryProject = project?.name || 'Project';
  const summarySubtasks = subtasks.length;
  const projectDueMax = project?.dueDate
    ? (() => {
        const parsed = new Date(project.dueDate);
        if (Number.isNaN(parsed.getTime())) return '';
        const year = parsed.getFullYear();
        const month = String(parsed.getMonth() + 1).padStart(2, '0');
        const day = String(parsed.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      })()
    : '';

  const isAfterProjectDue = (value) => {
    if (!projectDueMax || !value) return false;
    return value > projectDueMax;
  };

  const handleDueDateChange = (value) => {
    setDueDate(value);
    if (error) setError('');
  };

  const handleDueDateInvalid = () => {
    pushError('Task due date cannot be after the project due date.');
  };

  return (
    <Layout>
      <div className="flex-1 page-shell">
        <div className="px-5 md:px-8 pt-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center">
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500">
                  {summaryProject}
                </div>
                <h1 className="text-lg font-medium text-gray-900">
                  New Task
                </h1>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-3 h-9.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                form="new-task-form"
                disabled={isSubmitting}
                className="btn-create px-4 h-9.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-60">
                {isSubmitting ? 'Creating...' : 'Add Task'}
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 md:px-8 pb-12">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <form
              id="new-task-form"
              onSubmit={handleSubmit}
              className="space-y-5">
              <div className="surface-card rounded-2xl border border-gray-200 bg-white p-6">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xs uppercase tracking-wide text-gray-500">
                      Task details
                    </h2>
                  </div>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                    Required
                  </span>
                </div>

                <div className="grid gap-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Task Name
                      </label>
                      <input
                        type="text"
                        value={taskName}
                        onChange={(e) => setTaskName(e.target.value)}
                        placeholder="Draft release notes"
                        className="w-full h-10.5 px-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Due Date
                      </label>
                      <DatePicker
                        value={dueDate}
                        onChange={handleDueDateChange}
                        max={projectDueMax || undefined}
                        placeholder="Select date"
                        onInvalid={handleDueDateInvalid}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Clarify the goal, dependencies, or expected output."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none text-gray-900 bg-white"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Priority
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full h-10.5 px-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 bg-white">
                        {priorityOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Status
                      </label>
                      <input
                        type="text"
                        value="To do"
                        disabled
                        className="w-full h-10.5 px-4 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-600 mt-4">{error}</p>
                )}
              </div>

              <div className="surface-card rounded-2xl border border-gray-200 bg-white p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xs uppercase tracking-wide text-gray-500">
                      Subtasks
                    </h2>
                  </div>
                  <span className="text-[11px] text-gray-400 uppercase tracking-wide">
                    Optional
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  {subtasks.map((subtask, index) => (
                    <div
                      key={subtask.id}
                      className="flex items-center gap-2">
                      <input
                        type="text"
                        value={subtask.title}
                        onChange={(e) => {
                          const updated = [...subtasks];
                          updated[index].title = e.target.value;
                          setSubtasks(updated);
                        }}
                        className="flex-1 h-9 px-3 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setSubtasks(subtasks.filter((_, i) => i !== index))
                        }
                        className="h-9 w-9 rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors">
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    placeholder="Add subtask"
                    className="flex-1 min-w-[180px] h-9 px-3 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
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
                    className="px-4 h-9 rounded-lg border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                    Add subtask
                  </button>
                </div>
              </div>

              <div className="surface-card rounded-2xl border border-gray-200 bg-white p-4 sm:hidden">
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-3 h-9.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-create px-4 h-9.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-60">
                    {isSubmitting ? 'Creating...' : 'Add Task'}
                  </button>
                </div>
              </div>
            </form>

            <aside className="space-y-4">
              <div className="surface-card rounded-2xl border border-gray-200 bg-white p-5">
                <div className="text-xs uppercase tracking-wide text-gray-500">
                  Summary
                </div>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-500">Task</span>
                    <span className="text-gray-900 font-medium text-right">
                      {summaryName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Description</span>
                    <p className="mt-1 text-sm text-gray-900 line-clamp-3">
                      {summaryDescription}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-500">Project</span>
                    <span className="text-gray-900 font-medium text-right">
                      {summaryProject}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-500">Due date</span>
                    <span className="text-gray-900 font-medium text-right">
                      {summaryDueDate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-500">Priority</span>
                    <span className="text-gray-900 font-medium text-right">
                      {priority}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-500">Subtasks</span>
                    <span className="text-gray-900 font-medium text-right">
                      {summarySubtasks}
                    </span>
                  </div>
                </div>
                <div className="mt-4 rounded-xl border border-gray-200 surface-muted p-3 text-xs text-gray-500">
                  New tasks land in “To do” and can be moved across the board.
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </Layout>
  );
}
