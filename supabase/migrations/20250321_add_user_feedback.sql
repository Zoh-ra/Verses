-- Migration pour ajouter la table user_feedback
-- Date: 2025-03-21

-- Table pour les commentaires et retours utilisateurs
CREATE TABLE IF NOT EXISTS public.user_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'implemented', 'rejected'))
);

-- Activer RLS sur user_feedback
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Créer les politiques d'accès
CREATE POLICY "Users can view their own feedback" ON user_feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own feedback" ON user_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Donner accès aux admins (à implémenter selon votre structure de rôles)
-- CREATE POLICY "Admins can view all feedback" ON user_feedback
--   FOR SELECT USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
