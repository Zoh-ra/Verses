'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  useEffect(() => {
    // Vérifier si l'utilisateur est en mode sombre
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  // Définition des liens de navigation
  const navigationLinks = [
    { name: 'Quran', href: '/quran', requireAuth: false },
    { name: 'Mes Paniers', href: '/baskets', requireAuth: true },
    { name: 'Profil', href: '/profile', requireAuth: true },
  ];
  
  // Filtrer les liens en fonction de l'état de connexion
  const visibleLinks = navigationLinks.filter(link => !link.requireAuth || !!user);
  
  // Vérifier si un lien est actif
  const isActive = (href: string) => {
    if (!pathname) return false;
    
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    await signOut();
  };
  
  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-extrabold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                Verses
              </span>
            </Link>
          </div>
          
          {/* Navigation sur grand écran */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {visibleLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-primary/10 text-primary dark:text-primary'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun size={20} className="text-yellow-500" />
              ) : (
                <Moon size={20} className="text-gray-700" />
              )}
            </button>
            
            {!user ? (
              <div className="flex space-x-2">
                <Link 
                  href="/auth/signin"
                  className="px-4 py-2 text-sm font-medium rounded-md text-primary border border-primary hover:bg-primary/5 transition-colors"
                >
                  Connexion
                </Link>
                <Link 
                  href="/auth/signup"
                  className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-white hover:bg-primary-hover transition-colors"
                >
                  Inscription
                </Link>
              </div>
            ) : (
              <button 
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Déconnexion
              </button>
            )}
          </div>
          
          {/* Bouton menu sur mobile */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none mr-2"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun size={20} className="text-yellow-500" />
              ) : (
                <Moon size={20} className="text-gray-700" />
              )}
            </button>
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
              aria-label="Main menu"
            >
              {isOpen ? (
                <X size={24} aria-hidden="true" />
              ) : (
                <Menu size={24} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Menu mobile */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {visibleLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(link.href)
                    ? 'bg-primary/10 text-primary dark:text-primary'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            
            {!user ? (
              <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link 
                  href="/auth/signin"
                  className="block w-full px-4 py-2 text-center font-medium rounded-md text-primary border border-primary hover:bg-primary/5 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Connexion
                </Link>
                <Link 
                  href="/auth/signup"
                  className="block w-full px-4 py-2 text-center font-medium rounded-md bg-primary text-white hover:bg-primary-hover transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Inscription
                </Link>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button 
                  onClick={(e) => {
                    setIsOpen(false);
                    handleSignOut(e);
                  }}
                  className="block w-full px-4 py-2 text-center font-medium rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
