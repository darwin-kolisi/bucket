 'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ErrorToastContext = createContext(null);

export function useErrorToast() {
  const context = useContext(ErrorToastContext);
  if (!context) {
    throw new Error('useErrorToast must be used within ErrorToastProvider');
  }
  return context;
}

export function ErrorToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const pushError = useCallback(
    (message, options = {}) => {
      if (!message) return;
      const id =
        options.id ||
        (typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`);
      const duration = Number.isInteger(options.duration)
        ? options.duration
        : 4000;

      setToasts((prev) => [...prev, { id, message }]);

      if (duration > 0) {
        const timer = setTimeout(() => removeToast(id), duration);
        timers.current.set(id, timer);
      }
    },
    [removeToast]
  );

  return (
    <ErrorToastContext.Provider value={{ pushError }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto w-[320px] max-w-[calc(100vw-2rem)] surface-card rounded-2xl border border-gray-200 bg-white shadow-lg px-4 py-3">
            <div className="flex items-start gap-3">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-red-500" />
              <p className="text-sm text-gray-900 flex-1">
                {toast.message}
              </p>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none">
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ErrorToastContext.Provider>
  );
}
