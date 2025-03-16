'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, BookOpen } from 'lucide-react';
import Link from 'next/link';
import AddToBasketButton from '@/components/verse/AddToBasketButton';

type Verse = {
  surah_number: number;
  verse_number: number;
  text_arabic: string;
  text_translation: string;
  surah_name: string;
};

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentVerses, setRecentVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Exemple de versets récents (dans un cas réel, cela viendrait d'une API ou d'une base de données)
    const mockRecentVerses: Verse[] = [
      {
        surah_number: 2,
        verse_number: 255,
        text_arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ",
        text_translation: "Allah ! Point de divinité à part Lui, le Vivant, Celui qui subsiste par lui-même. Ni somnolence ni sommeil ne Le saisissent...",
        surah_name: "Al-Baqarah"
      },
      {
        surah_number: 1,
        verse_number: 1,
        text_arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
        text_translation: "Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux.",
        surah_name: "Al-Fatihah"
      },
      {
        surah_number: 36,
        verse_number: 1,
        text_arabic: "يس",
        text_translation: "Ya-Sin.",
        surah_name: "Ya-Sin"
      }
    ];
    
    setRecentVerses(mockRecentVerses);
    setLoading(false);
  }, []);

  const handleSearch = () => {
    // Fonction à implémenter pour la recherche de versets
    alert(`Recherche de: ${searchQuery}`);
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">
        Explorer le Coran
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Recherchez des versets par sourate, numéro de verset ou mots-clés
      </p>

      {/* Barre de recherche */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher des versets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>
          <button 
            className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300"
          >
            <Filter size={20} />
            <span>Filtres</span>
          </button>
          <button 
            onClick={handleSearch}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg"
          >
            <Search size={20} />
            <span>Rechercher</span>
          </button>
        </div>
      </div>

      {/* Navigation rapide par sourate */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Naviguer par sourate
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 12 }, (_, i) => (
            <Link 
              href={`/explore/surah/${i+1}`} 
              key={i}
              className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center transition-colors"
            >
              <div className="text-xl font-bold text-primary mb-1">{i+1}</div>
              <div className="text-sm text-gray-700 dark:text-gray-300">Al-Fatihah</div>
            </Link>
          ))}
          <Link 
            href="/explore/surahs" 
            className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center transition-colors flex items-center justify-center"
          >
            <span className="text-sm text-primary font-medium">Voir toutes les sourates</span>
          </Link>
        </div>
      </section>

      {/* Thèmes populaires */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Thèmes populaires
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {['Prière', 'Patience', 'Miséricorde', 'Gratitude', 'Paradis', 'Pardon'].map((theme, i) => (
            <Link 
              href={`/explore/theme/${theme.toLowerCase()}`} 
              key={i}
              className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-3 transition-colors"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full text-primary">
                <BookOpen size={20} />
              </div>
              <div>
                <div className="font-medium text-gray-800 dark:text-white">{theme}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Versets liés</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Versets récemment consultés */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Versets récemment consultés
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow divide-y divide-gray-200 dark:divide-gray-700">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-gray-500">Chargement des versets...</p>
            </div>
          ) : (
            recentVerses.map((verse, i) => (
              <div key={i} className="p-4 relative">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Sourate {verse.surah_number}, Verset {verse.verse_number}
                  </div>
                  <div className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                    {verse.surah_name}
                  </div>
                </div>
                
                {/* Texte arabe */}
                <p className="text-right font-arabic text-2xl mb-2 text-gray-800 dark:text-gray-200">
                  {verse.text_arabic}
                </p>
                
                {/* Traduction */}
                <p className="text-gray-800 dark:text-gray-200 mb-3">
                  {verse.text_translation}
                </p>
                
                <div className="flex gap-3">
                  <Link 
                    href={`/explore/surah/${verse.surah_number}/${verse.verse_number}`}
                    className="text-xs px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-full transition-colors"
                  >
                    Voir le verset complet
                  </Link>
                  <AddToBasketButton 
                    surahNumber={verse.surah_number} 
                    verseNumber={verse.verse_number} 
                  />
                </div>
              </div>
            ))
          )}
          <div className="p-4 text-center">
            <Link href="/history" className="text-primary hover:underline text-sm font-medium">
              Voir tout l&apos;historique
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
