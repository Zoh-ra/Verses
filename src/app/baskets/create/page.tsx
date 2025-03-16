'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import { PlusCircle, ArrowLeft } from 'lucide-react';

export default function CreateBasketPage() {
  const router = useRouter();
  const [basketName, setBasketName] = useState('');
  const [basketDescription, setBasketDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateBasket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!basketName.trim()) {
      setError('Veuillez entrer un nom pour le panier');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/signin');
        return;
      }

      // Create new basket
      const { data: newBasket, error } = await supabase
        .from('baskets')
        .insert([{ 
          name: basketName, 
          description: basketDescription || null,
          is_public: isPublic,
          user_id: user.id 
        }])
        .select()
        .single();

      if (error) throw error;

      // Redirect to the basket page
      router.push(`/baskets/${newBasket.id}`);
      
    } catch (error: any) {
      console.error('Error creating basket:', error);
      setError(error.message || 'Une erreur est survenue lors de la création du panier');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/baskets" 
            className="flex items-center text-primary hover:text-primary-hover"
          >
            <ArrowLeft size={20} className="mr-1" />
            <span>Retour aux paniers</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Créer un nouveau panier</h1>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <form onSubmit={handleCreateBasket}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom du panier *
              </label>
              <input
                id="name"
                type="text"
                value={basketName}
                onChange={(e) => setBasketName(e.target.value)}
                placeholder="Ex: Versets sur la patience"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description (optionnelle)
              </label>
              <textarea
                id="description"
                value={basketDescription}
                onChange={(e) => setBasketDescription(e.target.value)}
                placeholder="Une brève description du contenu de ce panier..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div className="mb-6">
              <div className="flex items-center">
                <input
                  id="is-public"
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="is-public" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Rendre ce panier public (visible par tous les utilisateurs)
                </label>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Link
                href="/baskets"
                className="mr-4 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary flex items-center"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    Création...
                  </>
                ) : (
                  <>
                    <PlusCircle size={18} className="mr-1" />
                    Créer le panier
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 text-blue-700 dark:text-blue-300 p-4 rounded">
          <h3 className="font-medium">Astuces</h3>
          <ul className="mt-2 list-disc list-inside text-sm">
            <li>Vous pourrez ajouter des versets à votre panier depuis la page d&apos;exploration.</li>
            <li>Donnez un nom clair et descriptif à votre panier pour le retrouver facilement.</li>
            <li>Vous pourrez modifier ou supprimer votre panier à tout moment.</li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
}
