'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { getSurahs, getVersesBySurah, Surah, Verse } from '@/services/quranService';
import { supabase } from '@/utils/supabase';

export default function QuranPage() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [userBaskets, setUserBaskets] = useState<{id: string; name: string; user_id: string}[]>([]);
  const [selectedBasket, setSelectedBasket] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingVerses, setLoadingVerses] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showCreateBasket, setShowCreateBasket] = useState(false);
  const [newBasketName, setNewBasketName] = useState('');

  // Fetch surahs on component mount
  useEffect(() => {
    const fetchData = async () => {
      const surahsData = await getSurahs();
      setSurahs(surahsData);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  // Fetch user's baskets
  useEffect(() => {
    const fetchUserBaskets = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: baskets } = await supabase
          .from('baskets')
          .select('*')
          .eq('user_id', user.id);
          
        if (baskets) {
          setUserBaskets(baskets);
        }
      }
    };
    
    fetchUserBaskets();
  }, []);

  const handleSurahSelect = async (surah: Surah) => {
    setSelectedSurah(surah);
    setLoadingVerses(true);
    const versesData = await getVersesBySurah(surah.id);
    setVerses(versesData);
    setLoadingVerses(false);
  };

  const handleAddToBasket = async (verse: Verse) => {
    if (!selectedBasket) {
      setMessage({ 
        text: 'Veuillez sélectionner un panier ou en créer un nouveau', 
        type: 'error' 
      });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setMessage({ text: 'Vous devez être connecté pour ajouter un verset à un panier', type: 'error' });
        setTimeout(() => setMessage(null), 3000);
        return;
      }

      // Extraire le numéro de verset de verse_key (format "1:1")
      const verseNumber = parseInt(verse.verse_key.split(':')[1]);
      
      // Check if verse already exists in the basket
      const { data: existingVerse } = await supabase
        .from('basket_verses')
        .select('*')
        .eq('basket_id', selectedBasket)
        .eq('surah_id', verse.surah_id || 0) // Utiliser 0 comme valeur par défaut si undefined
        .eq('verse_number', verseNumber)
        .single();

      if (existingVerse) {
        setMessage({ text: 'Ce verset est déjà dans le panier sélectionné', type: 'error' });
        setTimeout(() => setMessage(null), 3000);
        return;
      }

      // Préparation des données à insérer
      const basketVerseData: {
        basket_id: string;
        surah_id: number;
        verse_number: number;
        text_arabic?: string;
      } = {
        basket_id: selectedBasket,
        surah_id: verse.surah_id || 0, // Utiliser 0 comme valeur par défaut si undefined
        verse_number: verseNumber
      };

      // Ajouter le texte du verset si colonne 'text_arabic' existe
      if (verse.text_uthmani) {
        basketVerseData.text_arabic = verse.text_uthmani;
      }

      console.log('Données à insérer:', basketVerseData);

      // Add verse to the selected basket
      const { error } = await supabase
        .from('basket_verses')
        .insert([basketVerseData]);

      if (error) throw error;

      setMessage({ text: 'Verset ajouté au panier avec succès', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error adding verse to basket:', error);
      setMessage({ text: error instanceof Error ? error.message : 'Une erreur est survenue', type: 'error' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleCreateBasket = async () => {
    if (!newBasketName.trim()) {
      setMessage({ text: 'Veuillez entrer un nom pour le panier', type: 'error' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setMessage({ text: 'Vous devez être connecté pour créer un panier', type: 'error' });
        setTimeout(() => setMessage(null), 3000);
        return;
      }

      // Create a new basket
      const { data: basket, error } = await supabase
        .from('baskets')
        .insert([{ name: newBasketName, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      // Update state
      setUserBaskets([...userBaskets, basket]);
      setSelectedBasket(basket.id);
      setNewBasketName('');
      setShowCreateBasket(false);
      
      setMessage({ text: 'Panier créé avec succès', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error creating basket:', error);
      setMessage({ text: error instanceof Error ? error.message : 'Une erreur est survenue', type: 'error' });
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Le Saint Coran</h1>
        
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
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Surahs list */}
          <div className="md:w-1/3 lg:w-1/4">
            <div className="card overflow-hidden">
              <div className="p-4 bg-purple-100 dark:bg-purple-900 border-b border-purple-200 dark:border-purple-800">
                <h2 className="text-xl font-semibold">Sourates</h2>
              </div>
              <div className="overflow-y-auto max-h-[70vh]">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {surahs.map((surah) => (
                    <li 
                      key={surah.id} 
                      className={`p-4 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/30 transition ${
                        selectedSurah?.id === surah.id ? 'bg-purple-100 dark:bg-purple-900/50' : ''
                      }`}
                      onClick={() => handleSurahSelect(surah)}
                    >
                      <div className="flex items-center">
                        <span className="w-8 h-8 flex items-center justify-center bg-purple-600 text-white rounded-full mr-3">
                          {surah.id}
                        </span>
                        <div>
                          <div className="font-medium">{surah.name_simple}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {surah.translated_name.name} • {surah.verses_count} versets
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          {/* Verses and basket selection */}
          <div className="md:w-2/3 lg:w-3/4">
            {/* Basket selection section */}
            <div className="card mb-6 p-4">
              <h3 className="text-lg font-semibold mb-3">Sélectionnez un panier</h3>
              
              <div className="flex flex-wrap gap-3 mb-4">
                {userBaskets.length > 0 ? (
                  userBaskets.map((basket) => (
                    <button
                      key={basket.id}
                      onClick={() => setSelectedBasket(basket.id)}
                      className={`px-4 py-2 rounded-md text-sm ${
                        selectedBasket === basket.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {basket.name}
                    </button>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">Vous n&apos;avez pas encore créé de panier.</p>
                )}
                
                <button
                  onClick={() => setShowCreateBasket(!showCreateBasket)}
                  className="px-4 py-2 rounded-md text-sm bg-green-600 text-white hover:bg-green-700"
                >
                  {showCreateBasket ? 'Annuler' : 'Nouveau panier'}
                </button>
              </div>
              
              {showCreateBasket && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBasketName}
                    onChange={(e) => setNewBasketName(e.target.value)}
                    placeholder="Nom du panier"
                    className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleCreateBasket}
                    className="px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700"
                  >
                    Créer
                  </button>
                </div>
              )}
            </div>
            
            {/* Verses section */}
            <div className="card">
              <div className="p-4 bg-purple-100 dark:bg-purple-900 border-b border-purple-200 dark:border-purple-800">
                <h2 className="text-xl font-semibold">
                  {selectedSurah 
                    ? `${selectedSurah.name_simple} (${selectedSurah.translated_name.name})` 
                    : 'Sélectionnez une sourate'}
                </h2>
              </div>
              
              {loadingVerses ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
                </div>
              ) : (
                <div className="p-4 overflow-y-auto max-h-[60vh]">
                  {selectedSurah ? (
                    verses.length > 0 ? (
                      <div className="space-y-6">
                        {verses.map((verse) => (
                          <div key={verse.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4 last:border-0">
                            <div className="flex justify-between items-start mb-2">
                              <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-sm px-2 py-1 rounded">
                                {verse.verse_key}
                              </span>
                              <button
                                onClick={() => handleAddToBasket(verse)}
                                className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                                title="Ajouter au panier"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fillRule="evenodd" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                            <p className="arabic text-right text-xl leading-loose mb-2">{verse.text_uthmani}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                        Aucun verset trouvé pour cette sourate.
                      </p>
                    )
                  ) : (
                    <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Veuillez sélectionner une sourate pour voir ses versets.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
