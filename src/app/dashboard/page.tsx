'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';

export default function DashboardPage() {
  const [username, setUsername] = useState<string | null>(null);
  const [basketCount, setBasketCount] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      // Get user info
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Get profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();
          
        if (profile) {
          setUsername(profile.username);
        }
        
        // Get basket count
        const { count } = await supabase
          .from('baskets')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
          
        if (count !== null) {
          setBasketCount(count);
        }
      }
    };
    
    fetchUserData();
  }, []);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {username ? `Salam, ${username}!` : 'Bienvenue !'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Que souhaitez-vous faire aujourd&apos;hui ?
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link 
            href="/quran"
            className="card p-6 text-center hover:scale-105 transition-transform"
          >
            <div className="mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Explorer le Coran</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Parcourir les sourates et versets du Coran
            </p>
          </Link>
          
          <Link 
            href="/baskets"
            className="card p-6 text-center hover:scale-105 transition-transform"
          >
            <div className="mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Mes Paniers</h2>
            <p className="text-gray-600 dark:text-gray-300">
              {basketCount > 0 
                ? `Vous avez ${basketCount} panier${basketCount > 1 ? 's' : ''}`
                : 'Créez votre premier panier'}
            </p>
          </Link>
          
          <Link 
            href="/profile"
            className="card p-6 text-center hover:scale-105 transition-transform"
          >
            <div className="mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Mon Profil</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Gérer mon profil et mes paramètres
            </p>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
