'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initMixpanel } from '@/lib/mixpanelClient';
// import { initMixpanel } from '@/lib/mixpanelClient';

interface MixpanelProviderProps {
  children: React.ReactNode;
}

export default function MixpanelProvider({ children }: MixpanelProviderProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize Mixpanel when the component mounts
    initMixpanel();
  }, []);

  useEffect(() => {
    // Track page views when pathname changes
    if (typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.track('Page View', {
        page: pathname,
        title: document.title,
      });
    }
  }, [pathname]);

  return <>{children}</>;
}