'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { useAppContext } from '@/app/providers/Provider';
import DatePicker from '@/components/ui/DatePicker';

const toDateInput = (value) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = Array.isArray(params.projectId)
    ? params.projectId[0]
    : params.projectId;
  const { projects, setProjects, selectedWorkspaceId } = useAppContext();
  const project = projects.find((item) => item.id === projectId);
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const targetProjectRoute = '/projects';

  const refreshProjects = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedWorkspaceId) {
        params.set('workspaceId', selectedWorkspaceId);
      }
      const query = params.toString();
      const response = await fetch(`${apiBase}/api/projects${query ? `?${query}` : ''}`, {
        credentials: 'include',
      });
      if (!response.ok) return;
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (err) {
      // noop
    }
  };

  useEffect(() => {
    if (project && !hasInitialized) {
      setProjectName(project.name || '');
      setDescription(project.description || '');
      setDueDate(toDateInput(project.dueDate));
      setHasInitialized(true);
      setIsLoading(false);
    }
  }, [project, hasInitialized]);

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId || project) return;
      setIsLoading(true);
      try {
        const response = await fetch(`${apiBase}/api/projects/${projectId}`, {
          credentials: 'include',
        });
        if (!response.ok) {
          setError('Project not found.');
          setIsLoading(false);
          return;
        }
        const data = await response.json();
        if (!data?.project) {
          setError('Project not found.');
          setIsLoading(false);
          return;
        }
        setProjects((prev) => {
          const exists = prev.some((item) => item.id === data.project.id);
          if (exists) {
            return prev.map((item) =>
              item.id === data.project.id ? data.project : item
            );
          }
          return [...prev, data.project];
        });
        setProjectName(data.project.name || '');
        setDescription(data.project.description || '');
        setDueDate(toDateInput(data.project.dueDate));
        setHasInitialized(true);
      } catch (err) {
        setError('Project not found.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [apiBase, projectId, project, setProjects]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!projectName.trim()) {
      setError('Project name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiBase}/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: projectName.trim(),
          description: description.trim(),
          dueDate: dueDate || null,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setError(payload?.error || 'Failed to update project.');
        return;
      }

      await refreshProjects();
      router.push(targetProjectRoute);
    } catch (err) {
      setError('Failed to update project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(targetProjectRoute);
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

  if (isLoading) {
    return (
      <Layout>
        <div className="flex-1 app-dots page-shell">
          <div className="px-5 md:px-8 pt-6 pb-12">
            <div className="surface-card rounded-2xl border border-gray-200 bg-white shadow-sm p-6 text-sm text-gray-500">
              Loading project...
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 app-dots page-shell">
        <div className="px-5 md:px-8 pt-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center">
              <h1 className="text-lg font-medium text-gray-900">
                Edit Project
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
                form="edit-project-form"
                disabled={isSubmitting}
                className="btn-create px-4 h-9.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-60">
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 md:px-8 pb-12">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <form
              id="edit-project-form"
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
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
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
