'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { useAppContext } from '@/app/providers/Provider';
import { useErrorToast } from '@/components/ui/ErrorToastProvider';

const WORKSPACE_TEMPLATES = [
  {
    id: 'work',
    title: 'For work',
    description: 'Track team projects, timelines, and deliverables.',
    defaultName: 'Work',
  },
  {
    id: 'personal',
    title: 'For personal life',
    description: 'Plan goals, habits, routines, and personal tasks.',
    defaultName: 'Personal',
  },
  {
    id: 'school',
    title: 'For school',
    description: 'Organize classes, assignments, and revision notes.',
    defaultName: 'School',
  },
];

const getWorkspaceTemplateIcon = (templateId) => {
  if (templateId === 'work') {
    return (
      <svg
        className="h-4 w-4 text-gray-700"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round">
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M3 12h18" />
      </svg>
    );
  }

  if (templateId === 'personal') {
    return (
      <svg
        className="h-4 w-4 text-gray-700"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round">
        <path d="m3 11.5 9-8 9 8" />
        <path d="M5.5 10.5V20a1 1 0 0 0 1 1H10v-6h4v6h3.5a1 1 0 0 0 1-1v-9.5" />
      </svg>
    );
  }

  return (
    <svg
      className="h-4 w-4 text-gray-700"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-13Z" />
      <path d="M4 8h16" />
      <path d="M9 4v4" />
      <path d="M15 4v4" />
      <path d="M8 13h8" />
    </svg>
  );
};

export default function NewWorkspacePage() {
  const router = useRouter();
  const { createWorkspace } = useAppContext();
  const { pushError } = useErrorToast();
  const [selectedTemplateId, setSelectedTemplateId] = useState(WORKSPACE_TEMPLATES[0].id);
  const [workspaceName, setWorkspaceName] = useState(WORKSPACE_TEMPLATES[0].defaultName);
  const [isCreating, setIsCreating] = useState(false);

  const selectedTemplate = useMemo(
    () =>
      WORKSPACE_TEMPLATES.find((template) => template.id === selectedTemplateId) ||
      WORKSPACE_TEMPLATES[0],
    [selectedTemplateId]
  );

  const handleTemplateSelect = (template) => {
    setSelectedTemplateId(template.id);
    setWorkspaceName((currentName) => {
      const trimmedCurrentName = currentName.trim();
      const isPresetName = WORKSPACE_TEMPLATES.some(
        (workspaceTemplate) =>
          workspaceTemplate.defaultName.toLowerCase() ===
          trimmedCurrentName.toLowerCase()
      );

      if (!trimmedCurrentName || isPresetName) {
        return template.defaultName;
      }

      return currentName;
    });
  };

  const handleCancel = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push('/dashboard');
  };

  const handleCreateWorkspace = async () => {
    const trimmedName = workspaceName.trim();
    if (!trimmedName) {
      pushError('Workspace name is required.');
      return;
    }

    setIsCreating(true);
    const workspace = await createWorkspace(trimmedName);
    setIsCreating(false);

    if (!workspace) {
      pushError('Unable to create workspace. Please try again.');
      return;
    }

    handleCancel();
  };

  return (
    <Layout>
      <section className="page-shell px-6 md:px-10 pt-6 pb-10">
        <div className="mx-auto w-full max-w-3xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                Workspace setup
              </p>
              <h1 className="mt-2 text-xl font-semibold text-gray-900">
                Create a workspace
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Pick a setup style, then name your workspace.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCancel}
              className="h-9 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Back
            </button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {WORKSPACE_TEMPLATES.map((template) => {
              const isSelected = template.id === selectedTemplateId;
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleTemplateSelect(template)}
                  className={`flex flex-col gap-2 rounded-xl border px-4 py-3 text-left transition ${
                    isSelected
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 bg-white'
                  }`}>
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100">
                      {getWorkspaceTemplateIcon(template.id)}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {template.title}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{template.description}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
            <label
              htmlFor="workspace-name"
              className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Workspace name
            </label>
            <input
              id="workspace-name"
              type="text"
              value={workspaceName}
              onChange={(event) => setWorkspaceName(event.target.value)}
              placeholder={selectedTemplate.defaultName}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
            />
            <p className="mt-2 text-xs text-gray-400">
              This will show up in your sidebar workspace menu.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="h-9 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateWorkspace}
              disabled={isCreating}
              className="h-9 rounded-lg bg-gray-900 px-4 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60">
              {isCreating ? 'Creating…' : 'Create workspace'}
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
