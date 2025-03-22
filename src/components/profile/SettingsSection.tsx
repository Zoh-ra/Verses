'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { Sun, Moon, Settings } from 'lucide-react';

type PreferencesData = {
  id: string;
  user_id: string;
  theme: string;
  translation_preference: string;
  display_mode: string;
};

type SettingsSectionProps = {
  preferences: PreferencesData;
  userId: string;
  error: string | null;
};

export function SettingsSection({ preferences, userId, error }: SettingsSectionProps) {
  const [theme, setTheme] = useState(preferences.theme);
  const [translation, setTranslation] = useState(preferences.translation_preference);
  const [displayMode, setDisplayMode] = useState(preferences.display_mode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Vérifier si les préférences existent déjà
      if (preferences.id) {
        // Update existing preferences
        const { error } = await supabase
          .from('preferences')
          .update({
            theme,
            translation_preference: translation,
            display_mode: displayMode,
            updated_at: new Date().toISOString()
          })
          .eq('id', preferences.id);

        if (error) throw error;
      } else {
        // Create new preferences
        const { error } = await supabase
          .from('preferences')
          .insert([{
            user_id: userId,
            theme,
            translation_preference: translation,
            display_mode: displayMode
          }]);

        if (error) throw error;
      }

      setMessage({
        text: 'Préférences mises à jour avec succès!',
        type: 'success'
      });
      
      // Apply theme change to document
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error: unknown) {
      console.error('Error updating preferences:', error);
      setMessage({
        text: error instanceof Error ? error.message : 'Une erreur est survenue lors de la mise à jour des préférences',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
          <Settings size={20} className="mr-2" />
          Paramètres d&apos;affichage
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            Une erreur est survenue lors du chargement de vos préférences. Veuillez réessayer plus tard.
          </div>
        )}
        
        {message && (
          <div 
            className={`mb-4 p-3 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-800 border-l-4 border-green-500' 
                : 'bg-red-100 text-red-800 border-l-4 border-red-500'
            }`}
          >
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Thème
            </label>
            <div className="flex gap-4">
              <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                theme === 'light' 
                  ? 'border-primary bg-primary/10' 
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}>
                <input 
                  type="radio" 
                  name="theme" 
                  value="light"
                  checked={theme === 'light'}
                  onChange={() => setTheme('light')}
                  className="sr-only"
                />
                <Sun size={22} className="mr-2 text-gray-800 dark:text-gray-200" />
                <span className="text-gray-800 dark:text-gray-200">Clair</span>
              </label>
              
              <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                theme === 'dark' 
                  ? 'border-primary bg-primary/10' 
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}>
                <input 
                  type="radio" 
                  name="theme" 
                  value="dark"
                  checked={theme === 'dark'}
                  onChange={() => setTheme('dark')}
                  className="sr-only"
                />
                <Moon size={22} className="mr-2 text-gray-800 dark:text-gray-200" />
                <span className="text-gray-800 dark:text-gray-200">Sombre</span>
              </label>
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="translation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Traduction préférée
            </label>
            <select
              id="translation"
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
            >
              <option value="french">Français</option>
              <option value="english">Anglais</option>
              <option value="arabic_only">Arabe uniquement</option>
              <option value="arabic_french">Arabe et Français</option>
              <option value="arabic_english">Arabe et Anglais</option>
            </select>
          </div>
          
          <div className="mb-6">
            <label htmlFor="displayMode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mode d&apos;affichage
            </label>
            <select
              id="displayMode"
              value={displayMode}
              onChange={(e) => setDisplayMode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
            >
              <option value="standard">Standard</option>
              <option value="compact">Compact</option>
              <option value="reading">Mode lecture</option>
              <option value="large">Grande taille</option>
            </select>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md transition-colors"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Mise à jour...
                </>
              ) : 'Enregistrer les préférences'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
