import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(`
      Variables d'environnement Supabase manquantes.
      Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont définies dans votre fichier .env.local
    `)
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        storageKey: 'verses_auth_token',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      global: {
        fetch: (input: RequestInfo | URL, init?: RequestInit) => 
          fetch(input, {
            ...init,
            cache: 'no-store',
          }).catch(error => {
            console.error('Erreur Supabase Fetch:', error)
            throw error
          })
      }
    }
  )
}

export const supabase = createClient()
