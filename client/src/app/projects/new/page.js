'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { useAppContext } from '@/app/providers/Provider';
import DatePicker from '@/components/ui/DatePicker';

export default function NewProjectPage() {
  const router = useRouter();
  const { setProjects, selectedWorkspaceId } = useAppContext();
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const refreshProjects = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedWorkspaceId) {
        params.set('workspaceId', selectedWorkspaceId);
      }
      const query = params.toString();

      const response = await fetch(
        `${apiBase}/api/projects${query ? `?${query}` : ''}`,
        {
          credentials: 'include',
        }
      );
      if (!response.ok) return;
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (err) {
      // noop
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!projectName.trim()) {
      setError('Project name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiBase}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: projectName.trim(),
          description: description.trim(),
          dueDate: dueDate || null,
          workspaceId: selectedWorkspaceId || null,
        }),
      });

      if (!response.ok) {
        setError('Failed to create project.');
        return;
      }

      const data = await response.json();
      if (data?.project) {
        await refreshProjects();
        router.push(`/projects/${data.project.id}`);
      } else {
        await refreshProjects();
        router.push('/projects');
      }
    } catch (err) {
      setError('Failed to create project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/projects');
  };

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

  const summaryName = projectName.trim() || 'Untitled project';
  const summaryDescription =
    description.trim() || 'No description yet.';
  const summaryDueDate = formatDate(dueDate);

  return (
    <Layout>
      <div className="flex-1 min-h-screen app-dots">
        <div className="px-5 md:px-8 pt-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center">
              <h1 className="text-lg font-medium text-gray-900">
                New Project
              </h1>
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
                form="new-project-form"
                disabled={isSubmitting}
                className="btn-create px-4 h-9.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-60">
                {isSubmitting ? 'Creating...' : 'Add Project'}
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 md:px-8 pb-12">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <form
              id="new-project-form"
              onSubmit={handleSubmit}
              className="space-y-5">
              <div className="surface-card rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xs uppercase tracking-wide text-gray-500">
                      Project details
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
                        Project Name
                      </label>
                      <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="Launch roadmap"
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
                        onChange={setDueDate}
                        placeholder="DD / MM / YYYY"
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
                      placeholder="Scope, goals, or constraints to share."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none text-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Status
                    </label>
                    <input
                      type="text"
                      value="Derived from tasks"
                      disabled
                      className="w-full h-10.5 px-4 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-600 mt-4">{error}</p>
                )}
              </div>

              <div className="surface-card rounded-2xl border border-gray-200 bg-white shadow-sm p-4 sm:hidden">
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
                    {isSubmitting ? 'Creating...' : 'Add Project'}
                  </button>
                </div>
              </div>
            </form>

            <aside className="space-y-4">
              <div className="surface-card rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
                <div className="text-xs uppercase tracking-wide text-gray-500">
                  Summary
                </div>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-500">Name</span>
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
                    <span className="text-gray-500">Due date</span>
                    <span className="text-gray-900 font-medium text-right">
                      {summaryDueDate}
                    </span>
                  </div>
                </div>
                <div className="mt-4 rounded-xl border border-gray-200 surface-muted p-3 text-xs text-gray-500">
                  Status updates automatically as tasks move across the board.
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </Layout>
  );
}
