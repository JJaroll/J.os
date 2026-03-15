'use client';

import Desktop from '@/components/os/Desktop';
import { OSProvider } from '@/context/OSContext';
import BootSequence from '@/components/os/BootSequence';
import { useState, useEffect } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [bootCompleted, setBootCompleted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (sessionStorage.getItem('hasBooted') === 'true') {
      setBootCompleted(true);
    }
  }, []);

  if (!mounted) return null;

  return (
    <OSProvider>
      <main className="w-screen h-screen overflow-hidden">
        {!bootCompleted && (
          <BootSequence onComplete={() => setBootCompleted(true)} />
        )}
        {bootCompleted && <Desktop />}
      </main>
    </OSProvider>
  );
}
