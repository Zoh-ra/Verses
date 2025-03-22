'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { User } from '@/types/user';

interface AppLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export default function AppLayout({ children, requireAuth = true }: AppLayoutProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setIsLoading(false);

      if (requireAuth && !data.user) {
        router.push('/auth/signin');
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);

        if (requireAuth && !session?.user) {
          router.push('/auth/signin');
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [requireAuth, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return null; // Will redirect to signin
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow pt-16">
        {children}
      </main>
    </div>
  );
}
