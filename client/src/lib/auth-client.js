import { createAuthClient } from 'better-auth/react';

const authBaseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const authClient = createAuthClient({
  baseURL: authBaseURL,
});
