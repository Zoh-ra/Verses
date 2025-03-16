import Link from 'next/link';
import { Book, Bookmark, Search, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-primary/20 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
            Bienvenue sur Verses
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-gray-700 dark:text-gray-300">
            Explorez, organisez et partagez vos versets préférés du Coran
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/explore" 
              className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <Search size={20} />
              Explorer
            </Link>
            <Link 
              href="/auth/signup" 
              className="px-6 py-3 bg-white dark:bg-gray-800 text-primary border border-primary hover:bg-primary/5 dark:hover:bg-primary/10 font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <ArrowRight size={20} />
              Commencer
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-white">
            Fonctionnalités principales
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 flex items-center justify-center bg-primary/10 text-primary rounded-full mb-4">
                <Search size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">Explorer le Coran</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Parcourez le Coran avec une interface intuitive, recherchez par mots-clés ou par thèmes.
              </p>
              <Link href="/explore" className="mt-4 inline-block text-primary hover:underline font-medium">
                Explorer maintenant
              </Link>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 flex items-center justify-center bg-primary/10 text-primary rounded-full mb-4">
                <Bookmark size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">Créer des paniers</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Organisez vos versets préférés dans des paniers thématiques personnalisés.
              </p>
              <Link href="/baskets" className="mt-4 inline-block text-primary hover:underline font-medium">
                Mes paniers
              </Link>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 flex items-center justify-center bg-primary/10 text-primary rounded-full mb-4">
                <Book size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">Lecture personnalisée</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Lisez le Coran avec différentes traductions et options d&#39;affichage adaptées à vos préférences.
              </p>
              <Link href="/profile" className="mt-4 inline-block text-primary hover:underline font-medium">
                Mes préférences
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-primary/5 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
            Prêt à commencer ?
          </h2>
          <p className="text-lg mb-8 text-gray-600 dark:text-gray-400">
            Créez un compte gratuitement et commencez à explorer le Coran dès aujourd&#39;hui.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/auth/signup" 
              className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors"
            >
              Créer un compte
            </Link>
            <Link 
              href="/auth/signin" 
              className="px-6 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 font-medium rounded-lg transition-colors"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
