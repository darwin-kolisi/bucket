const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const buildError = async (response, fallbackMessage) => {
  let message = fallbackMessage;

  try {
    const payload = await response.json();
    if (typeof payload?.error === 'string' && payload.error.trim()) {
      message = payload.error;
    }
  } catch (error) {
    // Ignore invalid error payloads and keep fallback message.
  }

  const apiError = new Error(message);
  apiError.status = response.status;
  return apiError;
};

export const fetchAccount = async () => {
  const response = await fetch(`${apiBase}/api/me`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw await buildError(response, 'Failed to load account');
  }

  const data = await response.json();
  return data.user;
};

export const updateAccount = async (payload) => {
  const response = await fetch(`${apiBase}/api/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await buildError(response, 'Failed to update account');
  }

  const data = await response.json();
  return data.user;
};

export const deleteAccount = async (confirmation) => {
  const response = await fetch(`${apiBase}/api/me`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ confirmation }),
  });

  if (!response.ok) {
    throw await buildError(response, 'Failed to delete account');
  }
};
