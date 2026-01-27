import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

interface CookieOptions {
  path?: string;
  maxAge?: number;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'lax' | 'strict' | 'none';
  expires?: Date;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectTo = requestUrl.searchParams.get('redirect_to') || '/';
  
  if (!code) {
    return NextResponse.redirect(
      new URL('/auth/signin?error=no_code', requestUrl.origin)
    );
  }

  try {
    // Créer une réponse de redirection
    const targetUrl = new URL(redirectTo, requestUrl.origin);
    const response = NextResponse.redirect(targetUrl);
    
    // Créer le client Supabase avec la gestion des cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      }
    );
    
    // Échanger le code contre une session
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/signin?error=${encodeURIComponent(error.message)}`
      );
    }

    console.log('Session exchange successful');
    
    // Redirection après connexion réussie
    return response;
    
  } catch (error) {
    console.error('Unexpected error in auth callback:', error);
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/signin?error=unexpected_error`
    );
  }
}
