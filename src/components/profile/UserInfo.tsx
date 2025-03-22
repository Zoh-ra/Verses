'use client';

import { User } from '@supabase/supabase-js';
import { UserCircle } from 'lucide-react';
import Image from 'next/image';

type ProfileData = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
};

type UserInfoProps = {
  user: User;
  profile: ProfileData;
  error: string | null;
};

export function UserInfo({ user, profile, error }: UserInfoProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex flex-col items-center">
        {profile.avatar_url ? (
          <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4">
            <Image
              src={profile.avatar_url}
              alt={profile.full_name || profile.username}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <UserCircle size={64} className="text-gray-400 dark:text-gray-500" />
          </div>
        )}
        
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          {profile.full_name || profile.username}
        </h2>
        
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          @{profile.username}
        </p>
        
        {profile.email && (
          <p className="text-gray-600 dark:text-gray-300 mt-4">
            {profile.email}
          </p>
        )}
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error || "Une erreur s'est produite lors du chargement des informations utilisateur."}
        </div>
      )}
      
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p className="mb-1">
            <span className="font-medium">ID: </span> 
            <span className="font-mono text-xs">{user.id}</span>
          </p>
          <p className="mb-1">
            <span className="font-medium">Membre depuis: </span> 
            {new Date(user.created_at || '').toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
