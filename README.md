# Verses - Application Coranique PWA

Verses est une Progressive Web App (PWA) dédiée à l'exploration et la gestion personnalisée des versets du Coran, développée avec Next.js et Supabase.

## Fonctionnalités

- **Authentification Utilisateur** : Inscription, connexion par email/mot de passe ou via OAuth (Google)
- **Exploration du Coran** : Parcourir les sourates et lire les versets
- **Gestion de Paniers** : Créer des collections de versets personnalisées
- **Profil Utilisateur** : Modifier vos informations et préférences
- **Mode Sombre/Clair** : Interface adaptable à vos préférences visuelles
- **Progressive Web App** : Installation sur votre appareil pour un accès hors ligne

## Technologies Utilisées

- **Frontend** : Next.js 14, React, TypeScript, Tailwind CSS
- **Backend** : Supabase (authentification, base de données PostgreSQL)
- **API** : Quran.com API pour les données coraniques
- **PWA** : next-pwa pour les fonctionnalités d'application progressive
- **Thèmes** : next-themes pour la gestion des thèmes clair/sombre

## Prérequis

- Node.js 18.x ou supérieur
- Un compte Supabase pour configurer l'authentification et la base de données

## Installation

1. Cloner le dépôt :
```bash
git clone https://github.com/votreusername/verses.git
cd verses
```

2. Installer les dépendances :
```bash
npm install
# ou
yarn install
```

3. Configurer les variables d'environnement :
   Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :
```
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anonyme_supabase
```

4. Configuration de Supabase :
   - Créez un projet dans Supabase
   - Activez l'authentification par email et OAuth si nécessaire
   - Exécutez le script SQL dans `supabase/migrations/20250316_initial_schema.sql` pour configurer les tables et les politiques de sécurité

5. Lancer le serveur de développement :
```bash
npm run dev
# ou
yarn dev
```

6. Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur pour voir l'application.

## Structure du Projet

```
verses/
  ├── public/              # Fichiers statiques et icônes PWA
  ├── src/
  │   ├── app/             # Routes et pages Next.js
  │   ├── components/      # Composants React réutilisables
  │   ├── services/        # Services d'API et utilitaires
  │   └── utils/           # Fonctions utilitaires
  ├── supabase/            # Migrations et configuration Supabase
  └── ...
```

## Déploiement

L'application peut être déployée sur Vercel en un clic :

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/votreusername/verses)

Assurez-vous de configurer les variables d'environnement sur Vercel.

## Contribuer

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## Licence

MIT
