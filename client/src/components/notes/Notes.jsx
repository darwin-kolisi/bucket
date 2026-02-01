'use client';

export default function Notes() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-8 md:p-12">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="h-8 w-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10,9 9,9 8,9" />
              </svg>
            </div>

            <h2 className="text-xl font-semibold text-gray-900">Notes</h2>

            <div className="max-w-xl space-y-3 text-gray-600">
              <p>
                Instead of attaching files into each project separately, the
                Notes component is supposed to give me one spot to keep notes
                and attachments, organized per project.
              </p>
              <p>
                It's still a work in progress. The tricky part is making sure it
                plays nice with the project navigation. Right now, opening a
                project goes straight to the Kanban board (which I like), but I
                haven't figured out how to get to that project's notes folder
                without messing that up.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="h-4 w-4 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900">
                Comments & Feedback
              </h3>
            </div>
            <p className="text-xs text-gray-500">
              Add comments and discussions to project notes
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="h-4 w-4 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900">
                File Attachments
              </h3>
            </div>
            <p className="text-xs text-gray-500">
              Attach documents, images, and files to notes
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg
                  className="h-4 w-4 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900">
                Reminders & Alerts
              </h3>
            </div>
            <p className="text-xs text-gray-500">
              Set reminders and notifications for important notes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
