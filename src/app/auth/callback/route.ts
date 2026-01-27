import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

type CookieOptions = {
  path?: string;
  maxAge?: number;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'lax' | 'strict' | 'none';
  expires?: Date;
};

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=no_code`);
  }

  try {
    const cookieStore = cookies();
    
    // Créer le client Supabase avec la gestion des cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name: string) => {
            const cookie = cookieStore.get(name);
            return cookie?.value;
          },
          set: (name: string, value: string, options: CookieOptions) => {
            try {
              cookieStore.set({
                name,
                value,
                ...options,
              } as any);
            } catch (error) {
              console.error('Error setting cookie:', error);
            }
          },
          remove: (name: string, options: Omit<CookieOptions, 'maxAge' | 'expires'>) => {
            try {
              cookieStore.set({
                name,
                value: '',
                ...options,
                maxAge: 0
              } as any);
            } catch (error) {
              console.error('Error removing cookie:', error);
            }
          },
        },
      }
    );
    
    // Échanger le code contre une session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/signin?error=${encodeURIComponent(error.message)}`
      );
    }

    console.log('Session exchange successful for user:', data.user?.email);
    
    // Redirection après connexion réussie
    const redirectUrl = requestUrl.searchParams.get('redirect_to') || '/';
    return NextResponse.redirect(new URL(redirectUrl, requestUrl.origin));
    
  } catch (error) {
    console.error('Unexpected error in auth callback:', error);
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/signin?error=unexpected_error`
    );
  }
}
