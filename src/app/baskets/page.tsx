'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { PlusCircle, Trash2, AlertTriangle, Bookmark } from 'lucide-react';

interface Basket {
  id: string;
  name: string;
  created_at: string;
  user_id: string;
  verse_count?: number | null;
}

export default function BasketsPage() {
  const [baskets, setBaskets] = useState<Basket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBasketName, setNewBasketName] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const { user, refreshSession } = useAuth();

  // Fonction pour récupérer les paniers de l'utilisateur
  const fetchBaskets = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // S'assurer que l'utilisateur est connecté
      if (!user) {
        // Attendre explicitement le rafraîchissement de la session
        await refreshSession();
        
        // Obtenir directement l'utilisateur de Supabase
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (!currentUser) {
          console.error('Aucun utilisateur connecté');
          setMessage({
            text: 'Veuillez vous connecter pour voir vos paniers',
            type: 'error'
          });
          setIsLoading(false);
          return;
        }
        
        // Utiliser l'utilisateur récupéré directement de Supabase
        console.log("Récupération des paniers pour l'utilisateur:", currentUser.id);

        // Get all baskets for the user
        const { data: basketsData, error: basketsError } = await supabase
          .from('baskets')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (basketsError) {
          console.error('Erreur lors de la récupération des paniers:', basketsError);
          throw basketsError;
        }

        console.log("Paniers récupérés:", basketsData?.length || 0);

        // For each basket, get the count of verses
        const basketsWithCount = await Promise.all(
          (basketsData || []).map(async (basket: Basket) => {
            const { count, error: countError } = await supabase
              .from('basket_verses')
              .select('*', { count: 'exact', head: true })
              .eq('basket_id', basket.id);
            
            if (countError) {
              console.error('Erreur lors du comptage des versets:', countError);
              return { ...basket, verse_count: null };
            }
            
            return { ...basket, verse_count: count };
          })
        );
        
        setBaskets(basketsWithCount);
        
      } else {
        // L'utilisateur est déjà connecté, continuer normalement
        console.log("Récupération des paniers pour l'utilisateur:", user.id);

        // Get all baskets for the user
        const { data: basketsData, error: basketsError } = await supabase
          .from('baskets')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (basketsError) {
          console.error('Erreur lors de la récupération des paniers:', basketsError);
          throw basketsError;
        }

        console.log("Paniers récupérés:", basketsData?.length || 0);

        // For each basket, get the count of verses
        const basketsWithCount = await Promise.all(
          (basketsData || []).map(async (basket: Basket) => {
            const { count, error: countError } = await supabase
              .from('basket_verses')
              .select('*', { count: 'exact', head: true })
              .eq('basket_id', basket.id);
            
            if (countError) {
              console.error('Erreur lors du comptage des versets:', countError);
              return { ...basket, verse_count: null };
            }
            
            return { ...basket, verse_count: count };
          })
        );
        
        setBaskets(basketsWithCount);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des paniers:', error);
      setMessage({
        text: 'Erreur lors de la récupération de vos paniers',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, refreshSession]);

  useEffect(() => {
    fetchBaskets();
  }, [fetchBaskets]);

  const handleCreateBasket = async () => {
    if (!newBasketName.trim()) {
      setMessage({
        text: 'Veuillez entrer un nom pour votre panier',
        type: 'error'
      });
      return;
    }

    try {
      setIsLoading(true);
      
      if (!user) {
        await refreshSession();
        if (!user) {
          setMessage({
            text: 'Veuillez vous connecter pour créer un panier',
            type: 'error'
          });
          return;
        }
      }

      const { error } = await supabase
        .from('baskets')
        .insert([{ name: newBasketName, user_id: user.id }]);

      if (error) {
        throw error;
      }

      setMessage({
        text: 'Panier créé avec succès!',
        type: 'success'
      });
      setNewBasketName('');
      setShowCreateForm(false);
      fetchBaskets();
    } catch (error) {
      console.error('Erreur lors de la création du panier:', error);
      setMessage({
        text: 'Erreur lors de la création du panier',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBasket = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce panier ?')) {
      return;
    }

    try {
      setIsLoading(true);
      
      if (!user) {
        await refreshSession();
        if (!user) {
          setMessage({
            text: 'Veuillez vous connecter pour supprimer un panier',
            type: 'error'
          });
          return;
        }
      }

      const { error } = await supabase
        .from('baskets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setMessage({
        text: 'Panier supprimé avec succès!',
        type: 'success'
      });
      fetchBaskets();
    } catch (error) {
      console.error('Erreur lors de la suppression du panier:', error);
      setMessage({
        text: 'Erreur lors de la suppression du panier',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mes Paniers</h1>
      
      {message && (
        <div 
          className={`p-4 rounded-md mb-6 ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 border-l-4 border-green-500' 
              : 'bg-red-100 text-red-800 border-l-4 border-red-500'
          }`}
        >
          {message.text}
        </div>
      )}
      
      <div className="mb-8">
        {showCreateForm ? (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Créer un nouveau panier</h2>
            <div className="flex gap-4">
              <input
                type="text"
                value={newBasketName}
                onChange={(e) => setNewBasketName(e.target.value)}
                placeholder="Nom du panier"
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={handleCreateBasket}
                disabled={isLoading}
                className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Création...' : 'Créer'}
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 rounded-md transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-md transition-colors"
          >
            <PlusCircle size={20} />
            Créer un nouveau panier
          </button>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="loader"></div>
        </div>
      ) : baskets.length === 0 ? (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 text-yellow-800 dark:text-yellow-200 p-6 rounded-lg flex flex-col items-center text-center">
          <AlertTriangle size={48} className="mb-4 text-yellow-500" />
          <h3 className="text-xl font-semibold mb-2">Aucun panier trouvé</h3>
          <p className="mb-4">Vous n&apos;avez pas encore créé de paniers. Créez votre premier panier pour commencer à sauvegarder des versets.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {baskets.map((basket) => (
            <div 
              key={basket.id} 
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">{basket.name}</h3>
                <button 
                  onClick={() => handleDeleteBasket(basket.id)} 
                  className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                  aria-label="Supprimer le panier"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                <Bookmark size={16} className="mr-2" />
                <span>{basket.verse_count ?? 0} versets</span>
              </div>
              
              <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href={`/baskets/${basket.id}`}
                  className="w-full inline-block text-center px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-md transition-colors"
                >
                  Voir les versets
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
