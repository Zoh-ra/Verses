'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import { AuthError } from '@supabase/supabase-js';

export default function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        throw error;
      }

      setMessage('Inscription réussie ! Vérifiez votre email pour confirmer votre compte.');
    } catch (error) {
      let errorMessage = 'Une erreur est survenue lors de l\'inscription';
      
      if (error instanceof AuthError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card p-8 w-full max-w-md mx-auto shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">Inscription</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {message && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6" role="alert">
          <span className="block sm:inline">{message}</span>
        </div>
      )}
      
      <form onSubmit={handleSignUp} className="space-y-5">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Pseudo
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="input"
            required
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            required
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            required
            minLength={6}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Le mot de passe doit contenir au moins 6 caractères
          </p>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Inscription en cours...' : 'S\'inscrire'}
        </button>
      </form>
      
      <div className="mt-8 text-center text-sm">
        <p className="text-gray-600 dark:text-gray-400">
          Vous avez déjà un compte ?{' '}
          <Link href="/auth/signin" className="text-primary hover:underline font-medium">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
