'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { useAppContext } from '@/app/providers/Provider';

export default function NewProjectPage() {
  const router = useRouter();
  const { setProjects } = useAppContext();
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const refreshProjects = async () => {
    try {
      const response = await fetch(`${apiBase}/api/projects`, {
        credentials: 'include',
      });
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
            <span className="text-gray-500">Add Project</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="surface-card rounded-2xl p-6">
              <div className="mb-6">
                <h1 className="text-lg font-semibold text-gray-900">Add Project</h1>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter project description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none text-gray-900"
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

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
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
                {isSubmitting ? 'Creating...' : 'Add Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
