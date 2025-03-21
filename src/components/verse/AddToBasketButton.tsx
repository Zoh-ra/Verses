'use client';

import { useState, useEffect, useCallback } from 'react';
import { BookmarkPlus, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

type Basket = {
  id: string;
  name: string;
  user_id: string;
};

type AddToBasketButtonProps = {
  surahNumber: number;
  verseNumber: number;
};

export default function AddToBasketButton({ surahNumber, verseNumber }: AddToBasketButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [baskets, setBaskets] = useState<Basket[]>([]);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const router = useRouter();
  const { user, refreshSession } = useAuth();

  // Charger les paniers de l'utilisateur (défini avec useCallback pour éviter les dépendances cycliques)
  const loadUserBaskets = useCallback(async () => {
    if (!user) {
      await refreshSession();  // Tenter de récupérer une session valide
      if (!user) {
        setMessage({
          text: 'Veuillez vous connecter pour utiliser cette fonctionnalité',
          type: 'error'
        });
        setShowSelector(false);
        setTimeout(() => router.push('/auth/signin'), 2000);
        return;
      }
    }
    
    setLoading(true);
    
    try {
      console.log("Chargement des paniers pour l'utilisateur:", user.id);
      
      // Récupérer les paniers de l'utilisateur
      const { data, error } = await supabase
        .from('baskets')
        .select('id, name, user_id')
        .eq('user_id', user.id);
        
      if (error) {
        console.error('Erreur lors de la récupération des paniers:', error);
        setMessage({
          text: 'Impossible de charger vos paniers',
          type: 'error'
        });
        setTimeout(() => setMessage(null), 3000);
      } else {
        console.log("Paniers récupérés:", data?.length || 0);
        setBaskets(data || []);
      }
    } catch (err) {
      console.error('Exception lors du chargement des paniers:', err);
      setMessage({
        text: 'Une erreur s\'est produite. Veuillez réessayer.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [refreshSession, router, user]);

  // Vérifier la session utilisateur quand le sélecteur est ouvert
  useEffect(() => {
    if (showSelector) {
      loadUserBaskets();
    }
  }, [showSelector, loadUserBaskets]);

  // Charger les paniers lorsque l'utilisateur clique sur le bouton
  const handleOpenSelector = async () => {
    setShowSelector(true);
  };
  
  // Fonction directe pour ajouter un verset à un panier
  const addVerseToBasket = async (basketId: string) => {
    setLoading(true);
    
    try {
      if (!user) {
        await refreshSession();  // Tenter de récupérer une session valide
        if (!user) {
          setMessage({
            text: 'Votre session a expiré. Veuillez vous reconnecter.',
            type: 'error'
          });
          setShowSelector(false);
          setTimeout(() => router.push('/auth/signin'), 2000);
          return;
        }
      }

      console.log("Tentative d'ajout du verset", surahNumber, verseNumber, "au panier", basketId);
      
      // Vérifier si le panier appartient bien à l'utilisateur
      const { error: basketError } = await supabase
        .from('baskets')
        .select('id')
        .eq('id', basketId)
        .eq('user_id', user.id)
        .single();
      
      if (basketError) {
        console.error('Erreur lors de la vérification du panier:', basketError);
        setMessage({
          text: 'Ce panier ne vous appartient pas ou n\'existe pas',
          type: 'error'
        });
        return;
      }
      
      // Ajouter le verset au panier
      const { error } = await supabase
        .from('basket_verses')
        .insert({
          basket_id: basketId,
          surah_id: surahNumber,
          verse_number: verseNumber
        });
      
      if (error) {
        console.error('Erreur détaillée:', error);
        console.log('Code:', error.code);
        console.log('Message:', error.message);
        console.log('Détails:', error.details);
        
        // Afficher un message d'erreur adapté
        if (error.code === '23505') {
          setMessage({
            text: 'Ce verset est déjà dans ce panier',
            type: 'error'
          });
        } else if (error.code === '42501') {
          setMessage({
            text: 'Vous n\'avez pas les permissions nécessaires pour ce panier',
            type: 'error'
          });
        } else {
          setMessage({
            text: `Erreur: ${error.message || 'Problème lors de l\'ajout du verset'}`,
            type: 'error'
          });
        }
      } else {
        console.log("Verset ajouté avec succès");
        setMessage({
          text: 'Verset ajouté avec succès!',
          type: 'success'
        });
        // Fermer le sélecteur après un ajout réussi
        setShowSelector(false);
      }
    } catch (err) {
      console.error('Exception lors de l\'ajout du verset:', err);
      setMessage({
        text: 'Une erreur inattendue s\'est produite lors de l\'ajout du verset',
        type: 'error'
      });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };
  
  return (
    <div className="relative">
      {/* Bouton principal */}
      <button 
        onClick={handleOpenSelector}
        className="text-xs px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-full transition-colors flex items-center gap-1"
      >
        <BookmarkPlus size={14} />
        Ajouter à un panier
      </button>
      
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
      
      {/* Sélecteur de panier */}
      {showSelector && (
        <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-10 w-64">
          <div className="flex justify-between items-center mb-2 p-2">
            <h4 className="font-medium text-gray-800 dark:text-white">Choisir un panier</h4>
            <button 
              onClick={() => setShowSelector(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X size={18} />
            </button>
          </div>
          
          {loading ? (
            <div className="p-4 text-center">
              <div className="inline-block h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : baskets.length === 0 ? (
            <div className="p-2 text-center text-sm text-gray-500">
              <p className="mb-2">Vous n&apos;avez pas encore de paniers</p>
              <Link 
                href="/baskets/create" 
                className="text-primary hover:underline flex items-center justify-center gap-1"
              >
                <Plus size={16} />
                Créer un panier
              </Link>
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto">
              {baskets.map(basket => (
                <button
                  key={basket.id}
                  onClick={() => addVerseToBasket(basket.id)}
                  disabled={loading}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center justify-between"
                >
                  <span>{basket.name}</span>
                  <Plus size={16} className="text-primary" />
                </button>
              ))}
              <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                <Link 
                  href="/baskets/create" 
                  className="w-full text-left px-3 py-2 text-sm text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center gap-1"
                >
                  <Plus size={16} />
                  Créer un nouveau panier
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
