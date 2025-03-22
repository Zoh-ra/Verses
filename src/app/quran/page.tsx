'use client';

import { useState, useEffect, Suspense } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { getSurahs, getVersesBySurah, Surah, Verse } from '@/services/quranService';
import { supabase } from '@/utils/supabase';
import { useSearchParams } from 'next/navigation';

// Composant de chargement pour Suspense
function QuranPageLoader() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-600">Chargement du Coran...</p>
    </div>
  );
}

// Composant principal qui utilise useSearchParams
function QuranContent() {
  const searchParams = useSearchParams();
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
  const [basketVerses, setBasketVerses] = useState<Record<string, Set<string>>>({});

  // Récupérer l'ID du panier à partir des paramètres d'URL
  useEffect(() => {
    const basketId = searchParams.get('basket');
    if (basketId) {
      setSelectedBasket(basketId);
    }
  }, [searchParams]);

  // Mettre en place une vérification pour stocker le panier sélectionné dans localStorage
  useEffect(() => {
    if (selectedBasket) {
      localStorage.setItem('verses_selected_basket', selectedBasket);
    }
  }, [selectedBasket]);

  // Récupérer le panier précédemment sélectionné lors du chargement initial si aucun panier n'est spécifié dans l'URL
  useEffect(() => {
    if (!searchParams.get('basket')) {
      const savedBasket = localStorage.getItem('verses_selected_basket');
      if (savedBasket) {
        setSelectedBasket(savedBasket);
      }
    }
  }, [searchParams]);

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

  // Récupérer TOUS les versets de TOUS les paniers de l'utilisateur
  useEffect(() => {
    if (userBaskets.length === 0) return;
    
    const fetchAllBasketVerses = async () => {
      try {
        console.log("Chargement des versets pour tous les paniers...");
        
        // Initialiser un nouvel objet pour stocker tous les versets de tous les paniers
        const allBasketsVerses: Record<string, Set<string>> = {};
        
        // Pour chaque panier, récupérer ses versets
        for (const basket of userBaskets) {
          const { data: versesData, error } = await supabase
            .from('basket_verses')
            .select('*')
            .eq('basket_id', basket.id);
            
          if (error) {
            console.error(`Erreur lors de la récupération des versets du panier ${basket.id}:`, error);
            continue; // Passer au panier suivant en cas d'erreur
          }
          
          // Créer un Set des identifiants de versets pour une recherche O(1)
          const versesInBasket = new Set<string>();
          (versesData || []).forEach(verse => {
            const verseKey = `${verse.surah_id}:${verse.verse_number}`;
            versesInBasket.add(verseKey);
          });
          
          console.log(`${versesInBasket.size} versets trouvés dans le panier ${basket.id} (${basket.name})`, 
            Array.from(versesInBasket).join(', '));
          
          // Ajouter ce panier et ses versets à l'objet global
          allBasketsVerses[basket.id] = versesInBasket;
        }
        
        // Mettre à jour l'état avec tous les versets de tous les paniers
        setBasketVerses(allBasketsVerses);
        
      } catch (error) {
        console.error('Error fetching all basket verses:', error);
      }
    };
    
    fetchAllBasketVerses();
  }, [userBaskets]); // Déclencher cette effet quand la liste des paniers change

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
      
      // Vérifier si le verset est déjà dans LE PANIER SÉLECTIONNÉ
      const versesInBasket = basketVerses[selectedBasket] || new Set<string>();
      const isInBasket = versesInBasket.has(verse.verse_key);
      
      if (isInBasket) {
        // Si le verset est déjà dans le panier, le supprimer
        try {
          // Trouver l'ID du verset dans la base de données
          const { data: existingVerse, error: findError } = await supabase
            .from('basket_verses')
            .select('id')
            .eq('basket_id', selectedBasket)
            .eq('surah_id', verse.surah_id)
            .eq('verse_number', verseNumber)
            .single();
            
          if (findError) {
            console.error('Erreur lors de la recherche du verset:', findError);
            throw findError;
          }
            
          if (existingVerse) {
            // Supprimer le verset
            const { error } = await supabase
              .from('basket_verses')
              .delete()
              .eq('id', existingVerse.id);
              
            if (error) throw error;
            
            // Mettre à jour l'état local
            const newVersesInBasket = new Set(versesInBasket);
            newVersesInBasket.delete(verse.verse_key);
            
            setBasketVerses(prev => ({
              ...prev,
              [selectedBasket]: newVersesInBasket
            }));
            
            setMessage({ text: 'Verset retiré du panier', type: 'success' });
            setTimeout(() => setMessage(null), 3000);
          }
        } catch (error) {
          console.error('Error removing verse from basket:', error);
          setMessage({ 
            text: error instanceof Error ? error.message : 'Une erreur est survenue lors de la suppression du verset', 
            type: 'error' 
          });
          setTimeout(() => setMessage(null), 3000);
        }
        
        return;
      }

      // Debug: afficher la structure complète du verset pour comprendre les données
      console.log('Structure complète du verset:', JSON.stringify(verse, null, 2));
      
      // Récupérer surah_id soit depuis la propriété, soit depuis verse_key (format: "1:1")
      let surahId: number;
      if (typeof verse.surah_id === 'number') {
        surahId = verse.surah_id;
      } else {
        // Extraire le numéro de sourate depuis verse_key (format "1:1")
        const surahNumberFromKey = parseInt(verse.verse_key.split(':')[0]);
        if (isNaN(surahNumberFromKey)) {
          throw new Error('Impossible de déterminer l\'identifiant de sourate');
        }
        surahId = surahNumberFromKey;
      }
      
      // S'assurer que l'identifiant de sourate est valide
      if (isNaN(surahId) || surahId <= 0) {
        throw new Error('Identifiant de sourate invalide');
      }

      // Préparation des données à insérer avec typage explicite
      const basketVerseData: {
        basket_id: string;
        surah_id: number;
        verse_number: number;
        text_arabic?: string;
      } = {
        basket_id: selectedBasket,
        surah_id: surahId,
        verse_number: verseNumber
      };

      // Ajouter le texte du verset si disponible
      if (verse.text_uthmani) {
        basketVerseData.text_arabic = verse.text_uthmani;
      }

      console.log('Données à insérer:', basketVerseData);

      // Add verse to the selected basket
      const { error } = await supabase
        .from('basket_verses')
        .insert([basketVerseData]);

      if (error) {
        console.error('Erreur lors de l\'ajout du verset:', error);
        throw error;
      }
      
      // Mettre à jour l'état local
      const newVersesInBasket = new Set(versesInBasket);
      newVersesInBasket.add(verse.verse_key);
      
      setBasketVerses(prev => ({
        ...prev,
        [selectedBasket]: newVersesInBasket
      }));

      setMessage({ text: 'Verset ajouté au panier avec succès', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error adding verse to basket:', error);
      setMessage({ 
        text: error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'ajout du verset', 
        type: 'error' 
      });
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
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Quran</h1>
      
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
                  <div key={basket.id} className="flex">
                    <a
                      href={`/baskets/${basket.id}`}
                      onClick={(e) => {
                        e.preventDefault(); // Empêcher la navigation immédiate
                        setSelectedBasket(basket.id); // Sélectionner d'abord le panier
                        window.location.href = `/baskets/${basket.id}`; // Puis rediriger
                      }}
                      className={`px-4 py-2 rounded-md text-sm ${
                        selectedBasket === basket.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {basket.name}
                    </a>
                  </div>
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
                      {verses.map((verse) => {
                        // Vérifier si le verset est dans un des paniers, et particulièrement dans le panier sélectionné
                        const isInSelectedBasket = selectedBasket && 
                          basketVerses[selectedBasket] && 
                          basketVerses[selectedBasket].has(verse.verse_key);
                          
                        return (
                          <div 
                            key={verse.id} 
                            className={`border-b border-gray-200 dark:border-gray-700 pb-4 mb-4 last:border-0 ${
                              isInSelectedBasket 
                                ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 p-4 rounded-lg transition-colors'
                            } cursor-pointer`}
                            onClick={() => handleAddToBasket(verse)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-sm px-2 py-1 rounded">
                                {verse.verse_key}
                              </span>
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
                                isInSelectedBasket 
                                  ? 'bg-purple-600 text-white transform scale-110'
                                  : 'bg-purple-100 text-purple-600'
                              }`}>
                                {isInSelectedBasket ? '✓' : '+'}
                              </div>
                            </div>
                            <p className="arabic text-right text-xl leading-loose mb-2">{verse.text_uthmani}</p>
                          </div>
                        );
                      })}
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
  );
}

// Export du composant principal enveloppé dans Suspense
export default function QuranPage() {
  return (
    <AppLayout>
      <Suspense fallback={<QuranPageLoader />}>
        <QuranContent />
      </Suspense>
    </AppLayout>
  );
}
