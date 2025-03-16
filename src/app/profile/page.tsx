'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';

type ProfileData = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
};

type PreferencesData = {
  id: string;
  user_id: string;
  theme: string;
  translation_preference: string;
  display_mode: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function getProfile() {
      setLoading(true);
      try {
        // Vérifier si l'utilisateur est connecté
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          throw userError;
        }

        if (!user) {
          router.push('/auth/signin');
          return;
        }

        setUser(user);
        console.log("Utilisateur authentifié:", user);

        // Récupérer les données du profil
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error("Erreur lors de la récupération du profil:", profileError);
          throw profileError;
        }

        console.log("Données du profil:", profileData);
        setProfile(profileData);
      } catch (error) {
        console.error('Erreur:', error);
        setError(error instanceof Error ? error.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    }

    getProfile();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/auth/signin');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loader"></div>
        <p className="ml-2">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 max-w-lg w-full" role="alert">
          <p className="font-bold">Erreur</p>
          <p>{error}</p>
        </div>
        <button 
          onClick={() => router.push('/auth/signin')}
          className="bg-primary hover:bg-primary-hover text-white font-medium py-2 px-4 rounded-lg"
        >
          Retour à la connexion
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">Vous n'êtes pas connecté</h2>
        <button 
          onClick={() => router.push('/auth/signin')}
          className="bg-primary hover:bg-primary-hover text-white font-medium py-2 px-4 rounded-lg"
        >
          Se connecter
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profil Utilisateur</h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Informations personnelles</p>
            </div>
            <button
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              Déconnexion
            </button>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700">
            <dl>
              <div className="bg-gray-50 dark:bg-gray-900 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:col-span-2 sm:mt-0">{user.email}</dd>
              </div>
              
              <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">ID Utilisateur</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:col-span-2 sm:mt-0">{user.id}</dd>
              </div>
              
              {profile && (
                <>
                  <div className="bg-gray-50 dark:bg-gray-900 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Nom d'utilisateur</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:col-span-2 sm:mt-0">{profile.username || 'Non défini'}</dd>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Nom complet</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:col-span-2 sm:mt-0">{profile.full_name || 'Non défini'}</dd>
                  </div>
                </>
              )}
              
              <div className="bg-gray-50 dark:bg-gray-900 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Statut de l'email</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:col-span-2 sm:mt-0">
                  {user.email_confirmed_at ? (
                    <span className="text-green-600 dark:text-green-400">Confirmé ({new Date(user.email_confirmed_at).toLocaleString()})</span>
                  ) : (
                    <span className="text-yellow-600 dark:text-yellow-400">Non confirmé</span>
                  )}
                </dd>
              </div>
              
              <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Dernière connexion</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:col-span-2 sm:mt-0">
                  {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Jamais'}
                </dd>
              </div>
            </dl>
          </div>
          
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Données brutes</h3>
            <div className="mt-2 rounded-md bg-gray-100 dark:bg-gray-700 p-4 overflow-auto max-h-96">
              <pre className="text-xs text-gray-800 dark:text-gray-200">User: {JSON.stringify(user, null, 2)}</pre>
              {profile && <pre className="text-xs text-gray-800 dark:text-gray-200 mt-4">Profile: {JSON.stringify(profile, null, 2)}</pre>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
