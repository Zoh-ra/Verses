'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { User } from '@/types/user';

type ProfileData = {
  id: string;
  username: string;
  full_name: string | null;
  email: string | null;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
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

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setFeedbackLoading(true);
    try {
      // Vérifier si l'utilisateur est connecté
      if (!user) {
        throw new Error("Vous devez être connecté pour soumettre un avis");
      }

      // Enregistrer le feedback dans la base de données
      const { error } = await supabase.from('user_feedback').insert([
        { 
          user_id: user.id, 
          content: feedback,
          created_at: new Date().toISOString() 
        }
      ]);

      if (error) {
        throw error;
      }

      setFeedbackSubmitted(true);
      setFeedback('');
    } catch (error) {
      console.error('Erreur lors de l\'envoi du feedback:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'envoi de votre avis');
    } finally {
      setFeedbackLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
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
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <h2 className="text-2xl font-bold mb-4">Vous n&apos;êtes pas connecté</h2>
          <button 
            onClick={() => router.push('/auth/signin')}
            className="bg-primary hover:bg-primary-hover text-white font-medium py-2 px-4 rounded-lg"
          >
            Se connecter
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg mb-8">
          {/* Header avec titre et bouton de déconnexion */}
          <div className="px-6 py-5 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mon Profil</h2>
            <button
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              Déconnexion
            </button>
          </div>
          
          {/* Infos utilisateur */}
          <div className="px-6 py-5">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Informations Personnelles</h3>
              <div className="grid grid-cols-1 gap-4">
                {/* Pseudo */}
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 w-32">Pseudo</div>
                  <div className="mt-1 sm:mt-0 text-base text-gray-900 dark:text-white">
                    {profile?.full_name || (user?.email ? user.email.split('@')[0] : '') || 'Non défini'}
                  </div>
                </div>
                
                {/* Email */}
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 w-32">Email</div>
                  <div className="mt-1 sm:mt-0 text-base text-gray-900 dark:text-white">{user.email}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Section de feedback */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Partagez votre avis</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Nous apprécions vos commentaires pour améliorer votre expérience. N&apos;hésitez pas à partager vos suggestions, signaler des bugs ou demander de nouvelles fonctionnalités.
            </p>
          </div>
          
          <div className="px-6 py-5">
            {feedbackSubmitted ? (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
                Merci pour votre retour ! Nous l&apos;avons bien reçu et nous l&apos;analyserons prochainement.
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit}>
                <textarea
                  rows={5}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Partagez vos idées, commentaires ou signalements de bugs..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  required
                />
                <div className="mt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={feedbackLoading}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg text-sm flex items-center"
                  >
                    {feedbackLoading ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                        Envoi en cours...
                      </>
                    ) : (
                      'Envoyer mon avis'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
