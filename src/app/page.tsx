'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger automatiquement vers la page Quran
    router.push('/quran');
  }, [router]);

  // Cette page ne sera jamais rendue, mais nous la gardons pour le cas où
  // la redirection prend un peu de temps
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
    </div>
  );
}
