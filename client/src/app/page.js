'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export default function Home() {
  const router = useRouter();
  const session = authClient.useSession();

  useEffect(() => {
    if (session.isPending) {
      return;
    }

    router.replace(session.data ? '/dashboard' : '/auth');
  }, [router, session.data, session.isPending]);

  return null;
}
