-- Script complet pour la structure de la base de données Verses
-- Date: 2025-03-16

-- Activer l'extension UUID si elle n'est pas déjà activée
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table profiles (si elle n'existe pas déjà)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  preferred_language TEXT DEFAULT 'fr',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS sur profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques (ne génère pas d'erreur si elles n'existent pas)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
END
$$;

-- Créer les nouvelles politiques
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Table baskets (si elle n'existe pas déjà)
CREATE TABLE IF NOT EXISTS public.baskets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS sur baskets
ALTER TABLE baskets ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques (ne génère pas d'erreur si elles n'existent pas)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view their own baskets" ON baskets;
    DROP POLICY IF EXISTS "Users can create their own baskets" ON baskets;
    DROP POLICY IF EXISTS "Users can update their own baskets" ON baskets;
    DROP POLICY IF EXISTS "Users can delete their own baskets" ON baskets;
END
$$;

-- Créer les nouvelles politiques
CREATE POLICY "Users can view their own baskets" ON baskets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own baskets" ON baskets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own baskets" ON baskets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own baskets" ON baskets
  FOR DELETE USING (auth.uid() = user_id);

-- Supprimer la table basket_verses si elle existe déjà pour la recréer proprement
DROP TABLE IF EXISTS public.basket_verses;

-- Créer la table basket_verses avec la structure correcte
CREATE TABLE public.basket_verses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  basket_id UUID REFERENCES public.baskets(id) ON DELETE CASCADE NOT NULL,
  surah_id INTEGER NOT NULL,
  verse_number INTEGER NOT NULL,
  text_arabic TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(basket_id, surah_id, verse_number)
);

-- Activer RLS sur basket_verses
ALTER TABLE basket_verses ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques (ne génère pas d'erreur si elles n'existent pas)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view verses from their own baskets" ON basket_verses;
    DROP POLICY IF EXISTS "Users can add verses to their own baskets" ON basket_verses;
    DROP POLICY IF EXISTS "Users can delete verses from their own baskets" ON basket_verses;
END
$$;

-- Créer les nouvelles politiques
CREATE POLICY "Users can view verses from their own baskets" ON basket_verses
  FOR SELECT USING (
    basket_id IN (
      SELECT id FROM baskets WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add verses to their own baskets" ON basket_verses
  FOR INSERT WITH CHECK (
    basket_id IN (
      SELECT id FROM baskets WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete verses from their own baskets" ON basket_verses
  FOR DELETE USING (
    basket_id IN (
      SELECT id FROM baskets WHERE user_id = auth.uid()
    )
  );

-- Fonction pour gérer la création de nouveaux utilisateurs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, email)
  VALUES (
    NEW.id,
    SPLIT_PART(NEW.email, '@', 1),
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger pour les nouveaux utilisateurs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
