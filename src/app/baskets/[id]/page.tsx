'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Trash2, Eye, List, X, Plus } from 'lucide-react';

interface BasketVerse {
  id: string;
  basket_id: string;
  verse_number: number;
  text_arabic: string;
  surah_id: number;
  created_at: string;
}

interface Basket {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

export default function BasketPage() {
  const params = useParams();
  const router = useRouter();
  const basketId = params?.id as string;
  
  const [basket, setBasket] = useState<Basket | null>(null);
  const [verses, setVerses] = useState<BasketVerse[]>([]);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'presentation'>('list');

  useEffect(() => {
    if (!basketId) return;
    
    const fetchBasketData = async () => {
      try {
        setIsLoading(true);
        
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/auth/signin');
          return;
        }
        
        // Fetch basket details
        const { data: basketData, error: basketError } = await supabase
          .from('baskets')
          .select('*')
          .eq('id', basketId)
          .single();
          
        if (basketError) throw basketError;
        
        // Check if the basket belongs to the current user
        if (basketData.user_id !== user.id) {
          router.push('/baskets');
          return;
        }
        
        setBasket(basketData);
        
        // Fetch basket verses
        const { data: versesData, error: versesError } = await supabase
          .from('basket_verses')
          .select('*')
          .eq('basket_id', basketId)
          .order('created_at', { ascending: true });
          
        if (versesError) throw versesError;
        
        setVerses(versesData || []);
        
      } catch (error: unknown) {
        console.error('Error fetching basket data:', error);
        setMessage({
          text: error instanceof Error ? error.message : 'Une erreur est survenue lors de la récupération des données',
          type: 'error'
        });
        setTimeout(() => setMessage(null), 3000);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBasketData();
  }, [basketId, router]);

  const handleNextVerse = () => {
    if (currentVerseIndex < verses.length - 1) {
      setCurrentVerseIndex(currentVerseIndex + 1);
    }
  };

  const handlePreviousVerse = () => {
    if (currentVerseIndex > 0) {
      setCurrentVerseIndex(currentVerseIndex - 1);
    }
  };

  const handleRemoveVerse = async (verseId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce verset du panier ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('basket_verses')
        .delete()
        .eq('id', verseId);
        
      if (error) throw error;
      
      // Update state - remove the verse
      const updatedVerses = verses.filter(v => v.id !== verseId);
      setVerses(updatedVerses);
      
      // Adjust current index if needed
      if (currentVerseIndex >= updatedVerses.length) {
        setCurrentVerseIndex(Math.max(0, updatedVerses.length - 1));
      }
      
      setMessage({ text: 'Verset supprimé avec succès', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: unknown) {
      console.error('Error removing verse:', error);
      setMessage({
        text: error instanceof Error ? error.message : 'Une erreur est survenue lors de la suppression du verset',
        type: 'error'
      });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{basket?.name}</h1>
          
          <Link
            href="/baskets"
            className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Retour aux paniers
          </Link>
        </div>
        
        {/* Messages */}
        {message && (
          <div 
            className={`fixed top-20 right-4 p-4 rounded-md shadow-md z-50 ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-800 border-l-4 border-green-500' 
                : 'bg-red-100 text-red-800 border-l-4 border-red-500'
            }`}
          >
            {message.text}
          </div>
        )}
        
        {verses.length > 0 ? (
          <div className="card p-6">
            {/* Toggle between list and presentation view */}
            <div className="flex justify-end mb-6 space-x-2">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-md flex items-center ${
                  viewMode === 'list' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                <List className="h-4 w-4 mr-2" />
                Liste
              </button>
              <button
                onClick={() => setViewMode('presentation')}
                className={`px-3 py-2 rounded-md flex items-center ${
                  viewMode === 'presentation' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                <Eye className="h-4 w-4 mr-2" />
                Présentation
              </button>
            </div>
            
            {viewMode === 'list' ? (
              <div>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                    <thead className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                      <tr>
                        <th className="py-3 px-4 text-left">Verset</th>
                        <th className="py-3 px-4 text-left">Texte</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                      {verses.map((verse, index) => (
                        <tr key={verse.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="py-3 px-4">
                            {verse.verse_number}
                          </td>
                          <td className="py-3 px-4 arabic text-right max-w-[200px] truncate" dir="rtl">
                            {verse.text_arabic}
                          </td>
                          <td className="py-3 px-4 text-center md:py-4 md:px-6">
                            <div className="flex justify-center space-x-2 md:space-x-4">
                              <button
                                onClick={() => {
                                  setCurrentVerseIndex(index);
                                  setViewMode('presentation');
                                }}
                                className="p-1.5 md:p-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition"
                                title="Afficher"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleRemoveVerse(verse.id)}
                                className="p-1.5 md:p-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6">
                  <Link
                    href={`/quran?basket=${basketId}`}
                    className="w-full sm:w-auto px-3 py-1.5 md:px-4 md:py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition flex items-center justify-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter des versets
                  </Link>
                  {verses.length > 0 && (
                    <button
                      onClick={() => {
                        setCurrentVerseIndex(0);
                        setViewMode('presentation');
                      }}
                      className="w-full sm:w-auto mt-2 sm:mt-0 px-3 py-1.5 md:px-4 md:py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center justify-center"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Afficher tous les versets
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="relative pt-8">
                {/* Close presentation mode button */}
                <button
                  onClick={() => setViewMode('list')}
                  className="absolute top-0 right-0 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
                
                {/* Verse counter */}
                <div className="text-center mb-4 text-sm text-gray-500 dark:text-gray-400">
                  Verset {currentVerseIndex + 1} sur {verses.length}
                </div>
                
                {/* Current verse - styled as an elegant quote */}
                <div className="p-10 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-indigo-950 rounded-xl mb-8 shadow-md border border-purple-100 dark:border-purple-900 relative">
                  <div className="absolute top-4 left-4 text-5xl text-purple-200 dark:text-purple-800 opacity-50">&ldquo;</div>
                  <div className="absolute bottom-4 right-4 text-5xl text-purple-200 dark:text-purple-800 opacity-50">&rdquo;</div>
                  
                  <div className="mb-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    Verset {verses[currentVerseIndex]?.verse_number}
                  </div>
                  
                  <p className="arabic text-center text-3xl leading-relaxed my-8 px-8">
                    {verses[currentVerseIndex]?.text_arabic}
                  </p>
                </div>
                
                {/* Navigation buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-8">
                  <button
                    onClick={handlePreviousVerse}
                    disabled={currentVerseIndex === 0}
                    className="w-full sm:w-auto px-3 py-1.5 md:px-4 md:py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Précédent
                  </button>
                  
                  <div className="w-full sm:w-auto flex justify-center my-2 sm:my-0">
                    <button
                      onClick={() => handleRemoveVerse(verses[currentVerseIndex].id)}
                      className="px-3 py-1.5 md:px-4 md:py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition flex items-center"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Supprimer
                    </button>
                  </div>
                  
                  {currentVerseIndex < verses.length - 1 ? (
                    <button
                      onClick={handleNextVerse}
                      className="w-full sm:w-auto px-3 py-1.5 md:px-4 md:py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition flex items-center justify-center"
                    >
                      Suivant
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  ) : (
                    <Link
                      href="/baskets"
                      className="w-full sm:w-auto px-3 py-1.5 md:px-4 md:py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-center"
                    >
                      Terminer
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10l8-4m0 0v10m0-10l8 4" />
            </svg>
            <h2 className="text-xl font-semibold mb-2">Ce panier est vide</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Ajoutez des versets depuis la page du Coran
            </p>
            <Link
              href={`/quran?basket=${basketId}`}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
            >
              Explorer le Coran
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
