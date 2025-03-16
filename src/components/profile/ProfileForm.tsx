'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';

type ProfileData = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
};

type ProfileFormProps = {
  profile: ProfileData;
  userId: string;
};

export function ProfileForm({ profile, userId }: ProfileFormProps) {
  const [fullName, setFullName] = useState(profile.full_name || '');
  const [username, setUsername] = useState(profile.username || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setMessage({
        text: "Le nom d'utilisateur est requis",
        type: 'error'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          username: username.trim(),
          full_name: fullName.trim() || null,
          avatar_url: avatarUrl.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      setMessage({
        text: 'Profil mis à jour avec succès!',
        type: 'success'
      });
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setMessage({
        text: error.message || 'Une erreur est survenue lors de la mise à jour du profil',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {message && (
        <div 
          className={`mb-4 p-3 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 border-l-4 border-green-500' 
              : 'bg-red-100 text-red-800 border-l-4 border-red-500'
          }`}
        >
          {message.text}
        </div>
      )}
      
      <div className="mb-4">
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nom d&apos;utilisateur*
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
          required
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nom complet
        </label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
          placeholder="Prénom Nom"
        />
      </div>
      
      <div className="mb-6">
        <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          URL de l&apos;avatar
        </label>
        <input
          id="avatarUrl"
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
          placeholder="https://exemple.com/avatar.jpg"
        />
        <p className="text-xs text-gray-500 mt-1">
          Entrez l&apos;URL d&apos;une image pour votre avatar. Pour de meilleurs résultats, utilisez une image carrée.
        </p>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md transition-colors"
        >
          {isSubmitting ? (
            <>
              <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              Mise à jour...
            </>
          ) : 'Enregistrer les modifications'}
        </button>
      </div>
    </form>
  );
}
