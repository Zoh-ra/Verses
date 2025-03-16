'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function SignOutPage() {
  const [message, setMessage] = useState('Déconnexion en cours...');
  const router = useRouter();
  const { signOut } = useAuth();
  
  useEffect(() => {
    const performSignOut = async () => {
      try {
        await signOut();
        setMessage('Déconnexion réussie. Redirection...');
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        setMessage('Une erreur est survenue lors de la déconnexion. Redirection...');
        // En cas d'erreur, on redirige quand même
        setTimeout(() => router.push('/'), 2000);
      }
    };
    
    performSignOut();
  }, [router, signOut]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary/10 to-transparent">
      <div className="p-8 bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-md w-full text-center border border-gray-200 dark:border-gray-800">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{message}</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Vous serez automatiquement redirigé vers la page d&apos;accueil.
          </p>
        </div>
      </div>
    </div>
  );
}
