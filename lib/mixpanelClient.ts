import mixpanel from 'mixpanel-browser';

// Extend Window interface to include mixpanel
declare global {
  interface Window {
    mixpanel: typeof mixpanel;
  }
}

export const initMixpanel = () => {
  if (typeof window !== 'undefined') {
    // Replace 'YOUR_MIXPANEL_TOKEN' with your actual Mixpanel project token
    mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || 'YOUR_MIXPANEL_TOKEN', {
      debug: process.env.NODE_ENV === 'development',
      track_pageview: true,
      persistence: 'localStorage',
    });

    // Make mixpanel available globally
    window.mixpanel = mixpanel;
  }
};

// Export mixpanel for direct usage
export { mixpanel };

// Utility functions for common tracking
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.mixpanel) {
    window.mixpanel.track(eventName, properties);
  }
};

export const identifyUser = (userId: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.mixpanel) {
    window.mixpanel.identify(userId);
    if (properties) {
      window.mixpanel.people.set(properties);
    }
  }
};

export const setUserProperties = (properties: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.mixpanel) {
    window.mixpanel.people.set(properties);
  }
};