'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Initialisation de la session au chargement du site
    const initSession = async () => {
      try {
        setIsLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erreur lors de la récupération de la session:', error);
          
          // Si l'erreur est liée à un token de rafraîchissement invalide
          if (error.message.includes('Invalid Refresh Token') || 
              error.message.includes('Refresh Token Not Found')) {
            
            console.log('Token de rafraîchissement invalide lors de l\'initialisation, nettoyage de session');
            // Nettoyer complètement les données de session locales
            localStorage.removeItem('supabase.auth.token');
            setSession(null);
            setUser(null);
          }
          
          return;
        }

        if (session) {
          console.log('Session trouvée au chargement:', session.user.email);
          setSession(session);
          setUser(session.user);
          
          // Si l'utilisateur est sur la page de connexion ou d'inscription, le rediriger vers les paniers
          if (pathname === '/auth/signin' || pathname === '/auth/signup') {
            router.push('/baskets');
          }
        } else {
          console.log('Aucune session trouvée au chargement');
          setSession(null);
          setUser(null);
          
          // Si l'utilisateur tente d'accéder à une page protégée sans être connecté, rediriger vers la connexion
          if (pathname?.includes('/baskets') || pathname === '/profile') {
            router.push('/auth/signin');
          }
        }
      } catch (error) {
        console.error('Exception lors de l\'initialisation de la session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();

    // Abonnement aux changements d'authentification
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Événement d\'authentification:', event, 'Session:', newSession?.user?.email);
        
        if (event === 'SIGNED_IN') {
          console.log('Connexion détectée');
          setSession(newSession);
          setUser(newSession?.user || null);
          
          // Rediriger vers /baskets après la connexion
          router.push('/baskets');
        } 
        else if (event === 'SIGNED_OUT') {
          console.log('Déconnexion détectée');
          setSession(null);
          setUser(null);
          
          // Nettoyer les données locales lors de la déconnexion
          localStorage.removeItem('supabase.auth.token');
          
          // Rediriger vers la page d'accueil après déconnexion
          if (pathname !== '/') {
            // Forcer le rafraîchissement de la page pour nettoyer tous les états
            window.location.href = '/';
          }
        }
        else if (event === 'TOKEN_REFRESHED') {
          console.log('Token rafraîchi');
          setSession(newSession);
          setUser(newSession?.user || null);
        }
        else if (event === 'USER_UPDATED') {
          console.log('Utilisateur mis à jour');
          setSession(newSession);
          setUser(newSession?.user || null);
        }
        
        setIsLoading(false);
      }
    );

    // Nettoyage
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [pathname, router]);

  // Fonction pour se déconnecter proprement
  const signOut = async () => {
    try {
      console.log('Tentative de déconnexion...');
      setIsLoading(true);
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('Erreur lors de la déconnexion:', error);
        throw error;
      }
      
      // Réinitialiser l'état localement
      setSession(null);
      setUser(null);
      
      console.log('Déconnexion réussie, redirection...');
      
      // Forcer un rechargement complet de la page pour réinitialiser tout l'état
      window.location.href = '/';
    } catch (error) {
      console.error('Exception lors de la déconnexion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour rafraîchir manuellement la session
  const refreshSession = async () => {
    try {
      setIsLoading(true);
      console.log('Rafraîchissement de la session...');
      
      // Essayer d'abord de récupérer la session existante
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Erreur lors de la récupération de la session:', sessionError);
        return;
      }
      
      if (!currentSession) {
        console.log('Aucune session trouvée lors du rafraîchissement');
        setSession(null);
        setUser(null);
        return;
      }
      
      // Essayer de rafraîchir le token si une session existe
      try {
        const { data: { session: refreshedSession }, error: refreshError } = 
          await supabase.auth.refreshSession(currentSession);
        
        if (refreshError) {
          console.error('Erreur lors du rafraîchissement du token:', refreshError);
          
          // Si l'erreur est liée à un token invalide ou manquant, on nettoie la session
          if (refreshError.message.includes('Invalid Refresh Token') || 
              refreshError.message.includes('Refresh Token Not Found')) {
            console.log('Token de rafraîchissement invalide ou manquant, nettoyage de session');
            setSession(null);
            setUser(null);
            
            // Redirection uniquement si on est sur une page protégée
            if (pathname?.includes('/baskets') || pathname === '/profile') {
              router.push('/auth/signin');
            }
          }
          return;
        }
        
        console.log('Session rafraîchie avec succès');
        setSession(refreshedSession);
        setUser(refreshedSession?.user || null);
      } catch (error) {
        console.error('Exception lors du rafraîchissement du token:', error);
        setSession(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Exception lors du rafraîchissement de la session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    session,
    user,
    isLoading,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personnalisé pour utiliser le contexte d'authentification
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  
  return context;
}
