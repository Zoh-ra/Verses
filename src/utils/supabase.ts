import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Vérifier si les variables d'environnement sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Variables d\'environnement Supabase manquantes. Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont définies.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  // Augmenter les temps d'attente pour les requêtes
  global: {
    fetch: (...args) => {
      return fetch(...args).catch(error => {
        console.error('Erreur Supabase Fetch:', error);
        throw error;
      });
    }
  }
});
